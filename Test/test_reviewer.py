"""Tests for reviewer service."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from app.models.paper import Paper, PaperStatus
from app.models.review import ReviewDecision
from app.services.reviewer import Reviewer


class TestReviewer:
    """Tests for Reviewer."""

    @patch("app.services.reviewer.create_chat_model")
    def test_review_returns_review(
        self,
        mock_create_llm: MagicMock,
    ) -> None:
        """Test that review returns a structured review."""
        mock_llm = MagicMock()
        mock_create_llm.return_value = mock_llm

        review_response = MagicMock()
        review_response.content = '''```json
        {
            "overall_score": 7.0,
            "decision": "weak_accept",
            "confidence": 4.0,
            "soundness": 3.0,
            "presentation": 3.0,
            "contribution": 3.0,
            "strengths": ["Novel approach"],
            "weaknesses": ["Limited experiments"],
            "questions": ["How does this scale?"],
            "suggestions": ["Add more baselines"],
            "summary": "A promising approach."
        }
        ```'''
        mock_llm.invoke.return_value = review_response

        reviewer = Reviewer()
        paper = Paper(
            id="test-paper",
            idea_id="test",
            experiment_id="test",
            title="Test Paper",
            abstract="Test abstract",
            status=PaperStatus.COMPLETED,
        )
        review = reviewer.review(paper, num_reflections=1)

        assert review.overall_score == 7.0
        assert review.decision == ReviewDecision.WEAK_ACCEPT
        assert len(review.strengths) >= 1

    @patch("app.services.reviewer.create_chat_model")
    def test_review_handles_invalid_json(
        self,
        mock_create_llm: MagicMock,
    ) -> None:
        """Test fallback when LLM returns invalid JSON."""
        mock_llm = MagicMock()
        mock_create_llm.return_value = mock_llm

        bad_response = MagicMock()
        bad_response.content = "Not JSON at all"
        mock_llm.invoke.return_value = bad_response

        reviewer = Reviewer()
        paper = Paper(id="p1", idea_id="i1", experiment_id="e1", status=PaperStatus.COMPLETED)
        review = reviewer.review(paper, num_reflections=1)

        assert review.decision == ReviewDecision.BORDERLINE
