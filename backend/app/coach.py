"""The AI coach.

Design principles (scenario-based learning + immediate feedback loops):

1. **Feedback is immediate and causal.** Every action produces a response that
   names *what happened*, *why it matters*, and *what to do next*. No dead ends.
2. **Hints escalate, they don't arrive fully formed.** Level 1 = orienting
   question, level 2 = specific instruction, level 3 = worked example. The
   student who can self-correct should be allowed to.
3. **Scaffolding is adaptive.** A running mastery estimate per competency
   dimension shortens the idle delay for a student who is struggling and
   lengthens it for one who is flowing (desirable difficulty).
4. **The coach never does the task for the student** unless the student has
   stalled at level 3.
"""

from __future__ import annotations

import time
import uuid
from typing import Dict, List, Optional

from .scoring import CODE_DIM


def _entry(severity: str, title: str, body: str, why="", hint="", reference="", **kw) -> Dict:
    d = {
        "id": str(uuid.uuid4()),
        "role": "coach",
        "severity": severity,
        "title": title,
        "body": body,
        "why": why,
        "hint": hint,
        "reference": reference,
        "ts": time.time(),
    }
    d.update(kw)
    return d


def greeting(scenario) -> Dict:
    return _entry(
        "info",
        f"Welcome — {scenario.title}",
        f"{scenario.blurb}\n\nI'm your coach. I'll watch your method, not just your "
        "result: safety and sequence carry more weight than speed. If you get stuck, "
        "ask me for a hint — I'll start with a question rather than the answer.",
        why="This task is assessed on method. Speed is a minor component of the grade.",
        hint="Start by looking at the task list on the left, then interact with the "
             "objects in the bay.",
        reference=", ".join(scenario.standards),
    )


def narrate(event: Dict, session) -> Dict:
    """Convert a scenario event into a coach utterance."""
    sev = event.get("severity", "info")
    title = event.get("title", "")
    body = event.get("message", "")
    prefix = {
        "critical": "STOP — critical safety breach. ",
        "major": "Correction — ",
        "minor": "Careful — ",
    }.get(sev, "")
    return _entry(
        sev,
        title,
        prefix + body,
        why=event.get("why", ""),
        hint=event.get("hint", ""),
        reference=event.get("reference", ""),
        code=event.get("code", ""),
    )


# ---------------------------------------------------------------------------
# Adaptive hinting
# ---------------------------------------------------------------------------

# Base idle delay before the coach intervenes, in seconds, by hint level.
BASE_DELAY = {"1": 26.0, "2": 58.0, "3": 95.0}


def current_step(scenario, flags) -> Optional[str]:
    for s in scenario.steps:
        if not scenario.step_done(s.id, flags):
            return s.id
    return None


def hint_delay(session) -> float:
    """Struggling students get coached sooner; flowing students get thinking time."""
    sid = current_step(session.scenario, session.flags)
    mastery = 0.6
    if sid:
        dim = session.dim_for_step(sid)
        mastery = session.mastery.get(dim, 0.6)
    # mastery 0 -> 0.6x delay, mastery 1 -> 1.5x delay
    factor = 0.6 + mastery * 0.9
    return BASE_DELAY[str(session.hint_level + 1)] * factor


def build_hint(session, explicit: bool = False) -> Optional[Dict]:
    sc = session.scenario
    sid = current_step(sc, session.flags)
    if sid is None:
        return None
    step = next((s for s in sc.steps if s.id == sid), None)
    if step is None or not step.hints:
        return None
    level = min(session.hint_level, len(step.hints) - 1)
    text = step.hints[level]
    session.hint_level = min(3, session.hint_level + 1)
    session.hints_used += 1
    return _entry(
        "hint",
        f"Hint {level + 1} — {step.title}",
        text,
        why=step.why if level >= 1 else "",
        hint=step.hints[min(level + 1, len(step.hints) - 1)] if level + 1 < len(step.hints) else "",
        reference=step.reference if level >= 2 else "",
        stepId=step.id,
        level=level + 1,
        explicit=explicit,
    )


def stall_observation(session) -> Optional[Dict]:
    """Deliberate, non-hint intervention when a student is looping on errors."""
    recent = [e for e in session.events[-6:] if e.get("severity") in ("major", "minor")]
    if len(recent) < 3:
        return None
    codes = {e.get("code") for e in recent}
    if len(codes) > 2:
        return None
    return _entry(
        "info",
        "Let's pause for a second",
        "You've hit the same problem a few times. Rather than trying another "
        "variation, go back one step and say out loud what state the system needs "
        "to be in before this action is safe. Then check that state before you act.",
        why="Repeated failure on one step usually means a missing precondition, "
            "not a lack of dexterity.",
    )
