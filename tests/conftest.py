"""Pytest configuration — adds Backend to Python path and provides test fixtures."""

from __future__ import annotations

import sys
from unittest.mock import MagicMock, patch
from pathlib import Path

import pytest

# Add Backend/app to sys.path so `from app.xxx` works in tests
backend_dir = Path(__file__).resolve().parent.parent / "Code" / "Backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))


@pytest.fixture
def mock_llm():
    """Mock LLM fixture that patches create_chat_model with a mock."""
    with patch('app.core.llm_factory.create_chat_model') as mock_create_chat:
        # Create a mock LLM instance
        mock_llm_instance = MagicMock()
        mock_create_chat.return_value = mock_llm_instance
        yield mock_llm_instance


@pytest.fixture
def test_db():
    """Test database fixture (will be implemented when SQLAlchemy is added)."""
    # This will be expanded when database integration is added
    # For now, we just return None or can implement with SQLite for testing
    yield None