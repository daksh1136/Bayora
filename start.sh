#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "    🛡️ BAYORA - ZERO-TRUST AI TESTING INFRASTRUCTURE     "
echo "      Team Avinya: Daksh Sharma, Raj, Somesh             "
echo "=========================================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# 1. Check or initialize Python virtual environment
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

source .venv/bin/activate
echo "Installing/verifying backend dependencies..."
pip install -q -r backend/requirements.txt

# 2. Check frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "Running automated backend verification suite..."
export PYTHONPATH="$ROOT_DIR${PYTHONPATH:+:$PYTHONPATH}"
pytest backend/tests -q

if lsof -i :8000 >/dev/null 2>&1; then
    PORT=8080
else
    PORT=8000
fi
export VITE_BACKEND_PORT=$PORT

echo "=========================================================="
echo " Starting Bayora Backend (FastAPI) on port $PORT..."
echo "=========================================================="
python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT &
BACKEND_PID=$!

echo "=========================================================="
echo " Starting Bayora Frontend (Vite) on port 5173..."
echo "=========================================================="
cd frontend
VITE_BACKEND_PORT=$PORT npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
cd ..

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit" SIGINT SIGTERM

echo ""
echo "🚀 BAYORA PLATFORM IS LIVE!"
echo "   - Web Dashboard:    http://localhost:5173"
echo "   - Interactive Docs: http://localhost:$PORT/docs"
echo "   - Prometheus Feed:  http://localhost:$PORT/api/v1/telemetry/metrics"
echo ""
echo "Press Ctrl+C to stop both servers."

wait
