"""Pytest configuration — adds Backend to Python path."""

from __future__ import annotations

import sys
from pathlib import Path

# Add Backend/app to sys.path so `from app.xxx` works in tests
backend_dir = Path(__file__).resolve().parent.parent / "Code" / "Backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
