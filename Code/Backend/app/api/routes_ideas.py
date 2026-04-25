"""API routes — Idea generation endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.idea import Idea, IdeaGenerationRequest, IdeaGenerationResponse
from app.services.idea_generator import IdeaGenerator

router = APIRouter(prefix="/ideas", tags=["ideas"])

_generator = IdeaGenerator()


@router.post("/generate", response_model=IdeaGenerationResponse)
def generate_ideas(request: IdeaGenerationRequest) -> IdeaGenerationResponse:
    """Generate novel research ideas.

    Args:
        request: Idea generation parameters.

    Returns:
        Generated ideas with novelty scores.
    """
    try:
        return _generator.generate(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/", response_model=list[Idea])
def list_ideas() -> list[Idea]:
    """List all stored ideas.

    Returns:
        A list of ``Idea`` objects.
    """
    # TODO: Implement DB-backed listing
    return []
