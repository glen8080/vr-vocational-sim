"""Scenario B — Plumbing: replace a kitchen sink P-trap.

Simpler plant than the electrical scenario but a rich *sequencing* problem:
almost every error a novice makes here is doing the right thing in the wrong
order (opening the trap before draining, wrenching before hand-tightening,
restoring supply before a leak check).
"""

from __future__ import annotations

from typing import Dict, List

from .base import Scenario, Step, info, mk, ok, warn

PART_ORDER = ["wall_arm", "j_bend", "trap_arm"]
PART_LABEL = {
    "wall_arm": "wall arm (with flange)",
    "j_bend": "J-bend / U-bend",
    "trap_arm": "trap arm into the wall",
}

STEPS = [
    Step(
        "ppe", "Don PPE: eye protection + gloves",
        [
            "What's under that sink besides water?",
            "Put on eye protection and gloves before you kneel down.",
            "Click the glasses, then the gloves.",
        ],
        "Trap water is contaminated wastewater; chemical drain cleaners and sharp "
        "burrs are common in this cavity.",
        "",
    ),
    Step(
        "isolate", "Isolate the water supply",
        [
            "Water + open pipe = floor. What stops it?",
            "Close the angle stop under the sink.",
            "Click the angle stop to close the supply.",
        ],
        "Isolate the supply before opening any part of the drainage system.",
        "",
    ),
    Step(
        "drain", "Relieve pressure and drain the trap",
        [
            "The trap is full of water — where does it go?",
            "Open the faucet to vent the line, then set a bucket under the trap.",
            "Click the faucet to open it, then place the bucket under the trap.",
        ],
        "Opening the faucet vents the waste arm so the trap drains instead of "
        "siphoning, and the bucket catches the residual water.",
        "",
    ),
    Step(
        "remove", "Remove the failed P-trap",
        [
            "Loosen the slip nuts — by hand first.",
            "Back off both slip nuts and drop out the old assembly.",
            "Loosen the slip nuts, then remove the old trap.",
        ],
        "",
        "",
    ),
    Step(
        "inspect", "Inspect and clean the mating surfaces",
        [
            "New parts on a dirty sealing surface still leak.",
            "Clean the tailpiece and check it for burrs and squareness.",
            "Click the tailpiece to inspect it.",
        ],
        "Slip-joint seals rely on clean, round, unmarred seating surfaces.",
        "",
    ),
    Step(
        "dryfit", "Dry-fit the new assembly in order",
        [
            "Assemble dry before any tightening. Which part goes first?",
            "Wall arm, then J-bend onto the tailpiece, then the trap arm into the wall.",
            "Click, in order: wall arm, J-bend, trap arm.",
        ],
        "Dry-fitting exposes alignment problems while they are still free to fix.",
        "",
    ),
    Step(
        "align", "Check alignment and water seal depth",
        [
            "A trap that 'fits' can still be wrong.",
            "Confirm the assembly is square and the seal depth is 2–4 inches.",
            "Click the assembly to check alignment.",
        ],
        "Seal depth outside 2–4 inches either self-siphons (loses the seal) or "
        "restricts flow.",
        "IPC 1002",
    ),
    Step(
        "tighten", "Hand-tighten, then a quarter turn with the wrench",
        [
            "How tight is tight enough?",
            "Hand-tighten all slip nuts, then one quarter turn with the wrench.",
            "Click hand-tighten, then click the wrench exactly once.",
        ],
        "Slip joints seal on the washer, not on torque. Overtightening cracks the "
        "nut and deforms the washer.",
        "",
    ),
    Step(
        "restore", "Restore supply and functionally test",
        [
            "Prove the joint before you walk away.",
            "Close the faucet, open the angle stop, then run water and watch the joint.",
            "Close faucet → open angle stop → run water → leak check.",
        ],
        "Every drain connection is leak-tested under flow before the job is closed.",
        "",
    ),
    Step(
        "cleanup", "Remove the bucket and clear the work area",
        [
            "Last step — leave the space as you found it.",
            "Remove the bucket and confirm a dry floor.",
            "Click the bucket to remove it.",
        ],
        "",
        "",
    ),
]


