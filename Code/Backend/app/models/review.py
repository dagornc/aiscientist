"""Review model — represents an automated peer review."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field


class ReviewDecision(str, Enum):
    """Decision of the review."""

    ACCEPT = "accept"
    WEAK_ACCEPT = "weak_accept"
    BORDERLINE = "borderline"
    WEAK_REJECT = "weak_reject"
    REJECT = "reject"


class Review(BaseModel):
    """An automated peer review of a generated paper."""

    id: str = Field(default_factory=lambda: uuid4().hex[:12])
    paper_id: str
    overall_score: float = Field(default=0.0, ge=0.0, le=10.0)
    decision: ReviewDecision = ReviewDecision.BORDERLINE
    confidence: float = Field(default=0.0, ge=0.0, le=5.0)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    questions: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    summary: str = ""
    soundness: float = Field(default=0.0, ge=1.0, le=4.0)
    presentation: float = Field(default=0.0, ge=1.0, le=4.0)
    contribution: float = Field(default=0.0, ge=1.0, le=4.0)
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ReviewRequest(BaseModel):
    """Request to review a paper."""

    paper_id: str
    num_reflections: int = Field(default=5, ge=1)
    num_reviews_ensemble: int = Field(default=5, ge=1)
    temperature: float = Field(default=0.1, ge=0.0, le=2.0)


class ReviewResponse(BaseModel):
    """Response after reviewing a paper."""

    review_id: str
    overall_score: float
    decision: ReviewDecision
