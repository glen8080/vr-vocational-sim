"""Competency assessment.

Three independent axes, deliberately not collapsed into a single number until
the very end:

  * SAFETY      — weighted deductions from recorded violations. A critical
                  breach caps the whole assessment regardless of speed.
  * EFFICIENCY  — time versus par, plus rework, errors and hint dependence.
  * COMPLETION  — how much of the procedure was actually performed.

A fast student who skips lockout is *not* competent. The rubric has to be able
to say so, loudly.
"""

from __future__ import annotations

from typing import Dict, List

# Violation code -> competency dimension (drives the radar + remediation).
CODE_DIM = {
    "energized_contact": "Hazard control & isolation",
    "off_not_isolated": "Hazard control & isolation",
    "loto_live": "Hazard control & isolation",
    "loto_early": "Hazard control & isolation",
    "unproven_tester": "Hazard control & isolation",
    "opened_live": "Hazard control & isolation",
    "locked_out": "Hazard control & isolation",
    "switched_neutral": "Code & specification compliance",
    "ground_on_terminal": "Code & specification compliance",
    "hot_in_neutral": "Code & specification compliance",
    "no_ground": "Code & specification compliance",
    "wrong_landing": "Code & specification compliance",
    "no_operation": "Code & specification compliance",
    "guess_breaker": "Procedural sequencing",
    "wrong_breaker": "Procedural sequencing",
    "lucky_guess": "Procedural sequencing",
    "panel_closed": "Procedural sequencing",
    "switch_in": "Procedural sequencing",
    "not_stripped": "Procedural sequencing",
    "incomplete": "Procedural sequencing",
    "no_power": "Procedural sequencing",
    "no_bucket": "Procedural sequencing",
    "no_vent": "Procedural sequencing",
    "wrong_order": "Procedural sequencing",
    "wrench_first": "Procedural sequencing",
    "nuts_tight": "Procedural sequencing",
    "not_removed": "Procedural sequencing",
    "not_aligned": "Procedural sequencing",
    "restore_unmade": "Procedural sequencing",
    "faucet_before_isolation": "Procedural sequencing",
    "early_cleanup": "Procedural sequencing",
    "no_inspect": "Procedural sequencing",
    "no_inspect_final": "Procedural sequencing",
    "loose_terminal": "Workmanship & verification",
    "leak": "Workmanship & verification",
    "overtightened": "Workmanship & verification",
    "overtightened_final": "Workmanship & verification",
    "no_water": "Workmanship & verification",
    "no_flow": "Workmanship & verification",
    "cover_incomplete": "Workmanship & verification",
    "no_ppe": "PPE & instrument discipline",
    "no_ppe_test": "PPE & instrument discipline",
    "no_gloves_test": "PPE & instrument discipline",
    "no_gloves_work": "PPE & instrument discipline",
    "no_gloves_breaker": "PPE & instrument discipline",
    "no_reprove": "PPE & instrument discipline",
}

DIMENSIONS = [
    "Hazard control & isolation",
    "Code & specification compliance",
    "Procedural sequencing",
    "Workmanship & verification",
    "PPE & instrument discipline",
]

BANDS = [
    (90, "Exemplary — ready for unsupervised work",
     "Demonstrates safe method without prompting. Suitable for sign-off on this task."),
    (78, "Competent — independent",
     "Meets the standard. Minor coaching will tighten consistency."),
    (62, "Developing — supervised practice",
     "Core method is present but unstable. Re-drill before live assessment."),
    (0, "Not yet competent — do not sign off",
     "Gaps in safety-critical method. Supervised re-teaching required."),
]


def _band(score: float) -> Dict:
    for threshold, label, note in BANDS:
        if score >= threshold:
            return {"level": label, "note": note}
    return {"level": BANDS[-1][1], "note": BANDS[-1][2]}


def score_session(session) -> Dict:
    sc = session.scenario
    violations: List[Dict] = list(session.violations)

    # ---- safety -------------------------------------------------------
    deduction = sum(v.get("weight", 0) for v in violations)
    safety = max(0, 100 - deduction)
    criticals = [v for v in violations if v.get("severity") == "critical"]
    majors = [v for v in violations if v.get("severity") == "major"]

    # ---- completion ---------------------------------------------------
    done_ids = set(session.done_steps())
    done = [s for s in sc.steps if s.id in done_ids]
    completion = 100.0 * len(done) / max(1, len(sc.steps))

    # ---- efficiency ---------------------------------------------------
    par = max(30, sc.par_time_s)
    elapsed = session.elapsed_s()
    over = max(0.0, elapsed / par - 1.0)
    time_pen = min(40.0, over * 60.0)
    hint_pen = 3.0 * session.hints_used
    rework_pen = 2.5 * session.rework
    error_pen = 4.0 * len(violations)
    efficiency = max(0.0, 100.0 - time_pen - hint_pen - rework_pen - error_pen)

    # ---- composite ----------------------------------------------------
    overall = 0.45 * safety + 0.25 * efficiency + 0.30 * completion
    if criticals:
        overall = min(overall, 58.0)          # hard safety ceiling
    if len(majors) >= 3:
        overall = min(overall, 68.0)

    # ---- per-dimension ------------------------------------------------
    dim_scores = {d: 100.0 for d in DIMENSIONS}
    for v in violations:
        d = CODE_DIM.get(v.get("code"), "Procedural sequencing")
        dim_scores[d] = max(0.0, dim_scores[d] - (v.get("weight", 0) * 1.8))

    # ---- remediation feedforward --------------------------------------
    order = {"critical": 0, "major": 1, "minor": 2, "info": 3}
    ranked = sorted(violations, key=lambda v: order.get(v.get("severity"), 3))
    feedforward = []
    seen = set()
    for v in ranked:
        if v["code"] in seen:
            continue
        seen.add(v["code"])
        feedforward.append({
            "severity": v["severity"],
            "title": v["title"],
            "action": v.get("hint") or v.get("message"),
            "why": v.get("why", ""),
            "reference": v.get("reference", ""),
            "dimension": CODE_DIM.get(v["code"], "Procedural sequencing"),
        })

    band = _band(overall)
    return {
        "scenarioId": sc.id,
        "scenarioTitle": sc.title,
        "trade": sc.trade,
        "standards": sc.standards,
        "scores": {
            "safety": round(safety, 1),
            "efficiency": round(efficiency, 1),
            "completion": round(completion, 1),
            "overall": round(overall, 1),
        },
        "band": band,
        "dimensions": [
            {"dimension": d, "score": round(dim_scores[d], 1)} for d in DIMENSIONS
        ],
        "counts": {
            "critical": len(criticals),
            "major": len(majors),
            "minor": len([v for v in violations if v.get("severity") == "minor"]),
            "hintsUsed": session.hints_used,
            "rework": session.rework,
            "actions": len(session.log),
        },
        "timing": {
            "elapsedS": round(elapsed, 1),
            "parS": par,
            "vsParPct": round((elapsed / par - 1.0) * 100, 1),
        },
        "steps": [
            {
                "id": s.id,
                "title": s.title,
                "status": "complete" if s.id in done_ids else "incomplete",
            }
            for s in sc.steps
        ],
        "violations": violations,
        "feedforward": feedforward[:5],
        "safetyCeilingApplied": bool(criticals),
    }
