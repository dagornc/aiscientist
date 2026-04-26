#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# AI Scientist — Start Everything
# Usage: ./Cmd/start.sh
# Starts backend + frontend, opens Chrome
# ─────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# ── Prerequisites check ───────────────────────────────────────
if ! command -v python3 &>/dev/null; then
    echo "❌ Python3 not found. Run ./Cmd/install.sh"
    exit 1
fi

if ! command -v node &>/dev/null; then
    echo "❌ Node.js not found. Run ./Cmd/install.sh"
    exit 1
fi

# ── Load .env ─────────────────────────────────────────────────
if [ -f .env ]; then
    set -a; source .env; set +a
fi

mkdir -p Log

# ── Start backend in background ───────────────────────────────
echo "🚀 Starting backend..."
"$PROJECT_ROOT/Cmd/start_backend.sh" --dev &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# ── Wait for backend to be ready ──────────────────────────────
echo "⏳ Waiting for backend..."
for i in $(seq 1 30); do
    if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
        echo "   ✅ Backend ready!"
        break
    fi
    sleep 1
done

# ── Start frontend in background ──────────────────────────────
echo "🎨 Starting frontend..."
"$PROJECT_ROOT/Cmd/start_frontend.sh" --dev &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# ── Wait for frontend ─────────────────────────────────────────
sleep 3

# ── Open browser ──────────────────────────────────────────────
FRONTEND_URL="http://localhost:5173"
if command -v google-chrome &>/dev/null; then
    google-chrome "$FRONTEND_URL" 2>/dev/null &
elif command -v chromium &>/dev/null; then
    chromium "$FRONTEND_URL" 2>/dev/null &
elif command -v xdg-open &>/dev/null; then
    xdg-open "$FRONTEND_URL" 2>/dev/null &
fi

echo ""
echo "🧬 AI Scientist is running!"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "   Stop: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# ── Trap exit ─────────────────────────────────────────────────
trap "echo '🛑 Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
