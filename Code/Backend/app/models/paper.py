"""Paper model — represents a generated research paper."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field


class PaperStatus(str, Enum):
    """Status of a paper."""

    DRAFTING = "drafting"
    WRITING = "writing"
    COMPLETED = "completed"
    REVISION = "revision"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class PaperSection(BaseModel):
    """A section of the generated paper."""

    title: str
    content: str
    citations: list[str] = Field(default_factory=list)


class Paper(BaseModel):
    """A generated research paper."""

    id: str = Field(default_factory=lambda: uuid4().hex[:12])
    idea_id: str
    experiment_id: str
    title: str = ""
    abstract: str = ""
    sections: list[PaperSection] = Field(default_factory=list)
    latex_source: str = ""
    pdf_path: str = ""
    status: PaperStatus = PaperStatus.DRAFTING
    citation_count: int = 0
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class PaperWriteRequest(BaseModel):
    """Request to generate a paper."""

    idea_id: str
    experiment_id: str
    template: str = "iclr"
    num_reflections: int = Field(default=3, ge=1)


class PaperWriteResponse(BaseModel):
    """Response after generating a paper."""

    paper_id: str
    status: PaperStatus
    title: str
