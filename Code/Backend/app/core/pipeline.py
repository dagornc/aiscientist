"""LangGraph pipeline — orchestrates the full AI Scientist workflow.

Defines the state machine that drives ideas through:
Idea Generation → Experimental Iteration → Paper Write-up → Peer Review
"""

from __future__ import annotations

import logging
from typing import Any, Literal

from langgraph.graph import END, StateGraph

from app.models.experiment import Experiment, ExperimentStatus
from app.models.idea import Idea, IdeaStatus
from app.models.paper import Paper, PaperStatus
from app.models.review import Review, ReviewDecision
from app.services.experiment_runner import ExperimentRunner
from app.services.idea_generator import IdeaGenerator
from app.services.paper_writer import PaperWriter
from app.services.reviewer import Reviewer

logger = logging.getLogger(__name__)


class PipelineState(dict):  # type: ignore[misc]
    """State for the AI Scientist pipeline.

    Typed as dict for LangGraph compatibility.
    """

    idea: Idea
    experiment: Experiment | None
    paper: Paper | None
    review: Review | None
    status: str
    error: str | None
    iteration: int
    max_iterations: int

    def __init__(self, idea: Idea, max_iterations: int = 3, **kwargs: Any) -> None:
        super().__init__(
            idea=idea,
            experiment=None,
            paper=None,
            review=None,
            status="initialized",
            error=None,
            iteration=0,
            max_iterations=max_iterations,
            **kwargs,
        )


def _run_experiment(state: PipelineState) -> dict[str, Any]:
    """Node: Run experiment for the idea."""
    idea = state["idea"]
    logger.info("Running experiment for idea: %s", idea.title)

    runner = ExperimentRunner()
    if runner._sandbox.is_available():
        experiment = runner.run(idea)
    else:
        experiment = runner.run_local(idea)

    return {
        "experiment": experiment,
        "status": "experiment_done" if experiment.status == ExperimentStatus.COMPLETED else "experiment_failed",
    }


def _write_paper(state: PipelineState) -> dict[str, Any]:
    """Node: Write paper from experiment results."""
    idea = state["idea"]
    experiment = state["experiment"]

    if experiment is None or experiment.status != ExperimentStatus.COMPLETED:
        return {"status": "paper_failed", "error": "No completed experiment available"}

    logger.info("Writing paper for idea: %s", idea.title)
    writer = PaperWriter()
    paper = writer.write_paper(idea, experiment)
    return {
        "paper": paper,
        "status": "paper_done" if paper.status == PaperStatus.COMPLETED else "paper_failed",
    }


def _review_paper(state: PipelineState) -> dict[str, Any]:
    """Node: Review the generated paper."""
    paper = state["paper"]

    if paper is None or paper.status != PaperStatus.COMPLETED:
        return {"status": "review_failed", "error": "No completed paper available"}

    logger.info("Reviewing paper: %s", paper.title)
    reviewer = Reviewer()
    review = reviewer.review(paper)
    return {
        "review": review,
        "status": "review_done",
    }


def _should_continue(state: PipelineState) -> Literal["revise", "accept", "reject"]:
    """Conditional edge: decide whether to revise, accept, or reject."""
    review = state.get("review")
    if review is None:
        return "reject"

    iteration = state.get("iteration", 0)
    max_iterations = state.get("max_iterations", 3)

    if review.decision in (ReviewDecision.ACCEPT, ReviewDecision.WEAK_ACCEPT):
        return "accept"
    if iteration < max_iterations:
        return "revise"
    return "reject"


def _revise_paper(state: PipelineState) -> dict[str, Any]:
    """Node: Revise paper based on review feedback."""
    idea = state["idea"]
    experiment = state["experiment"]
    review = state["review"]

    logger.info("Revising paper (iteration %d)", state.get("iteration", 0) + 1)

    writer = PaperWriter()
    paper = writer.write_paper(idea, experiment)  # type: ignore[arg-type]

    return {
        "paper": paper,
        "iteration": state.get("iteration", 0) + 1,
        "status": "revision_done",
    }


def build_pipeline() -> StateGraph:
    """Build the AI Scientist LangGraph pipeline.

    Returns:
        A compiled ``StateGraph`` ready for execution.
    """
    graph = StateGraph(PipelineState)

    # Add nodes
    graph.add_node("run_experiment", _run_experiment)
    graph.add_node("write_paper", _write_paper)
    graph.add_node("review_paper", _review_paper)
    graph.add_node("revise_paper", _revise_paper)
    graph.add_node("accept", lambda s: {**s, "status": "accepted"})
    graph.add_node("reject", lambda s: {**s, "status": "rejected"})

    # Define edges
    graph.set_entry_point("run_experiment")
    graph.add_edge("run_experiment", "write_paper")
    graph.add_edge("write_paper", "review_paper")
    graph.add_conditional_edges(
        "review_paper",
        _should_continue,
        {"revise": "revise_paper", "accept": "accept", "reject": "reject"},
    )
    graph.add_edge("revise_paper", "review_paper")
    graph.add_edge("accept", END)
    graph.add_edge("reject", END)

    return graph.compile()


def run_pipeline(idea: Idea, max_iterations: int = 3) -> PipelineState:
    """Run the full AI Scientist pipeline for an idea.

    Args:
        idea: The research idea to process.
        max_iterations: Maximum revision iterations.

    Returns:
        The final ``PipelineState``.
    """
    pipeline = build_pipeline()
    initial_state = PipelineState(idea=idea, max_iterations=max_iterations)
    result = pipeline.invoke(initial_state)
    return result
