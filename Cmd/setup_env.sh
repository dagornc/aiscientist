#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/Code/Backend"
VENV_DIR="$BACKEND_DIR/.venv"

echo "🔧 Setting up Autosearch environment..."

# Check Python
if ! command -v python3 &>/dev/null; then
    echo "❌ Python 3.9+ is required"
    exit 1
fi

# Create venv
if [ ! -d "$VENV_DIR" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Activate and install
source "$VENV_DIR/bin/activate"
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r "$BACKEND_DIR/requirements.txt"

echo "✅ Environment setup complete"
