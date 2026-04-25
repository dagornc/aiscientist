"""Literature search service — Semantic Scholar and OpenAlex.

Checks idea novelty by searching for related papers and provides
citation data for paper write-up.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class PaperReference:
    """A reference to a scientific paper."""

    title: str
    authors: list[str]
    year: int
    abstract: str
    url: str
    citation_count: int = 0


class LiteratureSearchService:
    """Service for searching academic literature."""

    def __init__(self) -> None:
        self._client = httpx.Client(timeout=30.0)

    def search(
        self,
        query: str,
        limit: int = 10,
        engine: str | None = None,
    ) -> list[PaperReference]:
        """Search for papers matching the query.

        Args:
            query: Search query string.
            limit: Maximum number of results.
            engine: Search engine to use. Defaults to settings.

        Returns:
            List of ``PaperReference`` objects.
        """
        engine = engine or settings.literature_engine
        if engine == "semantic_scholar":
            return self._search_semantic_scholar(query, limit)
        return self._search_openalex(query, limit)

    def check_novelty(self, idea_title: str, idea_description: str) -> tuple[float, list[PaperReference]]:
        """Check the novelty of a research idea.

        Args:
            idea_title: Title of the idea.
            idea_description: Description of the idea.

        Returns:
            Tuple of (novelty_score, related_papers).
            Novelty is 0-10 where 10 means completely novel.
        """
        results = self.search(idea_title, limit=5)
        if not results:
            return 10.0, []

        # Simple heuristic: fewer highly-cited related papers → more novel
        max_citations = max(r.citation_count for r in results) if results else 0
        overlap_count = len(results)
        novelty = max(0.0, 10.0 - (overlap_count * 1.0) - min(max_citations / 100, 5.0))
        return round(novelty, 1), results

    def _search_semantic_scholar(self, query: str, limit: int) -> list[PaperReference]:
        """Search Semantic Scholar API."""
        headers: dict[str, str] = {}
        if settings.s2_api_key:
            headers["x-api-key"] = settings.s2_api_key

        try:
            response = self._client.get(
                "https://api.semanticscholar.org/graph/v1/paper/search",
                params={
                    "query": query,
                    "limit": limit,
                    "fields": "title,authors,year,abstract,url,citationCount",
                },
                headers=headers,
            )
            response.raise_for_status()
            data = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            logger.warning("Semantic Scholar search failed: %s", exc)
            return []

        papers: list[PaperReference] = []
        for item in data.get("data", []):
            authors = [a.get("name", "") for a in item.get("authors", [])]
            papers.append(
                PaperReference(
                    title=item.get("title", ""),
                    authors=authors,
                    year=item.get("year", 0) or 0,
                    abstract=item.get("abstract", "") or "",
                    url=item.get("url", ""),
                    citation_count=item.get("citationCount", 0) or 0,
                )
            )
        return papers

    def _search_openalex(self, query: str, limit: int) -> list[PaperReference]:
        """Search OpenAlex API."""
        params: dict[str, Any] = {"search": query, "per_page": limit}
        if settings.openalex_mail_address:
            params["mailto"] = settings.openalex_mail_address

        try:
            response = self._client.get(
                "https://api.openalex.org/works",
                params=params,
            )
            response.raise_for_status()
            data = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            logger.warning("OpenAlex search failed: %s", exc)
            return []

        papers: list[PaperReference] = []
        for item in data.get("results", []):
            authors = [
                a.get("author", {}).get("display_name", "")
                for a in item.get("authorships", [])
            ]
            papers.append(
                PaperReference(
                    title=item.get("title", ""),
                    authors=authors,
                    year=item.get("publication_year", 0) or 0,
                    abstract=item.get("abstract", "") or "",
                    url=item.get("id", ""),
                    citation_count=item.get("cited_by_count", 0) or 0,
                )
            )
        return papers
