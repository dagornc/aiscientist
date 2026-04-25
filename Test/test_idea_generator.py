"""Tests for idea generation service."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from app.models.idea import Idea, IdeaGenerationRequest, IdeaStatus
from app.services.idea_generator import IdeaGenerator


@pytest.fixture
def mock_llm() -> MagicMock:
    """Create a mock LLM."""
    llm = MagicMock()
    llm.model_name = "test-model"
    return llm


@pytest.fixture
def mock_literature() -> MagicMock:
    """Create a mock literature service."""
    service = MagicMock()
    service.check_novelty.return_value = (8.0, [])
    return service


class TestIdeaGenerator:
    """Tests for IdeaGenerator."""

    @patch("app.services.idea_generator.LiteratureSearchService")
    @patch("app.services.idea_generator.create_chat_model")
    def test_generate_returns_ideas(
        self,
        mock_create_llm: MagicMock,
        mock_lit_cls: MagicMock,
        mock_llm: MagicMock,
        mock_literature: MagicMock,
    ) -> None:
        """Test that generate returns ideas from LLM output."""
        mock_create_llm.return_value = mock_llm
        mock_lit_cls.return_value = mock_literature

        llm_response = MagicMock()
        llm_response.content = '''```json
        [
            {
                "title": "Test Idea",
                "description": "A test research idea",
                "keywords": ["test", "ml"],
                "experiment_plan": "Run baseline and compare"
            }
        ]
        ```'''
        mock_llm.invoke.return_value = llm_response

        generator = IdeaGenerator()
        request = IdeaGenerationRequest(
            research_area="Test area",
            num_ideas=1,
        )
        result = generator.generate(request)

        assert len(result.ideas) >= 1
        assert result.ideas[0].title == "Test Idea"
        assert result.ideas[0].status == IdeaStatus.NOVELTY_CHECKED

    @patch("app.services.idea_generator.LiteratureSearchService")
    @patch("app.services.idea_generator.create_chat_model")
    def test_generate_handles_invalid_json(
        self,
        mock_create_llm: MagicMock,
        mock_lit_cls: MagicMock,
        mock_llm: MagicMock,
        mock_literature: MagicMock,
    ) -> None:
        """Test fallback when LLM returns invalid JSON."""
        mock_create_llm.return_value = mock_llm
        mock_lit_cls.return_value = mock_literature

        llm_response = MagicMock()
        llm_response.content = "This is not JSON"
        mock_llm.invoke.return_value = llm_response

        generator = IdeaGenerator()
        request = IdeaGenerationRequest(research_area="Test", num_ideas=1)
        result = generator.generate(request)

        assert len(result.ideas) >= 1

    def test_idea_overall_score(self) -> None:
        """Test the overall_score property calculation."""
        idea = Idea(
            title="Test",
            description="Test",
            novelty_score=8.0,
            feasibility_score=6.0,
            impact_score=7.0,
        )
        expected = 0.4 * 8.0 + 0.3 * 6.0 + 0.3 * 7.0
        assert abs(idea.overall_score - expected) < 0.01
