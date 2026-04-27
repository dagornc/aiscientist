"""Simple in-memory storage for ideas and experiments."""

from __future__ import annotations

from typing import Dict, List
from app.models.idea import Idea
from app.models.experiment import Experiment

# In-memory storage
_ideas: List[Idea] = []
_experiments: Dict[str, Experiment] = {}


def get_ideas() -> List[Idea]:
    """Return all stored ideas."""
    return _ideas


def add_idea(idea: Idea) -> None:
    """Add an idea to storage."""
    _ideas.append(idea)


def get_experiment(experiment_id: str) -> Experiment | None:
    """Get an experiment by ID."""
    return _experiments.get(experiment_id)


def add_experiment(experiment: Experiment) -> None:
    """Add an experiment to storage."""
    _experiments[experiment.id] = experiment
