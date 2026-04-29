"""API routes — Paper review endpoints."""

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

from app.models.review import Review, ReviewRequest, ReviewResponse
from app.services.reviewer import Reviewer
from app.storage import get_review, get_reviews, add_review, get_paper
from app.db.database import get_db

router = APIRouter(prefix="/reviews", tags=["reviews"])

_reviewer = Reviewer()


# Define decorator function for rate limiting if available
def apply_rate_limiting(rate: str = "60/minute"):
    if RATE_LIMITING_AVAILABLE:
        return limiter.limit(rate)
    return lambda func: func

@apply_rate_limiting("60/minute")
@router.get("/", response_model=list[Review])
def list_reviews(request: Request, db: Session = Depends(get_db)) -> list[Review]:
    """List all stored reviews."""
    return get_reviews(db)


@apply_rate_limiting("30/minute")
@router.post("/review", response_model=ReviewResponse)
def review_paper(request: Request, review_request: ReviewRequest, db: Session = Depends(get_db)) -> ReviewResponse:
    """Review a generated paper.

    Args:
        request: FastAPI request object.
        review_request: Review parameters.
        db: Database session dependency.

    Returns:
        Review scores and decision.
    """
    try:
        paper = get_paper(db, review_request.paper_id)
        if not paper:
            from app.models.paper import Paper, PaperStatus
            paper = Paper(id=review_request.paper_id, status=PaperStatus.COMPLETED)

        review = _reviewer.review(
            paper,
            num_reflections=review_request.num_reflections,
            temperature=review_request.temperature,
        )
        add_review(db, review)
        return ReviewResponse(
            review_id=review.id,
            overall_score=review.overall_score,
            decision=review.decision,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@apply_rate_limiting("60/minute")
@router.get("/{review_id}", response_model=Review)
def read_review(request: Request, review_id: str, db: Session = Depends(get_db)) -> Review:
    """Get review details.

    Args:
        request: FastAPI request object.
        review_id: The review ID.
        db: Database session dependency.

    Returns:
        The ``Review`` object.
    """
    review = get_review(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review
