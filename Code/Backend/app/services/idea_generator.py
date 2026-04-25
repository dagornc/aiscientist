"""Idea generation service — brainstorming novel research ideas.

Uses LLM to generate diverse research ideas and checks their
novelty against existing literature.
"""

from __future__ import annotations

import json
import logging
import time
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from app.core.llm_factory import create_chat_model
from app.models.idea import Idea, IdeaGenerationRequest, IdeaGenerationResponse, IdeaStatus
from app.services.literature_search import LiteratureSearchService

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """\
You are an AI Scientist brainstorming novel research ideas. Given a research area
and optional constraints, generate creative, feasible, and impactful research ideas.

For each idea, provide:
- title: A concise, descriptive title
- description: A detailed description (2-3 paragraphs) explaining the idea, \
its motivation, and expected contributions
- keywords: 3-5 relevant keywords
- experiment_plan: A brief plan for experiments to validate the idea

Ensure ideas are:
1. Novel — not simply reproducing existing work
2. Feasible — can be implemented and tested computationally
3. Impactful — could meaningfully advance the field

Output as a JSON array of objects with keys: title, description, keywords, experiment_plan\
"""


class IdeaGenerator:
    """Generate novel research ideas using LLM + literature search."""

    def __init__(self) -> None:
        self._llm = create_chat_model()
        self._literature = LiteratureSearchService()

    def generate(self, request: IdeaGenerationRequest) -> IdeaGenerationResponse:
        """Generate research ideas for the given request.

        Args:
            request: Idea generation parameters.

        Returns:
            An ``IdeaGenerationResponse`` with generated ideas.
        """
        start_time = time.time()

        user_msg = self._build_user_message(request)
        messages = [
            SystemMessage(content=_SYSTEM_PROMPT),
            HumanMessage(content=user_msg),
        ]

        response = self._llm.invoke(messages)
        ideas = self._parse_ideas(response.content)
        ideas = self._check_novelty(ideas)
        elapsed = time.time() - start_time

        return IdeaGenerationResponse(
            ideas=ideas,
            generation_time_seconds=round(elapsed, 2),
            model_used=self._llm.model_name if hasattr(self._llm, "model_name") else "unknown",
        )

    def _build_user_message(self, request: IdeaGenerationRequest) -> str:
        """Build the user message from the request."""
        parts = [
            f"Research area: {request.research_area}",
            f"Number of ideas: {request.num_ideas}",
            f"Template: {request.template}",
        ]
        if request.constraints:
            parts.append(f"Constraints: {', '.join(request.constraints)}")
        return "\n".join(parts)

    def _parse_ideas(self, content: str) -> list[Idea]:
        """Parse LLM output into Idea objects."""
        try:
            # Try to extract JSON from the response
            text = content.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]

            raw_ideas: list[dict[str, Any]] = json.loads(text)
        except (json.JSONDecodeError, IndexError) as exc:
            logger.warning("Failed to parse ideas JSON: %s", exc)
            raw_ideas = [
                {
                    "title": "Fallback Idea",
                    "description": content[:500],
                    "keywords": [],
                    "experiment_plan": "",
                }
            ]

        ideas: list[Idea] = []
        for raw in raw_ideas:
            ideas.append(
                Idea(
                    title=raw.get("title", "Untitled"),
                    description=raw.get("description", ""),
                    keywords=raw.get("keywords", []),
                    experiment_plan=raw.get("experiment_plan", ""),
                    status=IdeaStatus.GENERATED,
                )
            )
        return ideas

    def _check_novelty(self, ideas: list[Idea]) -> list[Idea]:
        """Check novelty of each idea against existing literature."""
        for idea in ideas:
            novelty, related = self._literature.check_novelty(idea.title, idea.description)
            idea.novelty_score = novelty
            idea.related_work = [f"{r.title} ({r.year})" for r in related[:5]]
            idea.status = IdeaStatus.NOVELTY_CHECKED
        return ideas
