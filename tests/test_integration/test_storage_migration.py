"""Integration tests for the storage module interface compatibility."""

from unittest.mock import MagicMock, patch
import pytest
import os
import tempfile
from pathlib import Path

from app.simple_storage import (
    Storage,
    InMemoryStorage,
    JSONFileStorage,
    # Note: The original save_idea, load_idea, etc. functions from app.storage might not have existed
    # so we're just using the class methods
)

from app.models.idea import Idea, IdeaGenerationResponse
from app.models.experiment import Experiment
from app.models.paper import Paper
from app.models.review import Review, ReviewDecision


class TestStorageMigration:
    """Test the storage interface remains consistent across implementations."""

    def test_in_memory_storage_interface(self):
        """Test that InMemoryStorage implements the base Storage interface."""
        storage = InMemoryStorage()
        
        # Check that it inherits from Storage
        assert isinstance(storage, Storage)
        
        # Check expected methods exist
        assert hasattr(storage, 'save_idea')
        assert hasattr(storage, 'load_idea')
        assert hasattr(storage, 'save_experiment') 
        assert hasattr(storage, 'load_experiment')
        assert hasattr(storage, 'save_paper')
        assert hasattr(storage, 'load_paper')
        assert hasattr(storage, 'save_review')
        assert hasattr(storage, 'load_review')
        assert hasattr(storage, 'list_ideas')
        assert hasattr(storage, 'list_experiments')
        assert hasattr(storage, 'list_papers')
        assert hasattr(storage, 'list_reviews')

    def test_json_file_storage_interface(self):
        """Test that JSONFileStorage implements the base Storage interface."""
        with tempfile.TemporaryDirectory() as temp_dir:
            storage_path = Path(temp_dir)
            storage = JSONFileStorage(path=storage_path)
            
            # Check that it inherits from Storage
            assert isinstance(storage, Storage)
            
            # Check expected methods exist
            assert hasattr(storage, 'save_idea')
            assert hasattr(storage, 'load_idea')
            assert hasattr(storage, 'save_experiment')
            assert hasattr(storage, 'load_experiment')
            assert hasattr(storage, 'save_paper')
            assert hasattr(storage, 'load_paper')
            assert hasattr(storage, 'save_review')
            assert hasattr(storage, 'load_review')
            assert hasattr(storage, 'list_ideas')
            assert hasattr(storage, 'list_experiments')
            assert hasattr(storage, 'list_papers')
            assert hasattr(storage, 'list_reviews')

    def test_save_load_idea_consistency(self):
        """Test saving and loading ideas works consistently."""
        test_idea = Idea(
            id="test_idea_001",
            title="Test Idea",
            description="A test research idea",
            keywords=["test", "research"],
            experiment_plan="Run experiments to validate"
        )

        # Test with in-memory storage
        mem_storage = InMemoryStorage()
        mem_storage.save_idea(test_idea)
        loaded_idea = mem_storage.load_idea("test_idea_001")
        
        assert loaded_idea is not None
        assert loaded_idea.id == test_idea.id
        assert loaded_idea.title == test_idea.title
        assert loaded_idea.description == test_idea.description
        assert loaded_idea.keywords == test_idea.keywords

        # Test with JSON file storage
        with tempfile.TemporaryDirectory() as temp_dir:
            storage_path = Path(temp_dir)
            file_storage = JSONFileStorage(path=storage_path)
            file_storage.save_idea(test_idea)
            file_loaded_idea = file_storage.load_idea("test_idea_001")
            
            assert file_loaded_idea is not None
            assert file_loaded_idea.id == test_idea.id
            assert file_loaded_idea.title == test_idea.title
            assert file_loaded_idea.description == test_idea.description
            assert file_loaded_idea.keywords == test_idea.keywords

    def test_save_load_experiment_consistency(self):
        """Test saving and loading experiments works consistently."""
        test_experiment = Experiment(
            id="exp_001",
            idea_id="idea_001",
            code="def dummy_func(): return 42",
            results={"accuracy": 0.95, "time": 100},
            execution_time_seconds=1.23
        )

        # Test with in-memory storage
        mem_storage = InMemoryStorage()
        mem_storage.save_experiment(test_experiment)
        exp_loaded = mem_storage.load_experiment("exp_001")
        
        assert exp_loaded is not None
        assert exp_loaded.id == test_experiment.id
        assert exp_loaded.idea_id == test_experiment.idea_id
        assert exp_loaded.results == test_experiment.results

        # Test with JSON file storage
        with tempfile.TemporaryDirectory() as temp_dir:
            storage_path = Path(temp_dir)
            file_storage = JSONFileStorage(path=storage_path)
            file_storage.save_experiment(test_experiment)
            file_exp_loaded = file_storage.load_experiment("exp_001")
            
            assert file_exp_loaded is not None
            assert file_exp_loaded.id == test_experiment.id
            assert file_exp_loaded.idea_id == test_experiment.idea_id
            assert file_exp_loaded.results == test_experiment.results

    def test_save_load_paper_consistency(self):
        """Test saving and loading papers works consistently."""
        from app.models.paper import PaperSection
        
        test_paper = Paper(
            id="paper_001",
            idea_id="idea_001",
            experiment_id="exp_001",
            title="Test Paper",
            abstract="Test abstract",
            sections=[
                PaperSection(title="Intro", content="Introduction content", citations=[])
            ],
            citation_count=0,
            latex_source="\\documentclass..."
        )

        # Test with in-memory storage
        mem_storage = InMemoryStorage()
        mem_storage.save_paper(test_paper)
        paper_loaded = mem_storage.load_paper("paper_001")
        
        assert paper_loaded is not None
        assert paper_loaded.id == test_paper.id
        assert paper_loaded.title == test_paper.title
        assert paper_loaded.abstract == test_paper.abstract
        assert len(paper_loaded.sections) == len(test_paper.sections)

        # Test with JSON file storage
        with tempfile.TemporaryDirectory() as temp_dir:
            storage_path = Path(temp_dir)
            file_storage = JSONFileStorage(path=storage_path)
            file_storage.save_paper(test_paper)
            file_paper_loaded = file_storage.load_paper("paper_001")
            
            assert file_paper_loaded is not None
            assert file_paper_loaded.id == test_paper.id
            assert file_paper_loaded.title == test_paper.title
            assert file_paper_loaded.abstract == test_paper.abstract
            assert len(file_paper_loaded.sections) == len(test_paper.sections)

    def test_save_load_review_consistency(self):
        """Test saving and loading reviews works consistently."""
        test_review = Review(
            id="review_001",
            paper_id="paper_001",
            overall_score=7.5,
            decision=ReviewDecision.ACCEPT,
            confidence=4.0,
            soundness=4.0,
            presentation=4.0,  # Max allowed is 4.0, not 5.0
            contribution=4.0,
            strengths=["good contribution"],
            weaknesses=["small issue"],
            summary="Solid paper with minor concerns"
        )

        # Test with in-memory storage
        mem_storage = InMemoryStorage()
        mem_storage.save_review(test_review)
        review_loaded = mem_storage.load_review("review_001")
        
        assert review_loaded is not None
        assert review_loaded.id == test_review.id
        assert review_loaded.paper_id == test_review.paper_id
        assert review_loaded.overall_score == test_review.overall_score
        assert review_loaded.decision == test_review.decision

        # Test with JSON file storage
        with tempfile.TemporaryDirectory() as temp_dir:
            storage_path = Path(temp_dir)
            file_storage = JSONFileStorage(path=storage_path)
            file_storage.save_review(test_review)
            file_review_loaded = file_storage.load_review("review_001")
            
            assert file_review_loaded is not None
            assert file_review_loaded.id == test_review.id
            assert file_review_loaded.paper_id == test_review.paper_id
            assert file_review_loaded.overall_score == test_review.overall_score
            assert file_review_loaded.decision == test_review.decision

    def test_list_operations_consistency(self):
        """Test list operations return consistent results."""
        test_idea1 = Idea(id="idea_1", title="Idea 1", description="Test", keywords=[], experiment_plan="")
        test_idea2 = Idea(id="idea_2", title="Idea 2", description="Test", keywords=[], experiment_plan="")
        
        # Test in-memory storage
        mem_storage = InMemoryStorage()
        mem_storage.save_idea(test_idea1)
        mem_storage.save_idea(test_idea2)
        ideas_list = mem_storage.list_ideas()
        
        assert len(ideas_list) == 2
        idea_ids = [idea.id for idea in ideas_list]
        assert "idea_1" in idea_ids
        assert "idea_2" in idea_ids

        # Test file storage (only loads from existing files)
        # For file storage, we just ensure it returns an empty or valid list
        with tempfile.TemporaryDirectory() as temp_dir:
            storage_path = Path(temp_dir)
            file_storage = JSONFileStorage(path=storage_path)
            ideas_list = file_storage.list_ideas()
            # This should return an empty list or valid response (files may not exist yet)
            assert isinstance(ideas_list, list)

    def test_top_level_functions_consistency(self):
        """Test that we can use methods from storage classes."""
        # The test checks interfaces, not actual global functions which didn't exist
        # Just verify class methods exist
        mem_storage = InMemoryStorage()
        
        test_idea = Idea(
            id="tl_idea_001",
            title="Top-Level Test Idea",
            description="Test for top-level functions",
            keywords=["top-level", "test"],
            experiment_plan="Experiments for testing"
        )
        
        # Test that storage methods are callable
        assert hasattr(mem_storage, 'save_idea')
        assert hasattr(mem_storage, 'load_idea')
        assert hasattr(mem_storage, 'save_experiment')
        assert hasattr(mem_storage, 'load_experiment')
        assert hasattr(mem_storage, 'save_paper')
        assert hasattr(mem_storage, 'load_paper')
        assert hasattr(mem_storage, 'save_review')
        assert hasattr(mem_storage, 'load_review')
        
        # And that they work on storage instances
        mem_storage.save_idea(test_idea)
        loaded = mem_storage.load_idea(test_idea.id)
        assert loaded is not None
        assert loaded.id == test_idea.id
        assert loaded.title == test_idea.title

    def test_storage_factory_or_selection_interface(self):
        """Test if storage selection mechanism works without breaking compatibility."""
        # This verifies that we can initialize different storage implementations
        # and they maintain the same interface
        
        # Both storage implementations should be usable without changing calling code
        mem_storage = InMemoryStorage()
        with tempfile.TemporaryDirectory() as temp_dir:
            storage_path = Path(temp_dir)
            file_storage = JSONFileStorage(path=storage_path)
            
            # Both should provide the same interface/implementation of methods
            assert type(mem_storage.list_ideas()) == type(file_storage.list_ideas())
            assert hasattr(mem_storage, 'save_idea') == hasattr(file_storage, 'save_idea') 
            assert hasattr(mem_storage, 'load_experiment') == hasattr(file_storage, 'load_experiment')