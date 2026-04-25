"""Tests for paper writer service."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from app.models.experiment import Experiment, ExperimentStatus
from app.models.idea import Idea, IdeaStatus
from app.models.paper import PaperStatus
from app.services.paper_writer import PaperWriter


class TestPaperWriter:
    """Tests for PaperWriter."""

    @patch("app.services.paper_writer.LiteratureSearchService")
    @patch("app.services.paper_writer.create_chat_model")
    def test_write_paper_returns_paper(
        self,
        mock_create_llm: MagicMock,
        mock_lit_cls: MagicMock,
    ) -> None:
        """Test that write_paper returns a completed paper."""
        mock_llm = MagicMock()
        mock_create_llm.return_value = mock_llm
        mock_lit = MagicMock()
        mock_lit.search.return_value = []
        mock_lit_cls.return_value = mock_lit

        # Mock LLM calls (sections, title, abstract)
        section_response = MagicMock()
        section_response.content = '''```json
        [{"title": "Introduction", "content": "Test content", "citations": []}]
        ```'''
        title_response = MagicMock()
        title_response.content = "A Novel Approach"
        abstract_response = MagicMock()
        abstract_response.content = "This paper proposes..."

        mock_llm.invoke.side_effect = [section_response, title_response, abstract_response]

        writer = PaperWriter()
        idea = Idea(id="test-idea", title="Test", description="Test idea", status=IdeaStatus.COMPLETED)
        experiment = Experiment(id="test-exp", idea_id="test-idea", status=ExperimentStatus.COMPLETED, results={"metrics": {}})

        paper = writer.write_paper(idea, experiment)

        assert paper.status == PaperStatus.COMPLETED
        assert paper.title == "A Novel Approach"
        assert len(paper.sections) >= 1
        assert "\\documentclass" in paper.latex_source
