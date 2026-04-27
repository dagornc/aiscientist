"""API routes — Idea generation endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.idea import Idea, IdeaGenerationRequest, IdeaGenerationResponse
from app.services.idea_generator import IdeaGenerator
from app.storage import get_ideas, add_idea

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
        response = _generator.generate(request)
        # Store generated ideas
        for idea in response.ideas:
            add_idea(idea)
        return response
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/", response_model=list[Idea])
def list_ideas() -> list[Idea]:
    """List all stored ideas.

    Returns:
        A list of ``Idea`` objects.
    """
    return get_ideas()
