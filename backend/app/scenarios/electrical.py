"""Scenario A — Residential electrical: replace a single-pole switch.

Instructional model: NFPA 70E *establish an electrically safe work condition*
(identify -> de-energize -> lockout/tagout -> verify dead -> re-prove tester)
followed by a code-correct termination (NEC 404 / 250) and a functional test.

The coach is deliberately unforgiving about the isolation sequence and helpful
about everything else — that asymmetry is the whole point of psychomotor
training: procedural memory must be built before dexterity matters.
"""

from __future__ import annotations

from typing import Dict, List

from .base import Scenario, Step, info, mk, ok, warn

CORRECT_BREAKER = "ckt12"

WIRE_LABEL = {
    "black_line": "hot feed (black)",
    "black_load": "switch leg to luminaire (black)",
    "white_neutral": "grounded conductor (white)",
    "bare_ground": "equipment ground (bare)",
}
TERMINAL_LABEL = {
    "line": "LINE brass terminal",
    "load": "LOAD brass terminal",
    "ground": "green ground screw",
    "neutral_nut": "neutral pigtail (wire nut)",
}
# NEC-correct landing for each conductor.
CORRECT_LANDING = {
    "black_line": "line",
    "black_load": "load",
    "bare_ground": "ground",
    "white_neutral": "neutral_nut",
}

