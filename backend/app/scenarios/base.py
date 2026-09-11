"""Shared vocabulary for scenario definitions.

A Scenario is a *procedural task model*: an ordered list of steps, a set of
state flags, and a handler that maps a student action onto either a state
transition or a safety/procedure violation. The AI coach reads the resulting
event stream; it never guesses.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional

# Pedagogical severity -> assessment penalty (safety score points).
SEV_WEIGHT = {"critical": 25, "major": 15, "minor": 6, "info": 0, "ok": 0}


def mk(
    severity: str,
    code: str,
    title: str,
    message: str,
    why: str = "",
    hint: str = "",
    reference: str = "",
    weight: Optional[int] = None,
    progress: bool = False,
) -> Dict:
    """Build a coach event. `progress=True` marks genuine task advancement."""
    return {
        "severity": severity,
        "code": code,
        "title": title,
        "message": message,
        "why": why,
        "hint": hint,
        "reference": reference,
        "weight": SEV_WEIGHT.get(severity, 0) if weight is None else weight,
        "progress": progress,
        "ts": time.time(),
    }


def ok(title: str, message: str, **kw) -> Dict:
    return mk("ok", "ok", title, message, progress=True, **kw)


def info(title: str, message: str, **kw) -> Dict:
    return mk("info", "info", title, message, **kw)


def warn(code: str, title: str, message: str, severity: str = "minor", **kw) -> Dict:
    """A blocked or incorrect action: procedural feedback, not advancement."""
    return mk(severity, code, title, message, **kw)


@dataclass
class Step:
    id: str
    title: str
    hints: List[str] = field(default_factory=list)   # escalating: nudge -> specific -> worked example
    why: str = ""
    reference: str = ""
    par_seconds: int = 20


class Scenario:
    """Base class. Subclasses implement initial_flags / handle / step_done."""

    id: str = "base"
    title: str = ""
    trade: str = ""
    blurb: str = ""
    standards: List[str] = field(default_factory=list)
    par_time_s: int = 240
    steps: List[Step] = []

    def initial_flags(self) -> Dict:
        return {}

    def handle(self, session, action: str) -> List[Dict]:
        raise NotImplementedError

    def step_done(self, step_id: str, flags: Dict) -> bool:
        fn: Optional[Callable[[Dict], bool]] = getattr(self, "_done", {}).get(step_id)
        return bool(fn and fn(flags))

    def is_complete(self, flags: Dict) -> bool:
        return all(self.step_done(s.id, flags) for s in self.steps)

    def final_checks(self, session) -> List[Dict]:
        """Post-completion audit. Override to catch latent defects."""
        return []

    def meta(self) -> Dict:
        return {
            "id": self.id,
            "title": self.title,
            "trade": self.trade,
            "blurb": self.blurb,
            "standards": self.standards,
            "parTimeS": self.par_time_s,
            "steps": [
                {"id": s.id, "title": s.title, "why": s.why, "reference": s.reference}
                for s in self.steps
            ],
        }
