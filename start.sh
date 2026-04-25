#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════
# Autosearch — AI Scientist Launcher
# Checks prerequisites, installs deps, starts services
# ═══════════════════════════════════════════════════════

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🧪 Autosearch — AI Scientist"
echo "═════════════════════════════"

# ── Check prerequisites ────────────────────────────────
check_command() {
    if command -v "$1" &>/dev/null; then
        echo -e "  ${GREEN}✓${NC} $1 found"
        return 0
    else
        echo -e "  ${RED}✗${NC} $1 not found"
        return 1
    fi
}

echo ""
echo "📋 Checking prerequisites..."
MISSING=0

check_command python3 || MISSING=1
check_command node || MISSING=1
check_command npm || MISSING=1

if [ "$MISSING" -eq 1 ]; then
    echo ""
    echo -e "${RED}Missing prerequisites. Please install them and try again.${NC}"
    exit 1
fi

# ── Check .env ─────────────────────────────────────────
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo ""
    echo -e "${YELLOW}⚠ No .env file found. Copying from .env.example${NC}"
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
fi

# ── Setup backend ──────────────────────────────────────
echo ""
echo "🔧 Setting up backend..."
bash "$PROJECT_ROOT/Cmd/setup_env.sh"

# ── Setup frontend ─────────────────────────────────────
echo ""
echo "🔧 Setting up frontend..."
cd "$PROJECT_ROOT/Code/Frontend"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# ── Start services ─────────────────────────────────────
echo ""
echo "🚀 Starting services..."

# Start backend in background
cd "$PROJECT_ROOT/Code/Backend"
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID (http://localhost:8000)"

# Start frontend in background
cd "$PROJECT_ROOT/Code/Frontend"
npm run dev &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID (http://localhost:5173)"

# Open browser
sleep 3
if command -v xdg-open &>/dev/null; then
    xdg-open http://localhost:5173
elif command -v open &>/dev/null; then
    open http://localhost:5173
elif command -v google-chrome &>/dev/null; then
    google-chrome http://localhost:5173
fi

echo ""
echo -e "${GREEN}✅ Autosearch is running!${NC}"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for any process to exit
wait -n 2>/dev/null || wait

# Cleanup
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
echo "Services stopped."
