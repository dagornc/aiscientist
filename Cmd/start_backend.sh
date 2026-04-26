#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# AI Scientist — Start Backend
# Usage: ./Cmd/start_backend.sh [--dev]
# ─────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

DEV_MODE=false
[ "${1:-}" = "--dev" ] && DEV_MODE=true

# ── Load .env ─────────────────────────────────────────────────
if [ -f .env ]; then
    set -a; source .env; set +a
fi

# ── Create Log directory ─────────────────────────────────────
mkdir -p Log

# ── Activate venv ─────────────────────────────────────────────
cd "$PROJECT_ROOT/Code/Backend"
if [ ! -d .venv ]; then
    echo "⚠️  Virtual environment not found. Run ./Cmd/install.sh first."
    exit 1
fi
source .venv/bin/activate

# ── Run migrations (if using Alembic) ─────────────────────────
if [ -d alembic ]; then
    alembic upgrade head 2>/dev/null || true
fi

# ── Start server ──────────────────────────────────────────────
echo "🚀 Starting AI Scientist backend..."
if [ "$DEV_MODE" = true ]; then
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 2>&1 | tee "$PROJECT_ROOT/Log/backend_app.log"
else
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 2>&1 | tee "$PROJECT_ROOT/Log/backend_app.log"
fi
