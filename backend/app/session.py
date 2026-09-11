"""Session state: the authoritative record of one student attempt."""

from __future__ import annotations

import asyncio
import json
import time
from typing import Dict, List, Optional

from . import coach, llm
from .scenarios import Scenario, get_scenario, list_scenarios
from .scoring import CODE_DIM, DIMENSIONS, score_session

# Which competency dimension each step primarily develops — used to route
# mastery updates so the coach's scaffolding adapts in the right dimension.
STEP_DIM = {
    "electrical-switch": {
        "ppe": "PPE & instrument discipline",
        "prove_tester": "PPE & instrument discipline",
        "test_live": "Hazard control & isolation",
        "isolate": "Hazard control & isolation",
        "deenergize": "Hazard control & isolation",
        "loto": "Hazard control & isolation",
        "verify_dead": "Hazard control & isolation",
        "reprove": "PPE & instrument discipline",
        "remove_cover": "Hazard control & isolation",
        "remove_switch": "Procedural sequencing",
        "strip": "Workmanship & verification",
        "terminate": "Code & specification compliance",
        "tighten": "Workmanship & verification",
        "restore_cover": "Procedural sequencing",
        "remove_loto": "Hazard control & isolation",
        "energize": "Procedural sequencing",
        "function_test": "Workmanship & verification",
    },
    "plumbing-ptrap": {
        "ppe": "PPE & instrument discipline",
        "isolate": "Hazard control & isolation",
        "drain": "Procedural sequencing",
        "remove": "Procedural sequencing",
        "inspect": "Workmanship & verification",
        "dryfit": "Procedural sequencing",
        "align": "Workmanship & verification",
        "tighten": "Workmanship & verification",
        "restore": "Workmanship & verification",
        "cleanup": "Procedural sequencing",
    },
}

MAX_REPEATS_PER_CODE = 2


class Session:
    def __init__(self, sid: str, scenario: Scenario):
        self.id = sid
        self.scenario = scenario
        self.flags = scenario.initial_flags()
        self.violations: List[Dict] = []
        self.events: List[Dict] = []
        self.log: List[Dict] = []
        self.hints_used = 0
        self.rework = 0
        self.hint_level = 0
        self.created_at = time.time()
        self.last_progress = time.time()
        self.mastery: Dict[str, float] = {d: 0.62 for d in DIMENSIONS}
        # Steps are sticky: once a step is genuinely performed it stays performed,
        # even if a later action changes the flag that proved it (e.g. closing
        # the panel door does not undo "isolate the circuit").
        self.completed_steps: set = set()
        self.ws = None
        self.completed = False
        self.report: Optional[Dict] = None
        self._queued_observation = False

    # -- basic ---------------------------------------------------------

    def elapsed_s(self) -> float:
        return time.time() - self.created_at

    def idle_s(self) -> float:
        return time.time() - self.last_progress

    def done_steps(self) -> List[str]:
        return [s.id for s in self.scenario.steps if s.id in self.completed_steps]

    def _refresh_steps(self) -> set:
        """Re-evaluate every step predicate and fold results into the sticky set."""
        newly = set()
        for s in self.scenario.steps:
            if s.id not in self.completed_steps and self.scenario.step_done(s.id, self.flags):
                self.completed_steps.add(s.id)
                newly.add(s.id)
        return newly

    def dim_for_step(self, step_id: str) -> str:
        return STEP_DIM.get(self.scenario.id, {}).get(step_id, "Procedural sequencing")

    def reset(self):
        self.__init__(self.id, self.scenario)  # noqa: intentional full reset

    # -- action handling -----------------------------------------------

    def apply(self, action: str) -> List[Dict]:
        if self.completed:
            return [{
                "severity": "info", "code": "done", "title": "Task already complete",
                "message": "Reset the attempt to run it again.", "weight": 0,
                "progress": False, "ts": time.time(),
            }]

        before = set(self.done_steps())
        events = self.scenario.handle(self, action) or []
        out: List[Dict] = []

        for e in events:
            sev = e.get("severity")
            self.events.append(e)
            if sev in ("minor", "major", "critical"):
                repeats = sum(1 for v in self.violations if v["code"] == e["code"])
                if repeats < MAX_REPEATS_PER_CODE:
                    self.violations.append(e)
                    dim = CODE_DIM.get(e["code"], "Procedural sequencing")
                    self.mastery[dim] = max(0.05, self.mastery[dim] - e.get("weight", 6) / 45.0)
                else:
                    e = dict(e)
                    e["message"] += " (repeat — already recorded in your assessment)"
            out.append(e)

        newly = self._refresh_steps()
        advanced = newly or any(e.get("progress") for e in events)
        if advanced:
            self.last_progress = time.time()
            self.hint_level = 0
            for sid in newly:
                dim = self.dim_for_step(sid)
                self.mastery[dim] = min(0.98, self.mastery[dim] + 0.07)

        self.log.append({"t": round(self.elapsed_s(), 1), "action": action,
                         "codes": [e.get("code") for e in events]})

        if not self.completed and self.scenario.is_complete(self.flags):
            self._finalise()
        return out

    def _finalise(self):
        self.completed = True
        self._refresh_steps()
        for e in self.scenario.final_checks(self):
            self.violations.append(e)
            self.events.append(e)
            dim = CODE_DIM.get(e["code"], "Procedural sequencing")
            self.mastery[dim] = max(0.05, self.mastery[dim] - e.get("weight", 6) / 45.0)
        self.report = score_session(self)

    def request_hint(self, explicit: bool = True) -> Optional[Dict]:
        return coach.build_hint(self, explicit=explicit)

    # -- serialisation --------------------------------------------------

    def state(self) -> Dict:
        sc = self.scenario
        done = set(self.done_steps())
        active = None
        steps = []
        for s in sc.steps:
            if s.id in done:
                status = "complete"
            elif active is None:
                status, active = "active", s.id
            else:
                status = "pending"
            steps.append({"id": s.id, "title": s.title, "status": status})

        deduction = sum(v.get("weight", 0) for v in self.violations)
        par = max(30, sc.par_time_s)
        elapsed = self.elapsed_s()
        over = max(0.0, elapsed / par - 1.0)
        eff = max(0.0, 100.0 - min(40.0, over * 60.0) - 3.0 * self.hints_used
                  - 2.5 * self.rework - 4.0 * len(self.violations))
        return {
            "sessionId": self.id,
            "scenario": sc.meta(),
            "steps": steps,
            "activeStep": active,
            "flags": self.flags,
            "progress": round(100.0 * len(done) / max(1, len(sc.steps)), 1),
            "elapsedS": round(elapsed, 1),
            "parS": par,
            "safety": round(max(0, 100 - deduction), 1),
            "efficiency": round(eff, 1),
            "violations": {
                "critical": sum(1 for v in self.violations if v["severity"] == "critical"),
                "major": sum(1 for v in self.violations if v["severity"] == "major"),
                "minor": sum(1 for v in self.violations if v["severity"] == "minor"),
                "list": [
                    {"code": v["code"], "severity": v["severity"], "title": v["title"],
                     "reference": v.get("reference", "")}
                    for v in self.violations
                ],
            },
            "mastery": {k: round(v, 2) for k, v in self.mastery.items()},
            "hintsUsed": self.hints_used,
            "rework": self.rework,
            "complete": self.completed,
        }

    # -- transport ------------------------------------------------------

    async def send(self, msg: Dict):
        if self.ws is None:
            return
        try:
            await self.ws.send_json(msg)
        except Exception:
            self.ws = None

    async def send_state(self):
        await self.send({"type": "state", "payload": self.state()})


