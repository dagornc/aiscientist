"""API routes — Experiment execution endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.experiment import Experiment, ExperimentRequest, ExperimentResponse
from app.models.idea import Idea, IdeaStatus
from app.services.experiment_runner import ExperimentRunner
from app.storage import get_experiment, get_experiments, add_experiment, get_ideas
from app.models.idea import Idea as IdeaModel

router = APIRouter(prefix="/experiments", tags=["experiments"])

_runner = ExperimentRunner()


@router.get("/", response_model=list[Experiment])
def list_experiments() -> list[Experiment]:
    """List all stored experiments."""
    return get_experiments()


@router.post("/run", response_model=ExperimentResponse)
def run_experiment(request: ExperimentRequest) -> ExperimentResponse:
    """Run an experiment for an idea.

    Args:
        request: Experiment execution parameters.

    Returns:
        Experiment status and ID.
    """
    ideas = get_ideas()
    idea = next((i for i in ideas if i.id == request.idea_id), None)
    if idea is None:
        # If not found, create a placeholder
        idea = IdeaModel(
            id=request.idea_id,
            title="Fetched from DB",
            description="Placeholder",
            status=IdeaStatus.IN_PROGRESS,
        )

    try:
        if _runner._sandbox.is_available():
            experiment = _runner.run(idea, timeout=request.timeout)
        else:
            experiment = _runner.run_local(idea)

        # Store the experiment
        add_experiment(experiment)

        return ExperimentResponse(
            experiment_id=experiment.id,
            status=experiment.status,
            message="Experiment completed" if experiment.status.value == "completed" else "Experiment failed",
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{experiment_id}", response_model=Experiment)
def read_experiment(experiment_id: str) -> Experiment:
    """Get experiment details.

    Args:
        experiment_id: The experiment ID.

    Returns:
        The ``Experiment`` object.
    """
    experiment = get_experiment(experiment_id)
    if experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return experiment
