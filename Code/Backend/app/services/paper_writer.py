"""Paper writing service — generates LaTeX papers from experiment results.

Implements the Paper Write-up phase of the AI Scientist pipeline,
producing complete scientific manuscripts with citations.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from app.core.llm_factory import create_chat_model
from app.models.experiment import Experiment
from app.models.idea import Idea
from app.models.paper import Paper, PaperSection, PaperStatus
from app.services.literature_search import LiteratureSearchService

logger = logging.getLogger(__name__)

_SECTION_ORDER = [
    "Introduction",
    "Related Work",
    "Method",
    "Experimental Setup",
    "Results",
    "Discussion",
    "Conclusion",
]

_PAPER_SYSTEM_PROMPT = """\
You are an expert academic writer producing a research paper in LaTeX format.
Given a research idea, experiment results, and related work, write a complete
scientific paper suitable for a top-tier ML conference (ICLR/NeurIPS/ICML style).

For each section, provide:
- title: The section title
- content: LaTeX-formatted content (use \\subsection, \\textbf, etc.)
- citations: List of citation keys used (e.g., ["smith2023", "jones2024"])

Write clearly, precisely, and with proper academic tone. Include equations where
appropriate using LaTeX math mode. Output as a JSON array of section objects.\
"""


class PaperWriter:
    """Generate scientific papers from research ideas and experiment results."""

    def __init__(self) -> None:
        self._llm = create_chat_model()
        self._literature = LiteratureSearchService()

    def write_paper(
        self,
        idea: Idea,
        experiment: Experiment,
        template: str = "iclr",
        num_reflections: int = 3,
    ) -> Paper:
        """Generate a complete research paper.

        Args:
            idea: The research idea.
            experiment: The experiment results.
            template: LaTeX template style.
            num_reflections: Number of revision iterations.

        Returns:
            A ``Paper`` with generated content.
        """
        paper = Paper(
            idea_id=idea.id,
            experiment_id=experiment.id,
            status=PaperStatus.DRAFTING,
        )

        citations = self._gather_citations(idea)
        sections = self._generate_sections(idea, experiment, citations)
        paper.sections = sections
        paper.citation_count = len(citations)
        paper.status = PaperStatus.WRITING

        title = self._generate_title(idea)
        paper.title = title

        abstract = self._generate_abstract(idea, experiment)
        paper.abstract = abstract

        paper.latex_source = self._assemble_latex(paper, citations, template)
        paper.status = PaperStatus.COMPLETED

        return paper

    def _gather_citations(self, idea: Idea) -> list[dict[str, str]]:
        """Gather relevant citations from literature search."""
        refs = self._literature.search(idea.title, limit=15)
        return [
            {
                "key": f"ref{i}",
                "title": r.title,
                "authors": ", ".join(r.authors[:3]),
                "year": str(r.year),
            }
            for i, r in enumerate(refs)
        ]

    def _generate_sections(
        self,
        idea: Idea,
        experiment: Experiment,
        citations: list[dict[str, str]],
    ) -> list[PaperSection]:
        """Generate all paper sections."""
        citation_text = "\n".join(
            f"[{c['key']}] {c['authors']} ({c['year']}): {c['title']}"
            for c in citations
        )

        user_msg = (
            f"Research Idea:\nTitle: {idea.title}\n"
            f"Description: {idea.description}\n\n"
            f"Experiment Results:\n{experiment.results}\n\n"
            f"Available Citations:\n{citation_text}\n\n"
            f"Generate all sections: {', '.join(_SECTION_ORDER)}"
        )

        messages = [
            SystemMessage(content=_PAPER_SYSTEM_PROMPT),
            HumanMessage(content=user_msg),
        ]

        response = self._llm.invoke(messages)
        sections = self._parse_sections(response.content)
        return sections

    def _generate_title(self, idea: Idea) -> str:
        """Generate a paper title from the idea."""
        messages = [
            SystemMessage(content="Generate a concise, catchy academic paper title. Output ONLY the title."),
            HumanMessage(content=f"Idea: {idea.title}\nDescription: {idea.description}"),
        ]
        response = self._llm.invoke(messages)
        return response.content.strip().strip('"')

    def _generate_abstract(self, idea: Idea, experiment: Experiment) -> str:
        """Generate the paper abstract."""
        messages = [
            SystemMessage(content="Write a 150-250 word abstract for the following research. Output ONLY the abstract text."),
            HumanMessage(
                content=f"Title: {idea.title}\nDescription: {idea.description}\n"
                f"Results: {experiment.results}"
            ),
        ]
        response = self._llm.invoke(messages)
        return response.content.strip()

    def _parse_sections(self, content: str) -> list[PaperSection]:
        """Parse LLM output into PaperSection objects."""
        import json

        try:
            text = content.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]

            raw: list[dict[str, Any]] = json.loads(text)
        except (json.JSONDecodeError, IndexError):
            raw = [{"title": "Content", "content": content, "citations": []}]

        return [
            PaperSection(
                title=s.get("title", "Section"),
                content=s.get("content", ""),
                citations=s.get("citations", []),
            )
            for s in raw
        ]

    def _assemble_latex(
        self,
        paper: Paper,
        citations: list[dict[str, str]],
        template: str,
    ) -> str:
        """Assemble the full LaTeX source."""
        bib_entries = "\n".join(
            f"\\bibitem{{{c['key']}}} {c['authors']}, \\textit{{{c['title']}}}, {c['year']}."
            for c in citations
        )

        sections_latex = "\n\n".join(
            f"\\section{{{s.title}}}\n{s.content}"
            for s in paper.sections
        )

        return f"""\\documentclass{{article}}
\\usepackage{{amsmath,amssymb,amsfonts}}
\\usepackage{{graphicx}}
\\usepackage{{hyperref}}
\\usepackage{{booktabs}}
\\usepackage{{algorithm}}
\\usepackage{{algorithmic}}

\\title{{{paper.title}}}
\\author{{Autosearch AI Scientist}}

\\begin{{document}}
\\maketitle

\\begin{{abstract}}
{paper.abstract}
\\end{{abstract}}

{sections_latex}

\\begin{{thebibliography}}{{99}}
{bib_entries}
\\end{{thebibliography}}

\\end{{document}}
"""
