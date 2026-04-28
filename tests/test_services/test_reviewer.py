"""Tests for the reviewer service."""

import json
from unittest.mock import MagicMock
import pytest

from app.models.paper import Paper, PaperSection
from app.models.review import Review, ReviewDecision
from app.services.reviewer import Reviewer


class TestReviewer:
    """Test the Reviewer class."""

    @pytest.fixture
    def reviewer(self, mock_llm):
        """Create a reviewer with mocked LLM."""
        rev = Reviewer()
        # Replace the LLM instance with our mock
        rev._llm = mock_llm
        return rev

    def test_parse_valid_review_json(self, reviewer):
        """Test parsing valid JSON review from LLM response."""
        valid_json = {
            "overall_score": 7.5,
            "decision": "accept",
            "confidence": 4,
            "technical_correctness": 4,
            "contribution": 4,
            "clarity": 5,
            "originality": 3,
            "significance": 4,
            "strengths": ["good methodology", "clear presentation"],
            "weaknesses": ["limited scope"],
            "questions": ["what datasets?"],
            "suggestions": ["extend to other domains"],
            "revision_required": False,
            "accept_as_is": True,
            "ethical_concerns": [],
            "reproducibility_rating": 4,
            "summary": "Well done paper with minor issues"
        }

        content = f"```json\n{json.dumps(valid_json)}\n```"
        review = reviewer._parse_review(content, paper_id="test_paper")

        assert review.overall_score == 7.5
        assert review.decision == ReviewDecision.ACCEPT
        assert review.confidence == 4.0
        assert review.contribution == 4.0
        assert len(review.strengths) == 2
        assert len(review.weaknesses) == 1
        assert review.metadata["revision_required"] is False
        assert review.metadata["accept_as_is"] is True

    def test_parse_review_no_json_markdown(self, reviewer):
        """Test parsing JSON without markdown markers."""
        valid_json = {
            "overall_score": 6.0,
            "decision": "borderline",
            "confidence": 3,
            "technical_correctness": 3,
            "contribution": 2,
            "clarity": 4,
            "originality": 3,
            "significance": 3,
            "strengths": ["some nice ideas"],
            "weaknesses": ["experimental section weak"],
            "questions": ["what baselines were used?"],
            "suggestions": ["add more baselines"],
            "summary": "Acceptable paper with improvements needed"
        }

        content = json.dumps(valid_json)
        review = reviewer._parse_review(content, paper_id="test_paper2")

        assert review.overall_score == 6.0
        assert review.decision == ReviewDecision.BORDERLINE
        # Note clarity not a direct property - it's in metadata
        assert len(review.questions) == 1

    def test_parse_invalid_review_json_fallback(self, reviewer):
        """Test fallback when JSON parsing fails."""
        invalid_content = "This is not a JSON response!"

        review = reviewer._parse_review(invalid_content, paper_id="test_paper3")

        # Should fallback to default values
        assert review.overall_score == 5.0
        assert review.decision == ReviewDecision.BORDERLINE
        assert review.confidence == 3.0
        assert review.soundness == 2.0
        assert review.presentation == 2.0
        assert len(review.strengths) == 1  # ["Failed to parse review"]
        assert len(review.weaknesses) == 1  # ["LLM output was not valid JSON"]
        assert "Review parsing failed" in review.summary

    def test_get_score_category(self, reviewer):
        """Test getting score categories."""
        # Test outstanding
        assert reviewer._get_score_category(9.0) == "Outstanding"
        assert reviewer._get_score_category(8.5) == "Outstanding"
        # Test strong
        assert reviewer._get_score_category(7.5) == "Strong"
        assert reviewer._get_score_category(7.0) == "Strong" 
        # Test acceptable
        assert reviewer._get_score_category(6.0) == "Acceptable"
        # Test weak
        assert reviewer._get_score_category(4.5) == "Weak"
        assert reviewer._get_score_category(4.0) == "Weak"
        # Test poor
        assert reviewer._get_score_category(3.9) == "Poor"
        assert reviewer._get_score_category(1.0) == "Poor"

    def test_paper_to_text_conversion(self, reviewer):
        """Test converting paper to text string."""
        paper = Paper(
            idea_id="001",
            experiment_id="exp_001",
            title="Test Paper Title",
            abstract="This is an example abstract.",
        )
        
        sections = [
            PaperSection(title="Introduction", content="Introductory information"),
            PaperSection(title="Conclusion", content="Concluding remarks")
        ]
        paper.sections = sections

        text_result = reviewer._paper_to_text(paper)

        assert "Title: Test Paper Title" in text_result
        assert "Abstract: This is an example abstract." in text_result
        assert "## Introduction" in text_result
        assert "Introductory information" in text_result
        assert "## Conclusion" in text_result
        assert "Concluding remarks" in text_result

    def test_single_review_with_mock_llm(self, reviewer):
        """Test the single review method with mocked response."""
        paper = Paper(
            idea_id="002",
            experiment_id="exp_002",
            title="Method Paper",
            abstract="A novel method is proposed.",
        )
        sections = [PaperSection(title="Method", content="New algorithm described")]
        paper.sections = sections

        # Create mock LLM response with valid review JSON
        mock_review_json = {
            "overall_score": 8.0,
            "decision": "accept",
            "confidence": 4,
            "technical_correctness": 5,
            "contribution": 4,
            "clarity": 4,
            "originality": 4,
            "significance": 4,
            "strengths": ["clear algorithmic contribution", "solid evaluation"],
            "weaknesses": [],
            "questions": [],
            "suggestions": ["consider additional benchmarks"],
            "revision_required": False,
            "accept_as_is": True,
            "summary": "Strong paper with clear contribution"
        }
        
        mock_response = MagicMock()
        mock_response.content = json.dumps(mock_review_json)
        reviewer._llm.invoke.return_value = mock_response

        paper_text = reviewer._paper_to_text(paper)
        review = reviewer._single_review(paper_text, paper_id=paper.id)

        assert review.overall_score == 8.0
        assert review.decision == ReviewDecision.ACCEPT
        assert review.contribution == 4.0
        assert len(review.strengths) == 2
        assert mock_review_json["summary"] in review.summary