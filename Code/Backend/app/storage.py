"""Simple in-memory storage for ideas and experiments."""

from __future__ import annotations

from typing import Dict, List
from app.models.idea import Idea
from app.models.experiment import Experiment
from app.models.paper import Paper
from app.models.review import Review

# In-memory storage
_ideas: List[Idea] = []
_experiments: Dict[str, Experiment] = {}
_papers: Dict[str, Paper] = {}
_reviews: Dict[str, Review] = {}


def get_ideas() -> List[Idea]:
    """Return all stored ideas."""
    return _ideas


def get_idea(idea_id: str) -> Idea | None:
    """Get an idea by ID."""
    for idea in _ideas:
        if idea.id == idea_id:
            return idea
    return None


def add_idea(idea: Idea) -> None:
    """Add an idea to storage."""
    _ideas.append(idea)


def get_experiment(experiment_id: str) -> Experiment | None:
    """Get an experiment by ID."""
    return _experiments.get(experiment_id)


def get_experiments() -> List[Experiment]:
    """Return all stored experiments."""
    return list(_experiments.values())


def add_experiment(experiment: Experiment) -> None:
    """Add an experiment to storage."""
    _experiments[experiment.id] = experiment


def get_paper(paper_id: str) -> Paper | None:
    """Get a paper by ID."""
    return _papers.get(paper_id)


def get_papers() -> List[Paper]:
    """Return all stored papers."""
    return list(_papers.values())


def add_paper(paper: Paper) -> None:
    """Add a paper to storage."""
    _papers[paper.id] = paper


def get_review(review_id: str) -> Review | None:
    """Get a review by ID."""
    return _reviews.get(review_id)


def get_reviews() -> List[Review]:
    """Return all stored reviews."""
    return list(_reviews.values())


def add_review(review: Review) -> None:
    """Add a review to storage."""
    _reviews[review.id] = review
