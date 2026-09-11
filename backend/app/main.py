from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import llm
from .scenarios import get_scenario
from .session import SessionManager

manager = SessionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await manager.start()
    yield
    await manager.stop()


app = FastAPI(
    title="Vocational Simulator — AI Coach Service",
    version="1.0.0",
    description=(
        "Real-time procedural coaching and competency assessment for VR/web "
        "vocational training scenarios. Scenario logic is a deterministic rule "
        "engine; an optional LLM layer re-voices coach content."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CreateSession(BaseModel):
    scenario: str


@app.get("/api/health")
async def health():
    return {"ok": True, "llm": llm.enabled(), "sessions": len(manager.sessions)}


@app.get("/api/scenarios")
async def scenarios():
    return {"scenarios": manager.catalog()}


@app.post("/api/session")
async def create_session(body: CreateSession):
    try:
        s = manager.create(body.scenario)
    except KeyError as e:
        raise HTTPException(400, str(e))
    return {"sessionId": s.id, "scenario": s.scenario.meta()}


@app.get("/api/session/{sid}")
async def session_state(sid: str):
    s = manager.get(sid)
    if not s:
        raise HTTPException(404, "session not found")
    return s.state()


@app.get("/api/session/{sid}/report")
async def session_report(sid: str):
    from .scoring import score_session

    s = manager.get(sid)
    if not s:
        raise HTTPException(404, "session not found")
    return score_session(s)


@app.websocket("/ws/{sid}")
async def websocket_endpoint(websocket: WebSocket, sid: str):
    s = manager.get(sid)
    if s is None:
        await websocket.accept()
        await websocket.send_json({"type": "error", "payload": {"message": "unknown session"}})
        await websocket.close()
        return

    await websocket.accept()
    s.ws = websocket
    from .coach import greeting

    await s.send({"type": "coach", "payload": greeting(s.scenario)})
    await s.send_state()

    try:
        while True:
            raw = await websocket.receive_text()
            import json
            try:
                msg = json.loads(raw)
            except ValueError:
                await s.send({"type": "error", "payload": {"message": "bad json"}})
                continue
            await manager.handle(s, msg)
    except WebSocketDisconnect:
        s.ws = None
    except Exception as e:  # pragma: no cover
        s.ws = None
        try:
            await websocket.close()
        except Exception:
            pass


# Serve a production frontend build if one has been placed next to the backend.
DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")
if os.path.isdir(DIST):
    app.mount("/", StaticFiles(directory=DIST, html=True), name="static")
