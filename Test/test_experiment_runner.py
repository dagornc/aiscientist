"""Tests for experiment runner service."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from app.models.experiment import ExperimentStatus
from app.models.idea import Idea, IdeaStatus
from app.services.experiment_runner import ExperimentRunner


class TestExperimentRunner:
    """Tests for ExperimentRunner."""

    @patch("app.services.experiment_runner.create_chat_model")
    def test_generate_code_returns_string(
        self,
        mock_create_llm: MagicMock,
    ) -> None:
        """Test that generate_code returns a code string."""
        mock_llm = MagicMock()
        mock_create_llm.return_value = mock_llm

        llm_response = MagicMock()
        llm_response.content = "```python\ndef run_experiment():\n    return {'metrics': {}}\n```"
        mock_llm.invoke.return_value = llm_response

        runner = ExperimentRunner()
        idea = Idea(title="Test", description="Test", experiment_plan="Test plan", status=IdeaStatus.SELECTED)
        code = runner.generate_code(idea)

        assert isinstance(code, str)
        assert "run_experiment" in code
        assert "```" not in code

    @patch("app.services.experiment_runner.create_chat_model")
    def test_run_local_returns_experiment(
        self,
        mock_create_llm: MagicMock,
    ) -> None:
        """Test run_local returns an experiment with simulated results."""
        mock_llm = MagicMock()
        mock_create_llm.return_value = mock_llm

        llm_response = MagicMock()
        llm_response.content = "def run_experiment(): return {}"
        mock_llm.invoke.return_value = llm_response

        runner = ExperimentRunner()
        idea = Idea(title="Test", description="Test", experiment_plan="Plan", status=IdeaStatus.SELECTED)
        experiment = runner.run_local(idea)

        assert experiment.status == ExperimentStatus.COMPLETED
        assert experiment.results.get("status") == "simulated"
