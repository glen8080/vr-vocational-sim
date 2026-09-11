# TradeSim — VR/AR Vocational Simulator with AI Coach

A web-based 3D simulator for psychomotor skills training in vocational
education. Students perform real procedures on procedural 3D jobs; a
real-time AI coach watches their **method** (not just the result) and
assesses safety, sequencing and efficiency against the same rubric an
assessor would use.

> **Why method, not just outcome?** A student can finish a wiring task
> quickly while switching the neutral conductor — and the luminaire will
> still work. The test is whether the person can be trusted to do it
> alone on a customer's wall tomorrow.

## What's in the box

| Layer        | Tech                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| 3D frontend  | React 18 + **@react-three/fiber** + drei (procedural geometry, no asset downloads)      |
| AI coach API | **FastAPI** + **WebSockets** + rule-engine FSM (deterministic, LLM-optional)             |
| State        | zustand (client) · Python dicts (server, sticky-step completion)                        |
| Grading      | 3-axis rubric (safety / efficiency / completion) + 5-dim competency radar + band label  |

The whole stack is self-contained — no external CDN calls, no asset
downloads, runs offline once dependencies are installed.

## Scenarios shipped

### 1. Residential Electrical — Replace a single-pole switch (17 graded steps)

A utility-room luminaire is controlled by a failed single-pole switch on a
live 120 V circuit. The student must:

1. **Don PPE** (safety glasses + insulating gloves)
2. **Prove the voltage tester** on a known-live receptacle
3. **Confirm the circuit is energized** at the switch box
4. **Open the panel and identify** the correct breaker (CKT-12 — Lighting)
5. **De-energize** the circuit
6. **Apply lockout/tagout** (OSHA 1910.147)
7. **Verify the circuit is de-energized** at the point of work
8. **Re-prove the tester** (complete the *live-dead-live* sequence — NFPA 70E)
9. Remove the cover plate
10. Remove the failed switch
11. Strip the four conductors
12. **Terminate correctly** — line/load/ground/neutral-pigtail (NEC 404 / 250)
13. Tighten to the listed torque
14. Reinstall the cover plate
15. Remove the lockout/tagout
16. Restore power
17. Functional test

The rule engine recognises every code violation the assessment cares about:
*switched neutral, equipment ground on a brass terminal, hot in the neutral
pigtail, unproven tester, missed re-prove, premature LOTO removal, loose
terminations, contact with an energized conductor.* Each has a weighted
deduction and is referenced to the standard that says so.

### 2. Plumbing — Replace a 1½″ kitchen sink P-trap (10 graded steps)

Sequence-heavy: almost every error a novice makes here is doing the right
thing in the wrong order. The engine flags every one of them.

## What the AI coach does

* **Immediate, causal feedback** — every action returns a structured
  payload (`{what, why, next, reference}`) and the student sees the
  result before their next click.
* **Escalating hints** — *orienting question → specific instruction →
  worked example*. A student who is flowing gets more thinking time; one
  who is struggling gets coached sooner.
* **Adaptive scaffolding** — the coach maintains a per-dimension
  *mastery* estimate that updates on every violation and every clean
  step completion. Idle-delay scales with mastery (desirable difficulty).
* **Stall observation** — if a student hits the same error three times
  in a row, the coach explicitly suggests going back one step.
* **Optional LLM voice** — if `LLM_API_KEY` and `LLM_API_BASE` are set,
  every coach payload is re-voiced through a GPT-class model. The
  *pedagogy* stays in the rule engine; only the phrasing is delegated.

## How to run

```bash
./run.sh
# → Web app    http://localhost:5173/
# → Coach API  http://localhost:8000/api/health
```

Manual:

```bash
# terminal 1 — coach service
cd backend && python3.11 -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# terminal 2 — frontend
cd frontend && pnpm dev
```

## API surface

| Method | Path                          | Purpose                                        |
| ------ | ----------------------------- | ---------------------------------------------- |
| GET    | `/api/health`                 | `{ok, llm, sessions}`                          |
| GET    | `/api/scenarios`              | List of available scenarios with steps          |
| POST   | `/api/session`                | `{scenario}` → `{sessionId, scenario}`         |
| GET    | `/api/session/{id}`           | Current session state (authoritative)          |
| GET    | `/api/session/{id}/report`    | Live competency report (also sent on `complete`) |
| WS     | `/ws/{id}`                    | Bidirectional coach channel                    |

WebSocket message types (client → server): `action`, `hint`, `reset`, `ping`.
Server → client: `state`, `coach`, `complete`, `error`.

## Design notes

* **Steps are sticky** — once a step is genuinely performed (e.g. you
  isolated the circuit), it stays performed even when a later action
  changes the flag that proved it (you close the panel, the breaker is
  restored). This avoids the perverse behaviour of a panel that "un-
  isolates" the circuit.
* **Critical breaches cap the grade** — no matter how fast or clean the
  rest of the run, a contact with an energized conductor limits the
  overall score to 58. A fast unsafe attempt is a failed attempt.
* **Exam mode** — the toolbelt's "Rings off" toggle hides every
  interaction hotspot, so the assessment measures recall of procedure
  rather than the ability to find the next glowing ring.
* **Procedural assets** — every prop is built at runtime from THREE
  primitives. No GLTF/HDRI downloads, no CDN. The whole 3D scene works
  on a plane.

## Repo layout

```
vr-vocational-sim/
├── run.sh                     # one-shot launcher
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py            # FastAPI + WS
│       ├── session.py         # session state + adaptive coach loop
│       ├── scoring.py         # 3-axis rubric + 5-dim radar
│       ├── coach.py           # event narration + escalating hints
│       ├── llm.py             # optional LLM re-voicing
│       └── scenarios/
│           ├── base.py        # Step, Scenario, mk(), ok(), warn()
│           ├── electrical.py  # 17-step residential switch replacement
│           └── plumbing.py    # 10-step kitchen P-trap replacement
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx, App.jsx
        ├── styles.css         # design system (no CSS framework)
        ├── store.js           # zustand + WS transport
        ├── toolbelt.js        # contextual instrument definitions
        ├── net.js             # WS client
        └── components/
            ├── Scene.jsx          # Canvas + camera rig
            ├── HUD.jsx            # header (timer, scores, par)
            ├── TaskPanel.jsx      # procedure + mastery radar
            ├── CoachPanel.jsx     # live coach log
            ├── Toolbelt.jsx       # contextual instrument tray
            ├── ReportModal.jsx    # competency report card
            ├── StartScreen.jsx    # scenario picker
            ├── Icon.jsx           # line-icon set
            └── scenes/
                ├── parts.jsx          # shared 3D primitives
                ├── ElectricalScene.jsx
                └── PlumbingScene.jsx
```

## Extending

Adding a scenario is a single file in `backend/app/scenarios/` and
(optionally) a scene component in `frontend/src/components/scenes/`.
The scenario declares steps and a `handle(session, action)` function that
maps every student action to either a state transition or a violation.
The frontend's `toolbelt.js` and the scene component consume the
authoritative `state.flags` — no other coupling is required.
