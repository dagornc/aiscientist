"""Repository layer for database operations."""

from __future__ import annotations

from typing import List, Optional
from uuid import uuid4

import structlog
from sqlalchemy.orm import Session

from app.db.models import IdeaDB, ExperimentDB, PaperDB, ReviewDB
from app.models.experiment import Experiment
from app.models.idea import Idea
from app.models.paper import Paper
from app.models.review import Review

logger = structlog.get_logger(__name__)


class BaseRepository:
    """Base repository with common CRUD operations."""
    
    def __init__(self, model_cls):
        self.model_cls = model_cls

    def _get_by_id(self, db: Session, item_id: str):
        """Generic method to get an item by ID."""
        return db.query(self.model_cls).filter(self.model_cls.id == item_id).first()


class IdeaRepository(BaseRepository):
    """Repository for Idea operations."""
    
    def __init__(self):
        super().__init__(IdeaDB)

    def create(self, db: Session, idea: Idea) -> Idea:
        """Create a new idea."""
        idea_db = IdeaDB(
            id=idea.id,
            title=idea.title,
            description=idea.description,
            novelty_score=idea.novelty_score,
            feasibility_score=idea.feasibility_score,
            impact_score=idea.impact_score,
            status=idea.status.value,
            keywords=idea.keywords,
            related_work=idea.related_work,
            experiment_plan=idea.experiment_plan,
            metadata_=idea.metadata,
            created_at=idea.created_at,
            updated_at=idea.updated_at
        )
        db.add(idea_db)
        db.commit()
        db.refresh(idea_db)
        logger.info("idea_created", idea_id=idea.id)
        return idea_db.to_pydantic()

    def get(self, db: Session, idea_id: str) -> Optional[Idea]:
        """Get an idea by ID."""
        idea_db = self._get_by_id(db, idea_id)
        return idea_db.to_pydantic() if idea_db else None

    def get_all(self, db: Session) -> List[Idea]:
        """Get all ideas."""
        ideas_db = db.query(IdeaDB).all()
        return [idea_db.to_pydantic() for idea_db in ideas_db]

    def update(self, db: Session, idea_id: str, idea: Idea) -> Optional[Idea]:
        """Update an existing idea."""
        idea_db = self._get_by_id(db, idea_id)
        if not idea_db:
            return None
            
        idea_db.title = idea.title
        idea_db.description = idea.description
        idea_db.novelty_score = idea.novelty_score
        idea_db.feasibility_score = idea.feasibility_score
        idea_db.impact_score = idea.impact_score
        idea_db.status = idea.status.value
        idea_db.keywords = idea.keywords
        idea_db.related_work = idea.related_work
        idea_db.experiment_plan = idea.experiment_plan
        idea_db.metadata_ = idea.metadata
        idea_db.updated_at = idea.updated_at
        
        db.commit()
        db.refresh(idea_db)
        logger.info("idea_updated", idea_id=idea.id)
        return idea_db.to_pydantic()

    def delete(self, db: Session, idea_id: str) -> bool:
        """Delete an idea by ID."""
        idea_db = self._get_by_id(db, idea_id)
        if not idea_db:
            return False
            
        db.delete(idea_db)
        db.commit()
        logger.info("idea_deleted", idea_id=idea_id)
        return True


class ExperimentRepository(BaseRepository):
    """Repository for Experiment operations."""
    
    def __init__(self):
        super().__init__(ExperimentDB)

    def create(self, db: Session, experiment: Experiment) -> Experiment:
        """Create a new experiment."""
        experiment_db = ExperimentDB(
            id=experiment.id,
            idea_id=experiment.idea_id,
            code=experiment.code,
            results=experiment.results,
            figures=experiment.figures,
            logs=experiment.logs,
            status=experiment.status.value,
            execution_time_seconds=experiment.execution_time_seconds,
            metadata_=experiment.metadata,
            created_at=experiment.created_at,
            updated_at=experiment.updated_at
        )
        db.add(experiment_db)
        db.commit()
        db.refresh(experiment_db)
        logger.info("experiment_created", experiment_id=experiment.id)
        return experiment_db.to_pydantic()

    def get(self, db: Session, experiment_id: str) -> Optional[Experiment]:
        """Get an experiment by ID."""
        experiment_db = self._get_by_id(db, experiment_id)
        return experiment_db.to_pydantic() if experiment_db else None

    def get_all(self, db: Session) -> List[Experiment]:
        """Get all experiments."""
        experiments_db = db.query(ExperimentDB).all()
        return [exp_db.to_pydantic() for exp_db in experiments_db]

    def update(self, db: Session, experiment_id: str, experiment: Experiment) -> Optional[Experiment]:
        """Update an existing experiment."""
        experiment_db = self._get_by_id(db, experiment_id)
        if not experiment_db:
            return None
            
        experiment_db.idea_id = experiment.idea_id
        experiment_db.code = experiment.code
        experiment_db.results = experiment.results
        experiment_db.figures = experiment.figures
        experiment_db.logs = experiment.logs
        experiment_db.status = experiment.status.value
        experiment_db.execution_time_seconds = experiment.execution_time_seconds
        experiment_db.metadata_ = experiment.metadata
        experiment_db.updated_at = experiment.updated_at
        
        db.commit()
        db.refresh(experiment_db)
        logger.info("experiment_updated", experiment_id=experiment.id)
        return experiment_db.to_pydantic()

    def delete(self, db: Session, experiment_id: str) -> bool:
        """Delete an experiment by ID."""
        experiment_db = self._get_by_id(db, experiment_id)
        if not experiment_db:
            return False
            
        db.delete(experiment_db)
        db.commit()
        logger.info("experiment_deleted", experiment_id=experiment_id)
        return True


