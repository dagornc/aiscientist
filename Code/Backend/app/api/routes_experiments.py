"""API routes — Experiment execution endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.experiment import Experiment, ExperimentRequest, ExperimentResponse
from app.models.idea import Idea, IdeaStatus
from app.services.experiment_runner import ExperimentRunner

router = APIRouter(prefix="/experiments", tags=["experiments"])

_runner = ExperimentRunner()


@router.post("/run", response_model=ExperimentResponse)
def run_experiment(request: ExperimentRequest) -> ExperimentResponse:
    """Run an experiment for an idea.

    Args:
        request: Experiment execution parameters.

    Returns:
        Experiment status and ID.
    """
    # In production, fetch idea from DB
    idea = Idea(
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

        return ExperimentResponse(
            experiment_id=experiment.id,
            status=experiment.status,
            message="Experiment completed" if experiment.status.value == "completed" else "Experiment failed",
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{experiment_id}", response_model=Experiment)
def get_experiment(experiment_id: str) -> Experiment:
    """Get experiment details.

    Args:
        experiment_id: The experiment ID.

    Returns:
        The ``Experiment`` object.
    """
    # TODO: Implement DB-backed fetch
    raise HTTPException(status_code=404, detail="Experiment not found")
