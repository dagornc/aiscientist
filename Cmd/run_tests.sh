#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# AI Scientist — Run Tests
# Usage: ./Cmd/run_tests.sh [--backend|--frontend|--all]
# ─────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

SCOPE="${1:---all}"

run_backend_tests() {
    echo "🧪 Running backend tests..."
    cd "$PROJECT_ROOT/Code/Backend"
    if [ -d .venv ]; then
        source .venv/bin/activate
    fi
    python -m pytest "$PROJECT_ROOT/Test/" -v --tb=short --cov=app --cov-report=term-missing 2>&1 | tee "$PROJECT_ROOT/Log/test_results.log"
    echo "✅ Backend tests done."
}

run_frontend_tests() {
    echo "🧪 Running frontend tests..."
    cd "$PROJECT_ROOT/Code/Frontend"
    npm run build 2>&1 | tee -a "$PROJECT_ROOT/Log/test_results.log"
    npm run lint 2>&1 | tee -a "$PROJECT_ROOT/Log/test_results.log"
    echo "✅ Frontend tests done."
}

case "$SCOPE" in
    --backend)  run_backend_tests ;;
    --frontend) run_frontend_tests ;;
    --all)      run_backend_tests; run_frontend_tests ;;
    *)          echo "Usage: $0 [--backend|--frontend|--all]"; exit 1 ;;
esac
