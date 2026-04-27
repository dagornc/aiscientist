"""API routes — Paper review endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.review import Review, ReviewRequest, ReviewResponse
from app.services.reviewer import Reviewer
from app.storage import get_review, get_reviews, add_review, get_paper

router = APIRouter(prefix="/reviews", tags=["reviews"])

_reviewer = Reviewer()


@router.get("/", response_model=list[Review])
def list_reviews() -> list[Review]:
    """List all stored reviews."""
    return get_reviews()


@router.post("/review", response_model=ReviewResponse)
def review_paper(request: ReviewRequest) -> ReviewResponse:
    """Review a generated paper.

    Args:
        request: Review parameters.

    Returns:
        Review scores and decision.
    """
    try:
        paper = get_paper(request.paper_id)
        if not paper:
            from app.models.paper import Paper, PaperStatus
            paper = Paper(id=request.paper_id, status=PaperStatus.COMPLETED)

        review = _reviewer.review(
            paper,
            num_reflections=request.num_reflections,
            temperature=request.temperature,
        )
        add_review(review)
        return ReviewResponse(
            review_id=review.id,
            overall_score=review.overall_score,
            decision=review.decision,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{review_id}", response_model=Review)
def read_review(review_id: str) -> Review:
    """Get review details.

    Args:
        review_id: The review ID.

    Returns:
        The ``Review`` object.
    """
    review = get_review(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review