class PTrapScenario(Scenario):
    id = "plumbing-ptrap"
    title = "Replace a Kitchen Sink P-Trap"
    trade = "Plumbing"
    blurb = (
        "A leaking 1½\" P-trap under a kitchen sink must be replaced. Isolate, "
        "drain, remove, dry-fit, make up the joints correctly, and leak-test — "
        "without flooding the cabinet."
    )
    standards = ["IPC Chapter 10 (traps)", "Manufacturer slip-joint torque practice"]
    par_time_s = 200
    steps = STEPS

    def initial_flags(self) -> Dict:
        return {
            "ppe_glasses": False,
            "ppe_gloves": False,
            "supply_closed": False,
            "faucet_open": False,
            "bucket_placed": False,
            "nuts_loosened": False,
            "old_removed": False,
            "inspected": False,
            "fitted": [],
            "aligned": False,
            "hand_tight": False,
            "wrench_turns": 0,
            "faucet_closed": False,
            "supply_open": False,
            "leak_checked": False,
            "leak_free": False,
            "bucket_removed": False,
            "complete": False,
        }

    _done = {
        "ppe": lambda f: f["ppe_glasses"] and f["ppe_gloves"],
        "isolate": lambda f: f["supply_closed"],
        "drain": lambda f: f["faucet_open"] and f["bucket_placed"],
        "remove": lambda f: f["nuts_loosened"] and f["old_removed"],
        "inspect": lambda f: f["inspected"],
        "dryfit": lambda f: len(f["fitted"]) >= 3,
        "align": lambda f: f["aligned"],
        "tighten": lambda f: f["hand_tight"] and f["wrench_turns"] >= 1,
        "restore": lambda f: f["supply_open"] and f["leak_checked"],
        "cleanup": lambda f: f["bucket_removed"],
    }

    def is_complete(self, flags: Dict) -> bool:
        return bool(flags.get("bucket_removed") and flags.get("leak_checked"))

    # ------------------------------------------------------------------

    def handle(self, s, action: str) -> List[Dict]:
        f = s.flags
        a = (action or "").strip()
        out: List[Dict] = []

        if a in ("equip:glasses", "equip:gloves"):
            key = "ppe_glasses" if a.endswith("glasses") else "ppe_gloves"
            label = "Eye protection" if key == "ppe_glasses" else "Gloves"
            if f[key]:
                return [info("Already donned", f"{label} already on.")]
            f[key] = True
            return [ok(f"{label} on",
                       "PPE complete." if f["ppe_glasses"] and f["ppe_gloves"]
                       else "Don the other item to complete PPE.")]

        if a == "close:supply_valve":
            if f["supply_closed"]:
                return [info("Already closed", "The angle stop is closed.")]
            f["supply_closed"] = True
            f["supply_open"] = False
            return [ok("Supply isolated",
                       "Angle stop closed. Now vent the line so the trap can drain.")]

        if a == "open:supply_valve":
            if not f["supply_closed"] and not f["leak_checked"]:
                return [info("Already open", "The supply is already on.")]
            if not f["hand_tight"] or f["wrench_turns"] < 1:
                return [warn(
                    "restore_unmade", "Restoring supply before the joints are made up",
                    "You are about to pressurise a drain assembly that has not been "
                    "tightened. Water will discharge into the cabinet.",
                    "major", hint="Hand-tighten, then a quarter turn, then restore.",
                )]
            if f["faucet_open"]:
                return [warn("faucet_open", "Faucet still open",
                             "Close the faucet before restoring supply.", "minor")]
            f["supply_open"] = True
            f["supply_closed"] = False
            return [ok("Supply restored", "Angle stop open. Run water and watch both joints.")]

        if a == "open:faucet":
            if f["faucet_open"]:
                return [info("Already open", "The faucet is open.")]
            if not f["supply_closed"]:
                out.append(info("Supply still on",
                                "The faucet is running on live supply — you have not "
                                "isolated the fixture yet."))
                return out + [warn("faucet_before_isolation", "Sequencing error",
                                   "Close the angle stop before you open the fixture.",
                                   "minor")]
            f["faucet_open"] = True
            f["faucet_closed"] = False
            return [ok("Faucet open — line vented",
                       "Air is admitted behind the trap, so it will drain rather than "
                       "siphon. Catch the water before you crack the nuts.")]

        if a == "close:faucet":
            if not f["faucet_open"]:
                return [info("Already closed", "The faucet is closed.")]
            f["faucet_closed"] = True
            f["faucet_open"] = False
            return [ok("Faucet closed", "Fixture is ready for the supply to be restored.")]

        if a == "place:bucket":
            if f["bucket_placed"]:
                return [info("Already placed", "The bucket is already under the trap.")]
            f["bucket_placed"] = True
            return [ok("Bucket in place",
                       "Residual trap water will be contained. You can now open the joint.")]

        if a == "loosen:slip_nuts":
            if f["nuts_loosened"]:
                return [info("Already loose", "Both slip nuts are backed off.")]
            out = []
            if not f["supply_closed"]:
                out.append(warn(
                    "opened_live", "Opened the drain with the supply live",
                    "Supply is still pressurised — wastewater discharges into the "
                    "cabinet and onto the floor.", "major",
                    hint="Close the angle stop first.",
                ))
            if not f["bucket_placed"]:
                out.append(warn(
                    "no_bucket", "No containment",
                    "With no bucket under it, roughly a pint of trap water goes "
                    "straight into the cabinet.", "minor",
                    hint="Place the bucket before opening the joint.",
                ))
            elif not f["faucet_open"]:
                out.append(warn(
                    "no_vent", "Not vented",
                    "The trap siphons unpredictably because the line was not vented; "
                    "you get more water than you expected.", "minor",
                    hint="Open the faucet to admit air behind the trap.",
                ))
            f["nuts_loosened"] = True
            return out + [ok("Slip nuts backed off",
                             "Both joints free. Lift out the old assembly.")]

        if a == "remove:old_trap":
            if not f["nuts_loosened"]:
                return [warn("nuts_tight", "Nuts still tight",
                             "Back off the slip nuts before removing the assembly.")]
            f["old_removed"] = True
            return [ok("Old trap removed",
                       "Cavity is open. Do not install onto a dirty or burred surface.")]

        if a == "inspect:tailpiece":
            if not f["old_removed"]:
                return [warn("not_removed", "Nothing to inspect yet",
                             "Remove the old trap first.")]
            f["inspected"] = True
            return [ok("Tailpiece inspected",
                       "Surface cleaned, cut square, no burrs. A slip-joint washer "
                       "will now seat evenly.")]

        if a.startswith("fit:"):
            part = a.split(":")[1]
            if part not in PART_LABEL:
                return [info("Unknown part", "That part is not in the kit.")]
            if not f["old_removed"]:
                return [warn("not_removed", "Nothing to fit yet",
                             "Remove the old trap before dry-fitting.")]
            if part in f["fitted"]:
                return [info("Already fitted", f"{PART_LABEL[part]} is in place.")]
            expected = PART_ORDER[len(f["fitted"])]
            if part != expected:
                s.rework += 1
                return [warn(
                    "wrong_order", "Assembly out of sequence",
                    f"You cannot fit the {PART_LABEL[part]} yet — the "
                    f"{PART_LABEL[expected]} must go in first. Dry-fitting out of "
                    "order forces the joints and pre-loads the washers.",
                    "minor", hint=f"Next part: {PART_LABEL[expected]}.",
                )]
            if not f["inspected"] and len(f["fitted"]) == 0:
                out.append(warn("no_inspect", "Fitting onto an uninspected surface",
                                "You did not inspect or clean the tailpiece first.",
                                "minor"))
            f["fitted"].append(part)
            n = len(f["fitted"])
            return out + [ok(
                f"Fitted: {PART_LABEL[part]}",
                "All three parts dry-fitted." if n == 3 else
                f"Next: {PART_LABEL[PART_ORDER[n]]}.",
            )]

        if a == "check:alignment":
            if len(f["fitted"]) < 3:
                return [warn("incomplete", "Assembly incomplete",
                             "Dry-fit all three parts before checking alignment.")]
            f["aligned"] = True
            return [ok("Alignment confirmed",
                       "Assembly is square, no pre-load on the washers, and the water "
                       "seal depth is within the 2–4 inch range.")]

        if a == "tighten:hand":
            if not f["aligned"]:
                return [warn("not_aligned", "Not aligned",
                             "Confirm alignment before making the joints up.")]
            if f["hand_tight"]:
                return [info("Already hand-tight", "Slip nuts are already hand-tight.")]
            f["hand_tight"] = True
            return [ok("Hand-tight",
                       "Snug by hand with the washers seated square. Now finish with "
                       "exactly one quarter turn.")]

        if a == "tighten:wrench":
            if not f["hand_tight"]:
                return [warn(
                    "wrench_first", "Wrench before hand-tightening",
                    "Going straight to the wrench cross-threads the nut and pinches "
                    "the washer. Hand-tighten first so the joint starts true.",
                    "minor",
                )]
            f["wrench_turns"] += 1
            if f["wrench_turns"] > 1:
                return [warn(
                    "overtightened", "Overtightened",
                    f"That is turn {f['wrench_turns']}. Slip-joint nuts seal on the "
                    "washer, not on torque — you have now deformed the washer and "
                    "risk cracking the nut. This leaks later, under a client's sink.",
                    "minor",
                    why="One quarter turn past hand-tight is the manufacturer's spec.",
                    hint="Back it off, reseat the washer, and stop at one quarter turn.",
                )]
            return [ok("Quarter turn applied",
                       "Correct. Joints are made up: hand-tight plus one quarter turn.")]

        if a == "test:leak_check":
            if not f["supply_open"]:
                return [warn("no_water", "No water",
                             "Restore the supply and run the fixture before leak-testing.")]
            if not f["faucet_open"] and not f["faucet_closed"]:
                return [warn("no_flow", "No flow", "Run water through the trap.")]
            f["leak_checked"] = True
            if f["wrench_turns"] > 1:
                f["leak_free"] = False
                return [warn(
                    "leak", "Leak at the J-bend nut",
                    "Water is tracking out of the deformed washer at the J-bend — the "
                    "direct consequence of overtightening. Back it off and remake the "
                    "joint.", "major",
                )]
            if not f["hand_tight"] or f["wrench_turns"] < 1:
                f["leak_free"] = False
                return [warn("leak", "Leaking joints",
                             "Both slip nuts weep under flow — they were never made up.",
                             "major")]
            f["leak_free"] = True
            return [ok("Leak test passed",
                       "Both joints dry under a full-flow discharge. Seal holds.")]

        if a == "remove:bucket":
            if not f["bucket_placed"]:
                return [info("No bucket", "There is no bucket to remove.")]
            if not f["leak_checked"]:
                return [warn("early_cleanup", "Cleaning up before the leak test",
                             "Put the bucket back until you have proven the joint is dry.",
                             "minor")]
            f["bucket_removed"] = True
            f["complete"] = True
            return [ok("Work area cleared",
                       "Floor is dry, waste contained, job complete.")]

        return [info("No effect", f"Nothing useful happens from '{a}' here.")]

    def final_checks(self, s) -> List[Dict]:
        f = s.flags
        out: List[Dict] = []
        if f["wrench_turns"] > 1:
            out.append(warn("overtightened_final", "Slip joints overtightened",
                            "More than one quarter turn past hand-tight — reduced "
                            "washer life and risk of a cracked nut.", "minor"))
        if not (f["ppe_glasses"] and f["ppe_gloves"]):
            out.append(warn("no_ppe", "PPE not worn for the full task",
                            "PPE gaps were recorded during the task.", "minor"))
        if not f["inspected"]:
            out.append(warn("no_inspect_final", "Mating surfaces never inspected",
                            "Parts were fitted onto an unprepared sealing surface.",
                            "minor"))
        return out
