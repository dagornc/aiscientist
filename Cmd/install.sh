#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# AI Scientist — Installation & Prerequisites Check
# Usage: ./Cmd/install.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# ── Check Python ──────────────────────────────────────────────
if command -v python3 &>/dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    log_info "Python found: $PYTHON_VERSION"
else
    log_error "Python 3.9+ is required. Install it first."
    exit 1
fi

# ── Check Node.js ─────────────────────────────────────────────
if command -v node &>/dev/null; then
    NODE_VERSION=$(node --version 2>&1)
    log_info "Node.js found: $NODE_VERSION"
else
    log_error "Node.js 20+ is required. Install it first."
    exit 1
fi

# ── Check Docker ──────────────────────────────────────────────
if command -v docker &>/dev/null; then
    DOCKER_VERSION=$(docker --version 2>&1 | awk '{print $3}' | tr -d ',')
    log_info "Docker found: $DOCKER_VERSION"
else
    log_warn "Docker not found. Sandbox execution will be disabled."
fi

# ── Check pdflatex ────────────────────────────────────────────
if command -v pdflatex &>/dev/null; then
    log_info "pdflatex found"
else
    log_warn "pdflatex not found. Paper compilation will be disabled. Install texlive-latex-base."
fi

# ── Create .env if missing ────────────────────────────────────
if [ ! -f .env ]; then
    cp .env.example .env 2>/dev/null || true
    log_warn ".env created from .env.example — fill in your API keys!"
fi

# ── Create Log directory ─────────────────────────────────────
mkdir -p Log

# ── Backend setup ─────────────────────────────────────────────
log_info "Setting up backend..."
cd "$PROJECT_ROOT/Code/Backend"

if [ ! -d .venv ]; then
    log_info "Creating Python virtual environment..."
    python3 -m venv .venv
fi

source .venv/bin/activate
log_info "Installing Python dependencies..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# ── Frontend setup ────────────────────────────────────────────
log_info "Setting up frontend..."
cd "$PROJECT_ROOT/Code/Frontend"

if [ -f package.json ]; then
    log_info "Installing Node.js dependencies..."
    npm install --silent 2>/dev/null || npm install
fi

# ── Done ──────────────────────────────────────────────────────
echo ""
log_info "✅ Installation complete!"
echo ""
echo "  Start backend:  ./Cmd/start_backend.sh"
echo "  Start frontend: ./Cmd/start_frontend.sh"
echo "  Or start both:  ./Cmd/start.sh"
echo ""