STEPS = [
    Step(
        "ppe",
        "Don PPE: safety glasses + insulating gloves",
        [
            "Before you touch anything: what protects your eyes and hands here?",
            "Grab the safety glasses and the insulating gloves from the bench.",
            "Click the glasses, then the gloves. Arc-flash and eye-injury risk exist even on 120 V residential circuits.",
        ],
        "Personal protective equipment is the last line of defence when an "
        "electrically safe work condition has not yet been established.",
        "NFPA 70E 130.7",
    ),
    Step(
        "prove_tester",
        "Prove the voltage tester on a known live source",
        [
            "How do you know the tester actually works?",
            "Test it on the known-live receptacle on the bench before you trust it.",
            "Click the bench receptacle with the tester selected — 'live-dead-live' starts with LIVE.",
        ],
        "An unproven tester can read dead on an energized circuit. This is the "
        "single most common cause of electrical contact injuries.",
        "NFPA 70E 120.5(9)",
    ),
    Step(
        "test_live",
        "Confirm the switch circuit is energized",
        [
            "Prove it's live before you prove it's dead.",
            "Test at the switch box conductors with the tester.",
            "Click the switch box with the tester selected to confirm 120 V present.",
        ],
        "You must establish the hazardous condition exists before you can "
        "verify that you removed it.",
        "NFPA 70E 120.5",
    ),
    Step(
        "isolate",
        "Open the panel and identify the correct breaker",
        [
            "Which breaker feeds this switch — and how would you know?",
            "Open the panel door, then read the as-built schedule before choosing.",
            "Open the panel, click the schedule card, then select breaker CKT-12 "
            "(Lighting, Kitchen/Utility). Guessing is a procedural error.",
        ],
        "Positive identification of the disconnecting means prevents switching "
        "an unintended circuit and creating a false sense of safety.",
        "NEC 408.4 / NFPA 70E 120.5(2)",
    ),
    Step(
        "deenergize",
        "De-energize: turn CKT-12 OFF",
        [
            "Time to remove the source.",
            "Throw CKT-12 to the OFF position.",
            "Click breaker CKT-12 with the panel open.",
        ],
        "All sources of hazardous energy must be disconnected before work begins.",
        "NFPA 70E 120.5(3)",
    ),
    Step(
        "loto",
        "Apply lockout/tagout device",
        [
            "OFF is not OFF enough. Someone could re-energize it.",
            "Install the lockout hasp on CKT-12.",
            "Click the lockout device, then the CKT-12 breaker.",
        ],
        "An energy-isolating device must be locked in the safe position so the "
        "circuit cannot be re-energized while you are working.",
        "OSHA 1910.147 / NFPA 70E 120.5(4)",
    ),
    Step(
        "verify_dead",
        "Verify the circuit is de-energized at the point of work",
        [
            "Now prove the hazard is actually gone — at the switch box itself.",
            "Re-test at the switch box with your proven tester.",
            "Click the switch box with the tester selected. It should read DEAD.",
        ],
        "Verification must be performed at the point of work, not at the panel.",
        "NFPA 70E 120.5(7)",
    ),
    Step(
        "reprove",
        "Re-prove the tester (complete live-dead-live)",
        [
            "You've proven it dead. How do you know the tester didn't just fail?",
            "Go back to the known-live receptacle and confirm it still reads live.",
            "Click the bench receptacle with the tester again to finish the "
            "live-dead-live sequence.",
        ],
        "Re-proving confirms the instrument did not fail during the dead reading.",
        "NFPA 70E 120.5(9)",
    ),
    Step(
        "remove_cover",
        "Remove the switch cover plate",
        [
            "The tester says dead and the breaker is locked. Proceed.",
            "Remove the two cover-plate screws and lift the plate off.",
            "Click the cover plate to remove it.",
        ],
        "Only after an electrically safe work condition is verified should "
        "equipment be opened.",
        "NFPA 70E 120.5",
    ),
    Step(
        "remove_switch",
        "Remove the failed switch from the box",
        [
            "Get the old device out of the way.",
            "Back out the two device screws and pull the switch forward.",
            "Click the old switch to remove it.",
        ],
        "",
        "",
    ),
    Step(
        "strip",
        "Prepare (strip) the four conductors",
        [
            "Fresh conductors terminate better than tinned, nicked ones.",
            "Strip each conductor to the gauge length marked on the device.",
            "Click each of the four conductors to strip them to length.",
        ],
        "Strip length equal to the device gauge prevents exposed copper outside "
        "the terminal — a common arc-fault initiator.",
        "NEC 110.14 / 300.14",
    ),
    Step(
        "terminate",
        "Terminate conductors: line, load, ground, neutral pigtail",
        [
            "Four conductors, four correct destinations. Think before each one.",
            "Hot feed to LINE, switch leg to LOAD, bare to the green ground screw, "
            "white to the neutral pigtail — never to a brass terminal.",
            "With a conductor selected, click its destination. White must go to "
            "the wire nut, not to a switch terminal.",
        ],
        "Switching the grounded conductor leaves the luminaire shell energized "
        "even when the switch is OFF.",
        "NEC 404.2(B) / 250.130",
    ),
    Step(
        "tighten",
        "Tighten terminals to the listed torque",
        [
            "Hand-tight is not terminated.",
            "Snug every terminal screw, then verify with a tug test.",
            "Click 'tighten' on the device.",
        ],
        "Loose terminations heat, arc, and are a leading cause of residential fires.",
        "NEC 110.14(D)",
    ),
    Step(
        "restore_cover",
        "Reinstall the cover plate",
        [
            "Close it up before anyone restores energy.",
            "Put the cover plate back on.",
            "Click the switch box to reinstall the cover plate.",
        ],
        "Equipment must be closed before energy is restored.",
        "NFPA 70E 120.6",
    ),
    Step(
        "remove_loto",
        "Remove lockout/tagout",
        [
            "Work is done and closed up — who removes the lock?",
            "The authorised worker removes their own lock, last.",
            "Click the lockout device to remove it (only after the cover is on).",
        ],
        "Locks are removed by the person who applied them, after the equipment "
        "is restored to a normal condition.",
        "OSHA 1910.147(e)",
    ),
    Step(
        "energize",
        "Restore power and close the panel",
        [
            "Bring the circuit back.",
            "Throw CKT-12 to ON with the panel open, then close the dead front.",
            "Click CKT-12 to energize, then close the panel door.",
        ],
        "",
        "",
    ),
    Step(
        "function_test",
        "Functional test: the luminaire operates",
        [
            "Prove the work, not just the wiring.",
            "Operate the switch and confirm the light comes on.",
            "Click the switch toggle to test.",
        ],
        "Verification of the completed work closes the feedback loop.",
        "",
    ),
]


