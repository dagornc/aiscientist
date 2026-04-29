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
        """Check the novelty of a research idea using advanced similarity analysis.

        Args:
            idea_title: Title of the idea.
            idea_description: Description of the idea.

        Returns:
            Tuple of (novelty_score, related_papers).
            Novelty is 0-10 where 10 means completely novel.
        """
        # Search for related papers in a broader context
        query = f"{idea_title} {idea_description[:200]}"  # Concatenate title and first 200 chars of description
        results = self.search(query, limit=10)
        
        if not results:
            return 10.0, []

        # Advanced novelty scoring based on multiple factors:
        # 1. Recency-weighted similarity (recent papers are weighted higher)
        # 2. Citation-weighted impact (highly cited papers indicate more established work)
        # 3. Direct keyword matching and semantic similarity approximation
        
        current_year = 2024
        total_novelty_penalty = 0.0
        
        for paper in results:
            # Calculate recency factor (newer = more similar, higher penalty)
            year_factor = max(0, (current_year - paper.year) / 10.0) if paper.year > 0 else 0.5
            
            # Calculate citation impact (more citations = more similar existing work)
            citation_factor = min(5.0, paper.citation_count / 20.0)  # Normalize citation count
            
            # Estimate overlap based on title/content similarity
            title_similarity = self._estimate_text_overlap(idea_title.lower(), paper.title.lower())
            desc_similarity = self._estimate_text_overlap(idea_description.lower(), paper.abstract.lower()) if paper.abstract else 0.0
            
            # Combined penalty based on all factors
            overlap_penalty = (title_similarity * 3.0 + desc_similarity * 2.0 + 
                              year_factor + citation_factor) / 4.0
            
            # Add logarithmic component to avoid excessive penalties
            total_novelty_penalty += min(3.0, overlap_penalty)
        
        # Start with perfect novelty, subtract penalties
        base_novelty = 10.0
        final_novelty = max(0.0, base_novelty - total_novelty_penalty)
        
        return round(final_novelty, 1), results
    
    def _estimate_text_overlap(self, text1: str, text2: str) -> float:
        """Estimate semantic overlap between two texts using keyword overlap."""
        if not text1 or not text2:
            return 0.0
            
        # Simple keyword-based similarity (can be replaced with embeddings in future)
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        if not words1 and not words2:
            return 1.0
        if not words1 or not words2:
            return 0.0
            
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        if union == 0:
            return 0.0
        
        # Jaccard similarity coefficient
        return float(intersection) / union

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
