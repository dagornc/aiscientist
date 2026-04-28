"""Simple storage implementations for testing and fallback use."""

from __future__ import annotations
import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Optional
from app.models.idea import Idea
from app.models.experiment import Experiment
from app.models.paper import Paper
from app.models.review import Review, ReviewDecision


class Storage(ABC):
    """Base storage interface for AI Scientist pipeline."""

    @abstractmethod
    def save_idea(self, idea: Idea) -> None:
        """Save an idea."""
        pass

    @abstractmethod
    def load_idea(self, idea_id: str) -> Idea | None:
        """Load an idea by ID."""
        pass

    @abstractmethod
    def save_experiment(self, experiment: Experiment) -> None:
        """Save an experiment."""
        pass

    @abstractmethod
    def load_experiment(self, experiment_id: str) -> Experiment | None:
        """Load an experiment by ID."""
        pass

    @abstractmethod
    def save_paper(self, paper: Paper) -> None:
        """Save a paper."""
        pass

    @abstractmethod
    def load_paper(self, paper_id: str) -> Paper | None:
        """Load a paper by ID."""
        pass

    @abstractmethod
    def save_review(self, review: Review) -> None:
        """Save a review."""
        pass

    @abstractmethod
    def load_review(self, review_id: str) -> Review | None:
        """Load a review by ID."""
        pass

    @abstractmethod
    def list_ideas(self) -> list[Idea]:
        """List all saved ideas."""
        pass

    @abstractmethod
    def list_experiments(self) -> list[Experiment]:
        """List all saved experiments."""
        pass

    @abstractmethod
    def list_papers(self) -> list[Paper]:
        """List all saved papers."""
        pass

    @abstractmethod
    def list_reviews(self) -> list[Review]:
        """List all saved reviews."""
        pass


class InMemoryStorage(Storage):
    """In-memory storage implementation for testing."""

    def __init__(self):
        self._ideas = {}
        self._experiments = {}
        self._papers = {}
        self._reviews = {}

    def save_idea(self, idea: Idea) -> None:
        self._ideas[idea.id] = idea

    def load_idea(self, idea_id: str) -> Idea | None:
        return self._ideas.get(idea_id)

    def save_experiment(self, experiment: Experiment) -> None:
        self._experiments[experiment.id] = experiment

    def load_experiment(self, experiment_id: str) -> Experiment | None:
        return self._experiments.get(experiment_id)

    def save_paper(self, paper: Paper) -> None:
        self._papers[paper.id] = paper

    def load_paper(self, paper_id: str) -> Paper | None:
        return self._papers.get(paper_id)

    def save_review(self, review: Review) -> None:
        self._reviews[review.id] = review

    def load_review(self, review_id: str) -> Review | None:
        return self._reviews.get(review_id)

    def list_ideas(self) -> list[Idea]:
        return list(self._ideas.values())

    def list_experiments(self) -> list[Experiment]:
        return list(self._experiments.values())

    def list_papers(self) -> list[Paper]:
        return list(self._papers.values())

    def list_reviews(self) -> list[Review]:
        return list(self._reviews.values())


class JSONFileStorage(Storage):
    """JSON file storage implementation for persistence."""

    def __init__(self, path: Path | str):
        if isinstance(path, str):
            path = Path(path)
        self.path = Path(path)
        self.path.mkdir(parents=True, exist_ok=True)

        # Initialize with empty storage
        self._ideas_file = self.path / "ideas.json"
        self._experiments_file = self.path / "experiments.json"
        self._papers_file = self.path / "papers.json"
        self._reviews_file = self.path / "reviews.json"

        # Create empty files if they don't exist
        for f in [self._ideas_file, self._experiments_file, self._papers_file, self._reviews_file]:
            if not f.exists():
                f.write_text("[]")

    def save_idea(self, idea: Idea) -> None:
        ideas = self._load_json_file(self._ideas_file)
        ideas = [i for i in ideas if i["id"] != idea.id]  # Remove existing
        ideas.append(idea.model_dump())
        self._save_json_file(self._ideas_file, ideas)

    def load_idea(self, idea_id: str) -> Idea | None:
        ideas = self._load_json_file(self._ideas_file)
        idea_dict = next((i for i in ideas if i["id"] == idea_id), {})
        return Idea(**idea_dict) if idea_dict else None

    def save_experiment(self, experiment: Experiment) -> None:
        experiments = self._load_json_file(self._experiments_file)
        experiments = [e for e in experiments if e["id"] != experiment.id]  # Remove existing
        experiments.append(experiment.model_dump())
        self._save_json_file(self._experiments_file, experiments)

    def load_experiment(self, experiment_id: str) -> Experiment | None:
        experiments = self._load_json_file(self._experiments_file)
        exp_dict = next((e for e in experiments if e["id"] == experiment_id), {})
        return Experiment(**exp_dict) if exp_dict else None

    def save_paper(self, paper: Paper) -> None:
        papers = self._load_json_file(self._papers_file)
        papers = [p for p in papers if p["id"] != paper.id]  # Remove existing
        papers.append(paper.model_dump())
        self._save_json_file(self._papers_file, papers)

    def load_paper(self, paper_id: str) -> Paper | None:
        papers = self._load_json_file(self._papers_file)
        paper_dict = next((p for p in papers if p["id"] == paper_id), {})
        return Paper(**paper_dict) if paper_dict else None

    def save_review(self, review: Review) -> None:
        reviews = self._load_json_file(self._reviews_file)
        reviews = [r for r in reviews if r["id"] != review.id]  # Remove existing
        reviews.append(review.model_dump())
        self._save_json_file(self._reviews_file, reviews)

    def load_review(self, review_id: str) -> Review | None:
        reviews = self._load_json_file(self._reviews_file)
        review_dict = next((r for r in reviews if r["id"] == review_id), {})
        return Review(**review_dict) if review_dict else None

    def list_ideas(self) -> list[Idea]:
        ideas_data = self._load_json_file(self._ideas_file)
        return [Idea(**idea_data) for idea_data in ideas_data]

    def list_experiments(self) -> list[Experiment]:
        experiments_data = self._load_json_file(self._experiments_file)
        return [Experiment(**exp_data) for exp_data in experiments_data]

    def list_papers(self) -> list[Paper]:
        papers_data = self._load_json_file(self._papers_file)
        return [Paper(**paper_data) for paper_data in papers_data]

    def list_reviews(self) -> list[Review]:
        reviews_data = self._load_json_file(self._reviews_file)
        return [Review(**review_data) for review_data in reviews_data]

    def _load_json_file(self, filepath: Path) -> list[dict[str, Any]]:
        """Load JSON data from file."""
        try:
            content = filepath.read_text(encoding="utf-8")
            if content.strip():
                return json.loads(content)
            return []
        except (json.JSONDecodeError, FileNotFoundError):
            return []

    def _save_json_file(self, filepath: Path, data: list[dict[str, Any]]) -> None:
        """Save JSON data to file."""
        filepath.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")