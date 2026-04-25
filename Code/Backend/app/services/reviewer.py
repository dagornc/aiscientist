"""Automated peer review service — evaluates generated papers.

Implements the Automated Paper Reviewing phase of the AI Scientist,
providing structured feedback with scores and improvement suggestions.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from app.core.llm_factory import create_chat_model
from app.models.paper import Paper
from app.models.review import Review, ReviewDecision

logger = logging.getLogger(__name__)

_REVIEW_SYSTEM_PROMPT = """\
You are an expert peer reviewer for a top-tier ML conference (ICLR/NeurIPS).
Evaluate the following paper and provide a structured review.

You MUST output a JSON object with these exact keys:
- overall_score: float 1-10 (10 = strongest)
- decision: one of "accept", "weak_accept", "borderline", "weak_reject", "reject"
- confidence: float 1-5 (5 = absolutely sure)
- soundness: float 1-4
- presentation: float 1-4
- contribution: float 1-4
- strengths: list of strings
- weaknesses: list of strings
- questions: list of strings
- suggestions: list of strings
- summary: string (2-3 sentences)

Be rigorous but fair. Output ONLY the JSON object.\
"""


class Reviewer:
    """Automated peer reviewer for generated papers."""

    def __init__(self) -> None:
        self._llm = create_chat_model()

    def review(
        self,
        paper: Paper,
        num_reflections: int = 5,
        temperature: float = 0.1,
    ) -> Review:
        """Review a generated paper.

        Args:
            paper: The paper to review.
            num_reflections: Number of self-reflection iterations.
            temperature: Sampling temperature for the LLM.

        Returns:
            A ``Review`` with scores and feedback.
        """
        paper_text = self._paper_to_text(paper)
        review = self._single_review(paper_text, paper_id=paper.id)

        # Self-reflection: refine the review
        for i in range(num_reflections - 1):
            review = self._reflect(paper_text, review)

        return review

    def _single_review(self, paper_text: str, paper_id: str = "") -> Review:
        """Generate a single review of the paper."""
        messages = [
            SystemMessage(content=_REVIEW_SYSTEM_PROMPT),
            HumanMessage(content=f"Paper:\n\n{paper_text}"),
        ]

        response = self._llm.invoke(messages)
        return self._parse_review(response.content, paper_id=paper_id)

    def _reflect(self, paper_text: str, previous_review: Review) -> Review:
        """Refine a review through self-reflection."""
        reflect_prompt = f"""\
Review the paper again, considering your previous review:

Previous scores: Overall={previous_review.overall_score}, Soundness={previous_review.soundness}, \
Presentation={previous_review.presentation}, Contribution={previous_review.contribution}
Previous decision: {previous_review.decision.value}

Are there aspects you missed? Should any scores change? Be self-critical.

Paper:
{paper_text}

Output the SAME JSON format as before with potentially updated scores and feedback.\
"""
        messages = [
            SystemMessage(content=_REVIEW_SYSTEM_PROMPT),
            HumanMessage(content=reflect_prompt),
        ]
        response = self._llm.invoke(messages)
        return self._parse_review(response.content, paper_id=previous_review.paper_id)

    def _paper_to_text(self, paper: Paper) -> str:
        """Convert paper to plain text for review."""
        parts = [f"Title: {paper.title}", f"\nAbstract: {paper.abstract}"]
        for section in paper.sections:
            parts.append(f"\n## {section.title}\n{section.content}")
        return "\n".join(parts)

    def _parse_review(self, content: str, paper_id: str = "") -> Review:
        """Parse LLM review output into a Review object."""
        try:
            text = content.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]

            data: dict[str, Any] = json.loads(text)
        except (json.JSONDecodeError, IndexError):
            data = {
                "overall_score": 5.0,
                "decision": "borderline",
                "confidence": 3.0,
                "soundness": 2.0,
                "presentation": 2.0,
                "contribution": 2.0,
                "strengths": ["Failed to parse review"],
                "weaknesses": ["LLM output was not valid JSON"],
                "questions": [],
                "suggestions": [],
                "summary": "Review parsing failed; raw output was not structured.",
            }

        return Review(
            paper_id=paper_id,
            overall_score=float(data.get("overall_score", 5.0)),
            decision=ReviewDecision(data.get("decision", "borderline")),
            confidence=float(data.get("confidence", 3.0)),
            soundness=float(data.get("soundness", 2.0)),
            presentation=float(data.get("presentation", 2.0)),
            contribution=float(data.get("contribution", 2.0)),
            strengths=data.get("strengths", []),
            weaknesses=data.get("weaknesses", []),
            questions=data.get("questions", []),
            suggestions=data.get("suggestions", []),
            summary=data.get("summary", ""),
        )
