"""API routes — Paper generation endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.paper import Paper, PaperWriteRequest, PaperWriteResponse
from app.services.paper_writer import PaperWriter
from app.storage import get_paper, get_papers, add_paper, get_idea, get_experiment

router = APIRouter(prefix="/papers", tags=["papers"])

_writer = PaperWriter()


@router.get("/", response_model=list[Paper])
def list_papers() -> list[Paper]:
    """List all stored papers."""
    return get_papers()


@router.post("/write", response_model=PaperWriteResponse)
def write_paper(request: PaperWriteRequest) -> PaperWriteResponse:
    """Generate a paper from an idea and experiment results.

    Args:
        request: Paper generation parameters.

    Returns:
        Paper ID and status.
    """
    try:
        idea = get_idea(request.idea_id)
        experiment = get_experiment(request.experiment_id)

        if not idea:
            from app.models.idea import Idea, IdeaStatus
            idea = Idea(id=request.idea_id, title="Placeholder", description="Not found in storage", status=IdeaStatus.COMPLETED)
        
        if not experiment:
            from app.models.experiment import Experiment, ExperimentStatus
            experiment = Experiment(id=request.experiment_id, idea_id=request.idea_id, status=ExperimentStatus.COMPLETED)

        paper = _writer.write_paper(idea, experiment, template=request.template)
        add_paper(paper)
        return PaperWriteResponse(paper_id=paper.id, status=paper.status, title=paper.title)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{paper_id}", response_model=Paper)
def read_paper(paper_id: str) -> Paper:
    """Get paper details.

    Args:
        paper_id: The paper ID.

    Returns:
        The ``Paper`` object.
    """
    paper = get_paper(paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper
