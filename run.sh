#!/usr/bin/env bash
# TradeSim — one-shot launcher
# Starts the Python AI-coach service and the Vite dev server.
# Both bind to 0.0.0.0 so the app is reachable from outside the sandbox.

set -e
cd "$(dirname "$0")"

# --- Python service ----------------------------------------------------------
if ! curl -s -o /dev/null -m 1 http://localhost:8000/api/health; then
  echo "▸ starting coach service (uvicorn :8000)"
  (cd backend && nohup python3.11 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/tradesim-backend.log 2>&1 &)
  for i in $(seq 1 20); do
    sleep 0.5
    if curl -s -o /dev/null -m 1 http://localhost:8000/api/health; then break; fi
  done
fi

# --- Frontend ----------------------------------------------------------------
if ! curl -s -o /dev/null -m 1 http://localhost:5173/; then
  echo "▸ starting frontend (vite :5173)"
  (cd frontend && nohup pnpm dev > /tmp/tradesim-frontend.log 2>&1 &)
  for i in $(seq 1 30); do
    sleep 0.5
    if curl -s -o /dev/null -m 1 http://localhost:5173/; then break; fi
  done
fi

echo
echo "  TradeSim running:"
echo "    Web app    http://localhost:5173/"
echo "    Coach API  http://localhost:8000/api/health"
echo
echo "  Logs:  tail -f /tmp/tradesim-*.log"
echo
