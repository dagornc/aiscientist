"""Experiment model — represents an experiment run."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field


class ExperimentStatus(str, Enum):
    """Status of an experiment."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"


class Experiment(BaseModel):
    """An experiment run in the AI Scientist pipeline."""

    id: str = Field(default_factory=lambda: uuid4().hex[:12])
    idea_id: str
    code: str = ""
    results: dict[str, Any] = Field(default_factory=dict)
    figures: list[str] = Field(default_factory=list)
    logs: str = ""
    status: ExperimentStatus = ExperimentStatus.PENDING
    execution_time_seconds: float = 0.0
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ExperimentRequest(BaseModel):
    """Request to run an experiment."""

    idea_id: str
    code: str | None = None
    timeout: int = Field(default=300, ge=30)


class ExperimentResponse(BaseModel):
    """Response after launching an experiment."""

    experiment_id: str
    status: ExperimentStatus
    message: str
