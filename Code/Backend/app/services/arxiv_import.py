"""ArXiV import service — imports papers from ArXiv API."""

from __future__ import annotations

import xml.etree.ElementTree as ET
from datetime import datetime
from typing import TYPE_CHECKING

import httpx

from app.models.paper import Paper, PaperSection

if TYPE_CHECKING:
    from app.models.paper import Paper


def import_from_arxiv(arxiv_id: str) -> Paper:
    """Import a paper from ArXiv API.
    
    Args:
        arxiv_id: The ArXiv identifier (e.g., "1234.56789" or "math/0606001").
    
    Returns:
        A ``Paper`` object with imported data.
    """
    # Build the API URL
    url = f"https://export.arxiv.org/api/query?id_list={arxiv_id}"
    
    # Fetch the XML response
    response = httpx.get(url, timeout=30.0)
    response.raise_for_status()
    
    # Parse the XML response
    root = ET.fromstring(response.text)
    
    # Define namespaces
    ns = {
        'atom': 'http://www.w3.org/2005/Atom',
        'arxiv': 'http://arxiv.org/schemas/atom'
    }
    
    # Find the entry
    entry = root.find('atom:entry', ns)
    if entry is None:
        raise ValueError(f"No paper found with arxiv_id: {arxiv_id}")
    
    # Extract data
    title = entry.find('atom:title', ns).text or ""
    abstract = entry.find('atom:summary', ns).text or ""
    published_str = entry.find('atom:published', ns).text or ""
    
    # Parse publication date
    pub_date = datetime.fromisoformat(published_str.replace('Z', '+00:00'))
    
    # Extract authors
    authors = []
    for author_elem in entry.findall('atom:author', ns):
        name_elem = author_elem.find('atom:name', ns)
        if name_elem is not None:
            authors.append(name_elem.text or "")
    
    # Extract categories/subjects
    categories = []
    for category_elem in entry.findall('atom:category', ns):
        term = category_elem.attrib.get('term')
        if term:
            categories.append(term)
    
    # Create sections from the abstract
    sections = [PaperSection(title="Abstract", content=abstract.strip(), citations=[])]
    
    # Create and return the Paper object
    paper = Paper(
        id=arxiv_id.replace('.', '').replace('/', '_'),  # Simple ID conversion
        idea_id=f"arxiv_{arxiv_id}",
        experiment_id=f"arxiv_{arxiv_id}_exp",  # Placeholder for consistency
        title=title.strip(),
        abstract=abstract.strip(),
        sections=sections,
        latex_source="",  # Will be populated if needed later
        pdf_path="",
        status="completed",
        citation_count=0,
        metadata={
            "arxiv_id": arxiv_id,
            "authors": authors,
            "categories": categories,
            "published": pub_date.isoformat(),
            "source": "arxiv"
        }
    )
    
    return paper