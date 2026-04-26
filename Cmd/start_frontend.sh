#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# AI Scientist — Start Frontend
# Usage: ./Cmd/start_frontend.sh [--dev]
# ─────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT/Code/Frontend"

if [ ! -d node_modules ]; then
    echo "⚠️  Node modules not found. Run ./Cmd/install.sh first."
    exit 1
fi

echo "🎨 Starting AI Scientist frontend..."
npm run dev -- --host 0.0.0.0 --port 5173