class SessionManager:
    def __init__(self):
        self.sessions: Dict[str, Session] = {}
        self._task: Optional[asyncio.Task] = None

    def create(self, scenario_id: str) -> Session:
        import uuid
        sid = uuid.uuid4().hex[:10]
        s = Session(sid, get_scenario(scenario_id))
        self.sessions[sid] = s
        return s

    def get(self, sid: str) -> Optional[Session]:
        return self.sessions.get(sid)

    def catalog(self):
        return [sc.meta() for sc in list_scenarios()]

    # -- message pump ---------------------------------------------------

    async def handle(self, s: Session, msg: Dict):
        mtype = msg.get("type")
        if mtype == "action":
            action = msg.get("action", "")
            events = s.apply(action)
            enriched = []
            for e in events:
                ce = coach.narrate(e, s)
                if llm.enabled():
                    voiced = await llm.revoice(e)
                    if voiced:
                        ce["body"] = voiced
                        ce["voiced"] = True
                enriched.append(ce)
                await s.send({"type": "coach", "payload": ce})
            if not enriched:
                await s.send({"type": "coach", "payload": coach.narrate(
                    {"severity": "info", "title": "Nothing happened",
                     "message": "That action had no effect here."}, s)})
            await s.send_state()
            if s.completed and s.report:
                report = dict(s.report)
                narrative = await llm.report_narrative(report)
                report["narrative"] = narrative
                await s.send({"type": "complete", "payload": report})

        elif mtype == "hint":
            h = s.request_hint(explicit=True)
            if h:
                await s.send({"type": "coach", "payload": h})
            else:
                await s.send({"type": "coach", "payload": coach.narrate(
                    {"severity": "info", "title": "Nothing to hint",
                     "message": "Every step in this scenario is already complete."}, s)})
            await s.send_state()

        elif mtype == "reset":
            s.reset()
            await s.send({"type": "coach", "payload": coach.greeting(s.scenario)})
            await s.send_state()

        elif mtype == "ping":
            await s.send_state()

        else:
            await s.send({"type": "error", "payload": {"message": f"Unknown type {mtype}"}})

    # -- background: adaptive idle coaching ----------------------------

    async def start(self):
        if self._task is None:
            self._task = asyncio.create_task(self._tick())

    async def stop(self):
        if self._task:
            self._task.cancel()
            self._task = None

    async def _tick(self):
        while True:
            await asyncio.sleep(2.0)
            now = time.time()
            for s in list(self.sessions.values()):
                if s.ws is None or s.completed:
                    continue
                try:
                    if s.idle_s() > coach.hint_delay(s):
                        h = s.request_hint(explicit=False)
                        if h:
                            h["title"] = "Coach check-in — " + h["title"]
                            await s.send({"type": "coach", "payload": h})
                            s.last_progress = now  # avoid immediate re-fire
                            await s.send_state()
                            continue
                    obs = coach.stall_observation(s)
                    if obs and not s._queued_observation:
                        s._queued_observation = True
                        await s.send({"type": "coach", "payload": obs})
                except Exception:
                    continue