class PaperRepository(BaseRepository):
    """Repository for Paper operations."""
    
    def __init__(self):
        super().__init__(PaperDB)

    def create(self, db: Session, paper: Paper) -> Paper:
        """Create a new paper."""
        paper_sections_data = [
            {
                "title": section.title,
                "content": section.content,
                "citations": section.citations
            }
            for section in paper.sections
        ]
        
        paper_db = PaperDB(
            id=paper.id,
            idea_id=paper.idea_id,
            experiment_id=paper.experiment_id,
            title=paper.title,
            abstract=paper.abstract,
            sections=paper_sections_data,
            latex_source=paper.latex_source,
            pdf_path=paper.pdf_path,
            status=paper.status.value,
            citation_count=paper.citation_count,
            metadata_=paper.metadata,
            created_at=paper.created_at,
            updated_at=paper.updated_at
        )
        db.add(paper_db)
        db.commit()
        db.refresh(paper_db)
        logger.info("paper_created", paper_id=paper.id)
        return paper_db.to_pydantic()

    def get(self, db: Session, paper_id: str) -> Optional[Paper]:
        """Get a paper by ID."""
        paper_db = self._get_by_id(db, paper_id)
        return paper_db.to_pydantic() if paper_db else None

    def get_all(self, db: Session) -> List[Paper]:
        """Get all papers."""
        papers_db = db.query(PaperDB).all()
        return [paper_db.to_pydantic() for paper_db in papers_db]

    def update(self, db: Session, paper_id: str, paper: Paper) -> Optional[Paper]:
        """Update an existing paper."""
        paper_db = self._get_by_id(db, paper_id)
        if not paper_db:
            return None
            
        paper_sections_data = [
            {
                "title": section.title,
                "content": section.content,
                "citations": section.citations
            }
            for section in paper.sections
        ]
            
        paper_db.idea_id = paper.idea_id
        paper_db.experiment_id = paper.experiment_id
        paper_db.title = paper.title
        paper_db.abstract = paper.abstract
        paper_db.sections = paper_sections_data
        paper_db.latex_source = paper.latex_source
        paper_db.pdf_path = paper.pdf_path
        paper_db.status = paper.status.value
        paper_db.citation_count = paper.citation_count
        paper_db.metadata_ = paper.metadata
        paper_db.updated_at = paper.updated_at
        
        db.commit()
        db.refresh(paper_db)
        logger.info("paper_updated", paper_id=paper.id)
        return paper_db.to_pydantic()

    def delete(self, db: Session, paper_id: str) -> bool:
        """Delete a paper by ID."""
        paper_db = self._get_by_id(db, paper_id)
        if not paper_db:
            return False
            
        db.delete(paper_db)
        db.commit()
        logger.info("paper_deleted", paper_id=paper_id)
        return True


class ReviewRepository(BaseRepository):
    """Repository for Review operations."""
    
    def __init__(self):
        super().__init__(ReviewDB)

    def create(self, db: Session, review: Review) -> Review:
        """Create a new review."""
        review_db = ReviewDB(
            id=review.id,
            paper_id=review.paper_id,
            overall_score=review.overall_score,
            decision=review.decision.value,
            confidence=review.confidence,
            strengths=review.strengths,
            weaknesses=review.weaknesses,
            questions=review.questions,
            suggestions=review.suggestions,
            summary=review.summary,
            soundness=review.soundness,
            presentation=review.presentation,
            contribution=review.contribution,
            metadata_=review.metadata,
            created_at=review.created_at
        )
        db.add(review_db)
        db.commit()
        db.refresh(review_db)
        logger.info("review_created", review_id=review.id)
        return review_db.to_pydantic()

    def get(self, db: Session, review_id: str) -> Optional[Review]:
        """Get a review by ID."""
        review_db = self._get_by_id(db, review_id)
        return review_db.to_pydantic() if review_db else None

    def get_all(self, db: Session) -> List[Review]:
        """Get all reviews."""
        reviews_db = db.query(ReviewDB).all()
        return [review_db.to_pydantic() for review_db in reviews_db]

    def update(self, db: Session, review_id: str, review: Review) -> Optional[Review]:
        """Update an existing review."""
        review_db = self._get_by_id(db, review_id)
        if not review_db:
            return None
            
        review_db.paper_id = review.paper_id
        review_db.overall_score = review.overall_score
        review_db.decision = review.decision.value
        review_db.confidence = review.confidence
        review_db.strengths = review.strengths
        review_db.weaknesses = review.weaknesses
        review_db.questions = review.questions
        review_db.suggestions = review.suggestions
        review_db.summary = review.summary
        review_db.soundness = review.soundness
        review_db.presentation = review.presentation
        review_db.contribution = review.contribution
        review_db.metadata_ = review.metadata
        
        db.commit()
        db.refresh(review_db)
        logger.info("review_updated", review_id=review.id)
        return review_db.to_pydantic()

    def delete(self, db: Session, review_id: str) -> bool:
        """Delete a review by ID."""
        review_db = self._get_by_id(db, review_id)
        if not review_db:
            return False
            
        db.delete(review_db)
        db.commit()
        logger.info("review_deleted", review_id=review_id)
        return True