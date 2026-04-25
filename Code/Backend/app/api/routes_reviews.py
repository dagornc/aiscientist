"""API routes — Paper review endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.review import Review, ReviewRequest, ReviewResponse
from app.services.reviewer import Reviewer

router = APIRouter(prefix="/reviews", tags=["reviews"])

_reviewer = Reviewer()


@router.post("/review", response_model=ReviewResponse)
def review_paper(request: ReviewRequest) -> ReviewResponse:
    """Review a generated paper.

    Args:
        request: Review parameters.

    Returns:
        Review scores and decision.
    """
    try:
        # In production, fetch paper from DB
        from app.models.paper import Paper, PaperStatus

        paper = Paper(id=request.paper_id, status=PaperStatus.COMPLETED)
        review = _reviewer.review(
            paper,
            num_reflections=request.num_reflections,
            temperature=request.temperature,
        )
        return ReviewResponse(
            review_id=review.id,
            overall_score=review.overall_score,
            decision=review.decision,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{review_id}", response_model=Review)
def get_review(review_id: str) -> Review:
    """Get review details.

    Args:
        review_id: The review ID.

    Returns:
        The ``Review`` object.
    """
    raise HTTPException(status_code=404, detail="Review not found")
