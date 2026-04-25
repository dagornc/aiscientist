#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/Code/Backend"

source "$BACKEND_DIR/.venv/bin/activate"

cd "$BACKEND_DIR"
echo "🚀 Starting backend on http://localhost:8000"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