class ElectricalSwitchScenario(Scenario):
    id = "electrical-switch"
    title = "Replace a Single-Pole Switch (Live 120 V Circuit)"
    trade = "Electrical"
    blurb = (
        "A utility-room luminaire is controlled by a failed single-pole switch. "
        "Establish an electrically safe work condition, replace the device, and "
        "verify operation — without ever contacting an energized conductor."
    )
    standards = ["NFPA 70E", "OSHA 1910.147 (LOTO)", "NEC 404 / 250 / 110.14"]
    par_time_s = 260
    steps = STEPS

    def initial_flags(self) -> Dict:
        f = {
            "ppe_glasses": False,
            "ppe_gloves": False,
            "tester_proven": False,
            "confirmed_live": False,
            "panel_open": False,
            "breaker_identified": False,
            "breaker_off": False,
            "locked": False,
            "verified_dead": False,
            "reproven": False,
            "cover_off": False,
            "switch_out": False,
            "stripped": [],
            "wires": {},          # conductor -> terminal
            "tightened": False,
            "cover_on": False,
            "lock_removed": False,
            "breaker_on": False,
            "panel_closed": False,
            "light_on": False,
            "complete": False,
        }
        return f

    _done = {
        "ppe": lambda f: f["ppe_glasses"] and f["ppe_gloves"],
        "prove_tester": lambda f: f["tester_proven"],
        "test_live": lambda f: f["confirmed_live"],
        "isolate": lambda f: f["panel_open"] and f["breaker_identified"],
        "deenergize": lambda f: f["breaker_off"],
        "loto": lambda f: f["locked"],
        "verify_dead": lambda f: f["verified_dead"],
        "reprove": lambda f: f["reproven"],
        "remove_cover": lambda f: f["cover_off"],
        "remove_switch": lambda f: f["switch_out"],
        "strip": lambda f: len(f["stripped"]) >= 4,
        "terminate": lambda f: len(f["wires"]) >= 4,
        "tighten": lambda f: f["tightened"],
        "restore_cover": lambda f: f["cover_on"],
        "remove_loto": lambda f: f["lock_removed"],
        "energize": lambda f: f["breaker_on"],
        "function_test": lambda f: f["light_on"],
    }

    def is_complete(self, flags: Dict) -> bool:
        return bool(flags.get("light_on"))

    # ------------------------------------------------------------------

    def handle(self, s, action: str) -> List[Dict]:
        f = s.flags
        a = (action or "").strip()
        out: List[Dict] = []

        # ---- PPE -------------------------------------------------------
        if a in ("equip:glasses", "equip:gloves"):
            key = "ppe_glasses" if a.endswith("glasses") else "ppe_gloves"
            label = "Safety glasses" if key == "ppe_glasses" else "Insulating gloves"
            if f[key]:
                return [info("Already donned", f"{label} are already on.")]
            f[key] = True
            done = f["ppe_glasses"] and f["ppe_gloves"]
            return [
                mk(
                    "ok", "ppe", f"{label} donned",
                    f"{label} on." + (" PPE complete — you may now handle the tester."
                                      if done else " Don the other item to complete PPE."),
                    progress=True,
                )
            ]

        # ---- Tester ----------------------------------------------------
        if a == "use:tester@known_source":
            if not f["ppe_glasses"] or not f["ppe_gloves"]:
                out.append(warn(
                    "no_ppe_test", "PPE incomplete",
                    "You're about to test a live circuit without full PPE. "
                    "Don glasses and gloves first.", "minor",
                ))
            if not f["tester_proven"]:
                f["tester_proven"] = True
                return out + [ok(
                    "Tester proven — LIVE",
                    "The tester indicates 120 V on the known-live receptacle. "
                    "The instrument is functional; its readings can be trusted.",
                )]
            if f["verified_dead"] and not f["reproven"]:
                f["reproven"] = True
                return out + [ok(
                    "Tester re-proven — LIVE-DEAD-LIVE complete",
                    "The tester again reads 120 V on the known source. Your DEAD "
                    "reading at the switch box was genuine — the tester did not fail.",
                )]
            return out + [info("Already proven", "Tester is already proven on a known source.")]

        if a == "use:tester@switchbox":
            if not f["ppe_gloves"]:
                out.append(warn(
                    "no_gloves_test", "Gloves missing",
                    "You are placing your hands near exposed conductors without "
                    "insulating gloves.", "minor",
                ))
            if not f["tester_proven"]:
                return out + [warn(
                    "unproven_tester", "Unproven tester — test is invalid",
                    "You cannot trust a DEAD reading from a tester you have not "
                    "proven on a known-live source. A failed tester reads dead on "
                    "a live circuit. Prove it first.",
                    "major",
                    why="Live-dead-live testing exists because meters fail silently.",
                    hint="Select the tester and click the known-live receptacle on the bench.",
                    reference="NFPA 70E 120.5(9)",
                )]
            if f["cover_off"]:
                return out + [info("Already open", "You have already opened this box.")]
            if not f["breaker_off"]:
                f["confirmed_live"] = True
                return out + [ok(
                    "Circuit is ENERGIZED — 120 V present",
                    "Confirmed: the circuit you are about to work on is live. "
                    "This is the hazard you must remove and then verify as removed.",
                )]
            if f["breaker_off"] and not f["locked"]:
                return out + [warn(
                    "off_not_isolated", "De-energized but NOT isolated",
                    "The tester may now read dead, but the breaker is not locked "
                    "out — anyone can re-energize it while your hands are in the box. "
                    "Apply lockout/tagout before you treat this as safe.",
                    "major",
                    why="De-energizing is not the same as isolating.",
                    hint="Click the lockout device, then click breaker CKT-12.",
                    reference="OSHA 1910.147",
                )]
            f["verified_dead"] = True
            return out + [ok(
                "Verified DEAD — safe work condition established",
                "No voltage present at the point of work, breaker OFF and locked out. "
                "You may open the box. Finish by re-proving the tester.",
            )]

        # ---- Panel -----------------------------------------------------
        if a == "open:panel":
            if f["panel_open"]:
                return [info("Panel open", "The panel door is already open.")]
            f["panel_open"] = True
            return [ok("Panel opened",
                       "Energized busbars and lugs are now exposed. Keep one hand "
                       "clear and do not reach past the dead front.")]

        if a == "close:panel":
            if not f["panel_open"]:
                return [info("Panel closed", "The panel door is already closed.")]
            if f["breaker_off"] and not f["lock_removed"]:
                return [warn("panel_early", "Not yet",
                             "Leave the panel accessible until the work is complete "
                             "and the lock is off.")]
            f["panel_closed"] = True
            f["panel_open"] = False
            return [ok("Panel closed", "Dead front reinstalled.")]

        if a == "inspect:schedule":
            f["breaker_identified"] = True
            return [info(
                "As-built schedule",
                "CKT-12 — Lighting, utility room & stairwell (the luminaire you are "
                "servicing). CKT-14 — Kitchen small-appliance receptacles. "
                "CKT-16 — HVAC air handler.",
                hint="The correct disconnecting means is CKT-12.",
            )]

        if a.startswith("toggle:breaker:"):
            bid = a.split(":")[-1]
            if not f["panel_open"]:
                return [warn("panel_closed", "Panel is closed",
                             "Open the panel door before operating a breaker.")]
            if bid != CORRECT_BREAKER:
                if not f["breaker_identified"]:
                    return [warn(
                        "guess_breaker", "Guessing at the disconnecting means",
                        f"You operated {bid.upper()} without identifying the circuit. "
                        "Switching the wrong breaker kills power somewhere else and "
                        "leaves your circuit live — you would then 'verify dead' on the "
                        "wrong assumption.",
                        "minor",
                        hint="Read the as-built schedule on the panel door first.",
                        reference="NEC 408.4",
                    )]
                return [warn(
                    "wrong_breaker", "Wrong circuit",
                    f"{bid.upper()} does not feed this luminaire. You have "
                    "de-energized an unrelated circuit and your switch is still live.",
                    "minor",
                    hint="CKT-12 is the lighting circuit.",
                    reference="NEC 408.4",
                )]
            # correct breaker
            if not f["breaker_identified"]:
                out.append(warn(
                    "lucky_guess", "Right breaker, wrong method",
                    "Correct circuit — but you did not positively identify it first. "
                    "Right answer by luck is still an unsafe method.", "minor",
                ))
            if f["locked"]:
                return out + [warn("locked_out", "Breaker is locked out",
                                   "The lockout device prevents operation. Remove it "
                                   "only after the work is complete and the cover is on.")]
            if f["breaker_off"]:
                f["breaker_on"] = True
                f["breaker_off"] = False
                return out + [ok("CKT-12 energized", "Breaker ON. Circuit restored.")]
            if not f["ppe_gloves"]:
                out.append(warn("no_gloves_breaker", "Gloves missing",
                                "Operate the breaker with insulating gloves on.", "minor"))
            f["breaker_off"] = True
            f["breaker_on"] = False
            return out + [ok("CKT-12 de-energized",
                             "Breaker OFF. It is not yet safe — apply lockout/tagout.")]

        if a == "apply:lockout":
            if not f["panel_open"]:
                return [warn("panel_closed", "Panel is closed", "Open the panel first.")]
            if not f["breaker_off"]:
                return [warn(
                    "loto_live", "Cannot lock out an energized circuit",
                    "Lockout/tagout secures a disconnecting means in the OFF position. "
                    "De-energize CKT-12 first.",
                    "major", hint="Throw CKT-12 to OFF, then apply the lock.",
                    reference="OSHA 1910.147",
                )]
            if f["locked"]:
                return [info("Already locked", "Lockout device is already applied.")]
            f["locked"] = True
            return [ok("Lockout/tagout applied",
                       "CKT-12 is locked in the OFF position and tagged. The circuit "
                       "cannot be re-energized while you work.")]

        if a == "remove:lockout":
            if not f["locked"]:
                return [info("No lock", "There is no lockout device applied.")]
            if not f["cover_on"]:
                return [warn(
                    "loto_early", "Removing the lock with the box still open",
                    "The equipment is not restored to a normal condition — the cover "
                    "is off and terminations are exposed. Reinstall the cover plate "
                    "before removing your lock.",
                    "major",
                    why="Locks come off only after equipment is restored and personnel are clear.",
                    hint="Reinstall the cover plate first.",
                    reference="OSHA 1910.147(e)",
                )]
            f["locked"] = False
            f["lock_removed"] = True
            return [ok("Lockout removed",
                       "Your lock is off. Restore power and functionally test the work.")]

        # ---- Box work --------------------------------------------------
        if a == "remove:cover":
            if not f["verified_dead"]:
                return [self._contact(
                    "Opening energized equipment",
                    "You are removing the cover of equipment that has not been "
                    "verified de-energized. Exposed terminations at 120 V are a "
                    "shock and arc-flash hazard.",
                )]
            f["cover_off"] = True
            f["cover_on"] = False
            return [ok("Cover plate removed",
                       "Terminations are visible. Verify condition before disturbing them.")]

        if a == "remove:switch":
            if not f["verified_dead"]:
                return [self._contact(
                    "Contact with energized conductors",
                    "You reached into the box and contacted conductors that have not "
                    "been verified de-energized. This is the injury mechanism the "
                    "entire isolation procedure exists to prevent.",
                )]
            if not f["cover_off"]:
                return [warn("cover_on", "Cover still on", "Remove the cover plate first.")]
            if not f["ppe_gloves"]:
                out.append(warn("no_gloves_work", "Gloves missing",
                                "Handling conductors without insulating gloves.", "minor"))
            f["switch_out"] = True
            return out + [ok("Old switch removed",
                             "Device is out. Inspect conductor condition — nicked or "
                             "tinned copper must be cut back and re-stripped.")]

        if a.startswith("strip:"):
            wire = a.split(":")[1]
            if wire not in WIRE_LABEL:
                return [info("Unknown conductor", "No such conductor in this box.")]
            if not f["verified_dead"]:
                return [self._contact(
                    "Contact with energized conductors",
                    "You are preparing conductors that have not been verified "
                    "de-energized.",
                )]
            if not f["switch_out"]:
                return [warn("switch_in", "Device still in place",
                             "Remove the old switch before preparing conductors.")]
            if wire in f["stripped"]:
                return [info("Already stripped", f"{WIRE_LABEL[wire]} is already prepared.")]
            f["stripped"].append(wire)
            n = len(f["stripped"])
            return [ok(
                f"Stripped: {WIRE_LABEL[wire]}",
                f"Conductor prepared to the device gauge length. "
                f"{4 - n} conductor(s) remaining." if n < 4 else
                "All four conductors prepared. Copper is fully contained by the "
                "terminal when landed.",
            )]

        if a.startswith("connect:"):
            try:
                wire, terminal = a.split(":")[1].split("@")
            except ValueError:
                return [info("Malformed action", "Pick a conductor, then a destination.")]
            if wire not in WIRE_LABEL or terminal not in TERMINAL_LABEL:
                return [info("Invalid target", "Unknown conductor or terminal.")]
            if not f["verified_dead"]:
                return [self._contact(
                    "Contact with energized conductors",
                    "You are terminating conductors in equipment that has not been "
                    "verified de-energized.",
                )]
            if not f["switch_out"]:
                return [warn("switch_in", "Device still in place",
                             "Remove the old switch before terminating.")]
            if wire not in f["stripped"]:
                return [warn("not_stripped", "Conductor not prepared",
                             f"Strip the {WIRE_LABEL[wire]} before terminating it.")]
            if wire in f["wires"]:
                previous = f["wires"].pop(wire)
                s.rework += 1
                out.append(info("Re-terminating",
                                f"{WIRE_LABEL[wire]} removed from "
                                f"{TERMINAL_LABEL[previous]}."))

            # ---- code violations -------------------------------------
            if wire == "white_neutral" and terminal in ("line", "load"):
                f["wires"][wire] = terminal
                return out + [warn(
                    "switched_neutral", "Switched grounded conductor — code violation",
                    "You have landed the white grounded conductor on a brass switch "
                    "terminal. The switch now interrupts the neutral: the luminaire "
                    "shell stays energized at 120 V with the switch OFF and the lamp "
                    "apparently 'dead'. This kills people during lamp changes.",
                    "major",
                    why="NEC 404.2(B) requires the switch to interrupt the ungrounded conductor.",
                    hint="White belongs in the neutral pigtail under the wire nut, "
                         "never on a switch terminal.",
                    reference="NEC 404.2(B)",
                )]
            if wire == "bare_ground" and terminal in ("line", "load"):
                f["wires"][wire] = terminal
                return out + [warn(
                    "ground_on_terminal", "Ground on a current-carrying terminal",
                    "The equipment grounding conductor is not a circuit conductor. "
                    "Landing it on a brass terminal defeats the fault-clearing path.",
                    "major", hint="Bare goes to the green ground screw.",
                    reference="NEC 250.130",
                )]
            if wire in ("black_line", "black_load") and terminal == "neutral_nut":
                f["wires"][wire] = terminal
                return out + [warn(
                    "hot_in_neutral", "Ungrounded conductor in the neutral splice",
                    "You have joined an ungrounded (hot) conductor to the neutral "
                    "pigtail — that creates a direct line-to-neutral fault path and "
                    "an always-live luminaire.",
                    "major", hint="Black conductors go to LINE and LOAD.",
                    reference="NEC 200.4",
                )]

            correct = CORRECT_LANDING[wire]
            if terminal != correct:
                s.rework += 1
                return out + [warn(
                    "wrong_landing", "Incorrect landing",
                    f"{WIRE_LABEL[wire].capitalize()} does not belong on the "
                    f"{TERMINAL_LABEL[terminal]}. Think about what this conductor does.",
                    "minor",
                    hint=f"The correct destination is the {TERMINAL_LABEL[correct]}.",
                )]

            f["wires"][wire] = terminal
            n = len(f["wires"])
            return out + [ok(
                f"Landed: {WIRE_LABEL[wire]} → {TERMINAL_LABEL[terminal]}",
                f"Correct. {4 - n} conductor(s) left to terminate." if n < 4 else
                "All four conductors terminated. Now torque them.",
            )]

        if a == "tighten:terminals":
            if len(f["wires"]) < 4:
                return [warn("incomplete", "Not all conductors landed",
                             "Terminate all four conductors before torquing.")]
            f["tightened"] = True
            return [ok("Terminals torqued",
                       "All terminations snug and tug-tested. No copper visible "
                       "outside the terminal.")]

        if a == "restore:cover":
            if not f["cover_off"]:
                return [info("Cover is on", "The cover plate is already installed.")]
            missing = [w for w in CORRECT_LANDING if w not in f["wires"]]
            if missing:
                return [warn(
                    "cover_incomplete", "Terminations incomplete",
                    "You are closing up with "
                    + ", ".join(WIRE_LABEL[m] for m in missing)
                    + " not landed.", "minor",
                )]
            f["cover_on"] = True
            f["cover_off"] = False
            return [ok("Cover plate reinstalled",
                       "Equipment is restored. You may now remove your lock.")]

        # ---- Restore & test -------------------------------------------
        if a == "flip:switch":
            if not f["breaker_on"]:
                return [warn("no_power", "No power",
                             "Restore power at the panel before testing.")]
            if not f["tightened"]:
                return [warn(
                    "loose_terminal", "Loose termination — arc fault",
                    "The luminaire flickers and the connection is warm. You restored "
                    "energy with loose terminations; this is exactly how residential "
                    "electrical fires start.",
                    "major",
                    why="Loose terminals heat under load and arc.",
                    hint="De-energize, torque to the listed value, and retest.",
                    reference="NEC 110.14(D)",
                )]
            wiring_ok = f["wires"] == CORRECT_LANDING
            if not wiring_ok:
                return [warn(
                    "no_operation", "Luminaire does not operate",
                    "The switch operates but the lamp stays off. Your terminations do "
                    "not produce a switched ungrounded conductor. Re-check each landing.",
                    "major",
                    hint="Hot feed → LINE, switch leg → LOAD, bare → ground screw, "
                         "white → neutral pigtail.",
                )]
            f["light_on"] = True
            f["complete"] = True
            return [ok("Functional test passed",
                       "The luminaire operates correctly from the switch. Work complete.")]

        return [info("No effect", f"Nothing useful happens from '{a}' here.")]

    # ------------------------------------------------------------------

    def _contact(self, title: str, message: str) -> Dict:
        return warn(
            "energized_contact", title, message, "critical",
            why="An electrically safe work condition must be established — "
                "de-energize, lock out, verify dead at the point of work, re-prove "
                "the tester — before any contact.",
            hint="Prove the tester, confirm it is live, then de-energize, "
                 "lock out, and verify dead at the switch box.",
            reference="NFPA 70E 120.5",
        )

    def final_checks(self, s) -> List[Dict]:
        f = s.flags
        out: List[Dict] = []
        if "bare_ground" not in f["wires"] or f["wires"].get("bare_ground") != "ground":
            out.append(warn("no_ground", "Equipment grounding conductor not terminated",
                            "The device was energized without an effective fault-clearing "
                            "path. A ground fault would leave the enclosure energized.",
                            "major", reference="NEC 250.130"))
        if not f["reproven"]:
            out.append(warn("no_reprove", "Live-dead-live not completed",
                            "You trusted a DEAD reading without re-proving the tester "
                            "afterwards, so a mid-task instrument failure would go "
                            "unnoticed.", "minor", reference="NFPA 70E 120.5(9)"))
        if not (f["ppe_glasses"] and f["ppe_gloves"]):
            out.append(warn("no_ppe", "PPE not worn for the full task",
                            "PPE gaps were recorded during the task.", "minor",
                            reference="NFPA 70E 130.7"))
        return out
