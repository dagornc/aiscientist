"""SQLAlchemy database models for the AI Scientist application."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text, JSON, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.models.idea import Idea, IdeaStatus
from app.models.experiment import Experiment, ExperimentStatus
from app.models.paper import Paper, PaperStatus, PaperSection
from app.models.review import Review, ReviewDecision


from sqlalchemy.orm import declarative_base

Base = declarative_base()


class IdeaDB(Base):
    """Idea model for database storage."""
    
    __tablename__ = "ideas"

    id: Mapped[str] = mapped_column(String(12), primary_key=True, default=lambda: uuid4().hex[:12])
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    novelty_score: Mapped[float] = mapped_column(Float, default=0.0)
    feasibility_score: Mapped[float] = mapped_column(Float, default=0.0)
    impact_score: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String, default=IdeaStatus.GENERATED)
    keywords: Mapped[list] = mapped_column(JSON, default=list)  # Using JSON for lists
    related_work: Mapped[list] = mapped_column(JSON, default=list)
    experiment_plan: Mapped[str] = mapped_column(Text, default="")
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    def to_pydantic(self) -> Idea:
        """Convert SQLAlchemy instance to Pydantic model."""
        return Idea(
            id=self.id,
            title=self.title,
            description=self.description,
            novelty_score=self.novelty_score,
            feasibility_score=self.feasibility_score,
            impact_score=self.impact_score,
            status=IdeaStatus(self.status),
            keywords=self.keywords,
            related_work=self.related_work,
            experiment_plan=self.experiment_plan,
            metadata=self.metadata_,
            created_at=self.created_at,
            updated_at=self.updated_at
        )


class ExperimentDB(Base):
    """Experiment model for database storage."""
    
    __tablename__ = "experiments"

    id: Mapped[str] = mapped_column(String(12), primary_key=True, default=lambda: uuid4().hex[:12])
    idea_id: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(Text, default="")
    results: Mapped[dict] = mapped_column(JSON, default=dict)
    figures: Mapped[list] = mapped_column(JSON, default=list)
    logs: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String, default=ExperimentStatus.PENDING)
    execution_time_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    def to_pydantic(self) -> Experiment:
        """Convert SQLAlchemy instance to Pydantic model."""
        return Experiment(
            id=self.id,
            idea_id=self.idea_id,
            code=self.code,
            results=self.results,
            figures=self.figures,
            logs=self.logs,
            status=ExperimentStatus(self.status),
            execution_time_seconds=self.execution_time_seconds,
            metadata=self.metadata_,
            created_at=self.created_at,
            updated_at=self.updated_at
        )


class PaperDB(Base):
    """Paper model for database storage."""
    
    __tablename__ = "papers"

    id: Mapped[str] = mapped_column(String(12), primary_key=True, default=lambda: uuid4().hex[:12])
    idea_id: Mapped[str] = mapped_column(String, nullable=False)
    experiment_id: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, default="")
    abstract: Mapped[str] = mapped_column(Text, default="")
    sections: Mapped[list] = mapped_column(JSON, default=list)  # Store as JSON
    latex_source: Mapped[str] = mapped_column(Text, default="")
    pdf_path: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default=PaperStatus.DRAFTING)
    citation_count: Mapped[int] = mapped_column(Integer, default=0)
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    def to_pydantic(self) -> Paper:
        """Convert SQLAlchemy instance to Pydantic model."""
        from app.models.paper import PaperSection
        
        paper_sections = [PaperSection(**section_data) for section_data in self.sections]
        
        return Paper(
            id=self.id,
            idea_id=self.idea_id,
            experiment_id=self.experiment_id,
            title=self.title,
            abstract=self.abstract,
            sections=paper_sections,
            latex_source=self.latex_source,
            pdf_path=self.pdf_path,
            status=PaperStatus(self.status),
            citation_count=self.citation_count,
            metadata=self.metadata_,
            created_at=self.created_at,
            updated_at=self.updated_at
        )


class ReviewDB(Base):
    """Review model for database storage."""
    
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String(12), primary_key=True, default=lambda: uuid4().hex[:12])
    paper_id: Mapped[str] = mapped_column(String, nullable=False)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)
    decision: Mapped[str] = mapped_column(String, default=ReviewDecision.BORDERLINE)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    strengths: Mapped[list] = mapped_column(JSON, default=list)
    weaknesses: Mapped[list] = mapped_column(JSON, default=list)
    questions: Mapped[list] = mapped_column(JSON, default=list)
    suggestions: Mapped[list] = mapped_column(JSON, default=list)
    summary: Mapped[str] = mapped_column(Text, default="")
    soundness: Mapped[float] = mapped_column(Float, default=0.0)
    presentation: Mapped[float] = mapped_column(Float, default=0.0)
    contribution: Mapped[float] = mapped_column(Float, default=0.0)
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    def to_pydantic(self) -> Review:
        """Convert SQLAlchemy instance to Pydantic model."""
        return Review(
            id=self.id,
            paper_id=self.paper_id,
            overall_score=self.overall_score,
            decision=ReviewDecision(self.decision),
            confidence=self.confidence,
            strengths=self.strengths,
            weaknesses=self.weaknesses,
            questions=self.questions,
            suggestions=self.suggestions,
            summary=self.summary,
            soundness=self.soundness,
            presentation=self.presentation,
            contribution=self.contribution,
            metadata=self.metadata_,
            created_at=self.created_at
        )