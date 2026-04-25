"""Experiment runner service — executes experiment code in sandbox.

Generates experiment code from an idea using LLM, then executes
it in a Docker sandbox.
"""

from __future__ import annotations

import json
import logging
import time
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from app.core.llm_factory import create_chat_model
from app.core.sandbox import Sandbox
from app.models.experiment import Experiment, ExperimentStatus
from app.models.idea import Idea

logger = logging.getLogger(__name__)

_CODE_GEN_PROMPT = """\
You are an expert ML researcher writing experiment code. Given a research idea
and experiment plan, generate a complete Python script that:

1. Defines a `run_experiment()` function as the entry point
2. Implements the proposed method and baseline(s)
3. Runs experiments and collects metrics
4. Returns results as a dictionary with keys: metrics, figures, notes

The `run_experiment()` function must return a dict like:
{{"metrics": {{"accuracy": 0.95, "loss": 0.05}}, "figures": [], "notes": "Observations..."}}

Use only: numpy, pandas, matplotlib, scikit-learn, torch (if available).
Do NOT use any file I/O or network access.
Output ONLY the Python code, no explanations.\
"""


class ExperimentRunner:
    """Run experiments for research ideas."""

    def __init__(self) -> None:
        self._llm = create_chat_model()
        self._sandbox = Sandbox()

    def generate_code(self, idea: Idea) -> str:
        """Generate experiment code for the given idea.

        Args:
            idea: The research idea.

        Returns:
            Python code string.
        """
        user_msg = (
            f"Title: {idea.title}\n\n"
            f"Description: {idea.description}\n\n"
            f"Experiment Plan: {idea.experiment_plan}"
        )
        messages = [
            SystemMessage(content=_CODE_GEN_PROMPT),
            HumanMessage(content=user_msg),
        ]
        response = self._llm.invoke(messages)
        code = response.content.strip()
        if code.startswith("```python"):
            code = code[len("```python"):]
        if code.startswith("```"):
            code = code[3:]
        if code.endswith("```"):
            code = code[:-3]
        return code.strip()

    def run(self, idea: Idea, timeout: int = 300) -> Experiment:
        """Generate code and run an experiment for the given idea.

        Args:
            idea: The research idea.
            timeout: Execution timeout in seconds.

        Returns:
            An ``Experiment`` with results.
        """
        experiment = Experiment(
            idea_id=idea.id,
            status=ExperimentStatus.RUNNING,
        )

        try:
            code = self.generate_code(idea)
            experiment.code = code
            logger.info("Generated experiment code for idea %s (%d chars)", idea.id, len(code))

            start_time = time.time()
            result = self._sandbox.execute(code, timeout=timeout)
            elapsed = time.time() - start_time
            experiment.execution_time_seconds = round(elapsed, 2)

            if result.success:
                experiment.status = ExperimentStatus.COMPLETED
                experiment.results = result.data or {}
                logger.info("Experiment completed for idea %s", idea.id)
            else:
                experiment.status = ExperimentStatus.FAILED
                experiment.logs = result.error or "Unknown error"
                logger.warning("Experiment failed for idea %s: %s", idea.id, result.error)

        except Exception as exc:
            experiment.status = ExperimentStatus.FAILED
            experiment.logs = str(exc)
            logger.exception("Experiment error for idea %s", idea.id)

        return experiment

    def run_local(self, idea: Idea, timeout: int = 300) -> Experiment:
        """Run experiment locally (without Docker sandbox).

        Falls back to a simulated execution when Docker is not available.

        Args:
            idea: The research idea.
            timeout: Not used in local mode.

        Returns:
            An ``Experiment`` with simulated results.
        """
        experiment = Experiment(
            idea_id=idea.id,
            status=ExperimentStatus.RUNNING,
        )

        try:
            code = self.generate_code(idea)
            experiment.code = code
            experiment.status = ExperimentStatus.COMPLETED
            experiment.results = {
                "status": "simulated",
                "note": "Docker sandbox not available; code generated but not executed",
                "code_length": len(code),
            }
        except Exception as exc:
            experiment.status = ExperimentStatus.FAILED
            experiment.logs = str(exc)

        return experiment
