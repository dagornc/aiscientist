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

_IDEA_GENERATION_PROMPT = """\
As an AI Scientist, your task is to systematically generate highly innovative and impactful research ideas in the field: {research_area}

STEP 1: Background Analysis
First, conduct a brief assessment of the current state of the field:
- Key challenges and limitations in existing methods
- Unexplored opportunities or unmet needs
- Gaps in the current literature

STEP 2: Idea Brainstorming
Generate {num_ideas} research ideas that are:
- Highly novel (not present in current literature)
- Computationally feasible to test
- Potentially transformative for the field
- Rigorously designed with a clear hypothesis

Each idea should follow the template below:

```json
[
    {{
        "id": "idea_X",
        "title": "<concise and descriptive title>",
        "abstract": "<2-3 sentence overview of the idea>",
        "motivation": "<explaining why this is important and what gap it fills>",
        "methodology": "<detailed approach to implement the idea>",
        "validation_approach": "<how to test the correctness of this idea>",
        "expected_outcomes": "<what we expect to achieve or discover>",
        "potential_impact": "<theoretical and practical significance>",
        "risks_and_limitations": "<possible challenges or constraints>",
        "resources_needed": "<computational, data, or other requirements>",
        "feasibility_score": "<numeric score 1-10>",
        "reproducibility_notes": "<details to ensure experiment can be replicated>"
    }},
    ...
]
```

CRITICAL REQUIREMENTS:
- Each idea must be specific enough to implement as a concrete research project
- Include both theoretical foundation and practical experimental approach
- Consider computational efficiency and resource constraints
- Assess potential obstacles and mitigate accordingly
- Ideas should be scientifically rigorous with testable hypotheses
"""

_NOVELTY_CHECK_PROMPT = """\
Given the research idea and the related work from literature, assess the novelty:

RESEARCH IDEA:
Title: {idea_title}
Description: {idea_description}

RELATED WORK SUMMARY:
{literature_summary}

ANALYSIS REQUIRED:
1. Overall novelty score (1-10, where 10 is highly novel)
2. Similar work identified (if any)
3. Key distinguishing features
4. Unique contributions compared to existing methods

Format your response as JSON:
{{
    "novelty_score": <score_out_of_10>,
    "similar_work_identified": ["paper_1", "paper_2", ...],
    "key_distinguishing_features": ["feature_1", "feature_2", ...],
    "unique_contributions": ["contribution_1", "contribution_2", ...]
}}
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
        """Build the user message from the request using the enhanced template."""
        user_prompt = _IDEA_GENERATION_PROMPT.format(
            research_area=request.research_area,
            num_ideas=request.num_ideas,
        )
        
        if request.constraints:
            constraint_str = ", ".join(request.constraints)
            user_prompt += f"\nADDITIONAL CONSTRAINTS: {constraint_str}"
        
        return user_prompt

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
        """Check novelty of each idea against existing literature using enhanced prompt."""
        for idea in ideas:
            # Get related work
            _, related_papers = self._literature.check_novelty(idea.title, idea.description)
            
            # Format literature summary
            literature_summary = "\n".join([
                f"Title: {r.title}\nYear: {r.year}\nAbstract: {r.abstract[:500]}...\n" 
                for r in related_papers[:5] if r.abstract
            ]) if related_papers else "No closely related papers found."
            
            # Prepare novelty check prompt
            novelty_prompt_content = _NOVELTY_CHECK_PROMPT.format(
                idea_title=idea.title,
                idea_description=idea.description,
                literature_summary=literature_summary
            )
            
            # Call LLM for novelty assessment
            response = self._llm.invoke([HumanMessage(content=novelty_prompt_content)])
            
            try:
                # Parse the assessment result
                result_text = response.content.strip()
                if "```json" in result_text:
                    result_json = result_text.split("```json")[1].split("```")[0]
                elif "{" in result_text:
                    result_json = result_text
                    # Extract only the JSON part if wrapped in text
                    start_idx = result_json.find("{")
                    end_idx = result_json.rfind("}") + 1
                    result_json = result_json[start_idx:end_idx]
                else:
                    idea.novelty_score = 0
                    idea.related_work = [f"{r.title} ({r.year})" for r in related_papers[:5]]
                    idea.status = IdeaStatus.NOVELTY_CHECKED
                    continue
                
                assessment = json.loads(result_json)
                if isinstance(assessment, list):
                    assessment = assessment[0] if assessment else {}
                if not isinstance(assessment, dict):
                    assessment = {}
                idea.novelty_score = float(assessment.get('novelty_score', 0))
                idea.related_work = assessment.get('similar_work_identified', [])[:5] or [f"{r.title} ({r.year})" for r in related_papers[:5]]
                idea.metadata.update({
                    "unique_contributions": assessment.get('unique_contributions', []),
                    "key_distinguishing_features": assessment.get('key_distinguishing_features', []),
                })
            except (json.JSONDecodeError, KeyError) as e:
                logger.warning(f"Failed to parse novelty assessment: {e}")
                idea.novelty_score = 0
                idea.related_work = [f"{r.title} ({r.year})" for r in related_papers[:5]]
            
            idea.status = IdeaStatus.NOVELTY_CHECKED
        
        return ideas
