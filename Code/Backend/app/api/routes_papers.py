"""API routes — Paper generation endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.paper import Paper, PaperWriteRequest, PaperWriteResponse
from app.services.paper_writer import PaperWriter

router = APIRouter(prefix="/papers", tags=["papers"])

_writer = PaperWriter()


@router.post("/write", response_model=PaperWriteResponse)
def write_paper(request: PaperWriteRequest) -> PaperWriteResponse:
    """Generate a paper from an idea and experiment results.

    Args:
        request: Paper generation parameters.

    Returns:
        Paper ID and status.
    """
    try:
        # In production, fetch idea and experiment from DB
        from app.models.experiment import Experiment, ExperimentStatus
        from app.models.idea import Idea, IdeaStatus

        idea = Idea(id=request.idea_id, title="Fetched", description="From DB", status=IdeaStatus.COMPLETED)
        experiment = Experiment(id=request.experiment_id, idea_id=request.idea_id, status=ExperimentStatus.COMPLETED)

        paper = _writer.write_paper(idea, experiment, template=request.template)
        return PaperWriteResponse(paper_id=paper.id, status=paper.status, title=paper.title)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{paper_id}", response_model=Paper)
def get_paper(paper_id: str) -> Paper:
    """Get paper details.

    Args:
        paper_id: The paper ID.

    Returns:
        The ``Paper`` object.
    """
    raise HTTPException(status_code=404, detail="Paper not found")
