"""API routes — Idea generation endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    limiter = Limiter(key_func=get_remote_address)
    RATE_LIMITING_AVAILABLE = True
except ImportError:
    RATE_LIMITING_AVAILABLE = False
    limiter = None

from app.models.idea import Idea, IdeaGenerationRequest, IdeaGenerationResponse
from app.services.idea_generator import IdeaGenerator
from app.storage import get_ideas, add_idea
from app.db.database import get_db

router = APIRouter(prefix="/ideas", tags=["ideas"])

_generator = IdeaGenerator()


# Define decorator function for rate limiting if available
def apply_rate_limiting(rate: str = "60/minute"):
    if RATE_LIMITING_AVAILABLE:
        return limiter.limit(rate)
    return lambda func: func

@apply_rate_limiting("60/minute")
@router.post("/generate", response_model=IdeaGenerationResponse)
def generate_ideas(request: Request, idea_request: IdeaGenerationRequest, db: Session = Depends(get_db)) -> IdeaGenerationResponse:
    """Generate novel research ideas.

    Args:
        request: FastAPI request object.
        idea_request: Idea generation parameters.
        db: Database session dependency.

    Returns:
        Generated ideas with novelty scores.
    """
    try:
        response = _generator.generate(idea_request)
        # Store generated ideas
        for idea in response.ideas:
            add_idea(db, idea)
        return response
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@apply_rate_limiting("60/minute")
@router.get("/", response_model=list[Idea])
def list_ideas(request: Request, db: Session = Depends(get_db)) -> list[Idea]:
    """List all stored ideas.

    Returns:
        A list of ``Idea`` objects.
    """
    return get_ideas(db)
