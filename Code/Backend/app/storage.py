"""SQLAlchemy-backed storage for ideas and experiments."""

from __future__ import annotations

from typing import List
from sqlalchemy.orm import Session

from app.db.repository import IdeaRepository, ExperimentRepository, PaperRepository, ReviewRepository
from app.models.idea import Idea
from app.models.experiment import Experiment
from app.models.paper import Paper
from app.models.review import Review

# Repository instances
idea_repo = IdeaRepository()
experiment_repo = ExperimentRepository()
paper_repo = PaperRepository()
review_repo = ReviewRepository()


def get_ideas(db: Session) -> List[Idea]:
    """Return all stored ideas."""
    return idea_repo.get_all(db)


def get_idea(db: Session, idea_id: str) -> Idea | None:
    """Get an idea by ID."""
    return idea_repo.get(db, idea_id)


def add_idea(db: Session, idea: Idea) -> None:
    """Add an idea to storage."""
    idea_repo.create(db, idea)


def get_experiment(db: Session, experiment_id: str) -> Experiment | None:
    """Get an experiment by ID."""
    return experiment_repo.get(db, experiment_id)


def get_experiments(db: Session) -> List[Experiment]:
    """Return all stored experiments."""
    return experiment_repo.get_all(db)


def add_experiment(db: Session, experiment: Experiment) -> None:
    """Add an experiment to storage."""
    experiment_repo.create(db, experiment)


def get_paper(db: Session, paper_id: str) -> Paper | None:
    """Get a paper by ID."""
    return paper_repo.get(db, paper_id)


def get_papers(db: Session) -> List[Paper]:
    """Return all stored papers."""
    return paper_repo.get_all(db)


def add_paper(db: Session, paper: Paper) -> None:
    """Add a paper to storage."""
    paper_repo.create(db, paper)


def get_review(db: Session, review_id: str) -> Review | None:
    """Get a review by ID."""
    return review_repo.get(db, review_id)


def get_reviews(db: Session) -> List[Review]:
    """Return all stored reviews."""
    return review_repo.get_all(db)


def add_review(db: Session, review: Review) -> None:
    """Add a review to storage."""
    review_repo.create(db, review)
