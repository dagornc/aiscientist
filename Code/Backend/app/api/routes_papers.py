"""API routes — Paper generation endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends, Response, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import tempfile
from pathlib import Path

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    limiter = Limiter(key_func=get_remote_address)
    RATE_LIMITING_AVAILABLE = True
except ImportError:
    RATE_LIMITING_AVAILABLE = False
    limiter = None

from app.models.paper import Paper, PaperWriteRequest, PaperWriteResponse
from app.models.idea import Idea, IdeaStatus 
from app.models.experiment import Experiment, ExperimentStatus
from app.services.paper_writer import PaperWriter
from app.services.arxiv_import import import_from_arxiv
from app.services.paper_compiler import compile_latex
from app.storage import get_paper, get_papers, add_paper, get_idea, get_experiment
from app.db.database import get_db

router = APIRouter(prefix="/papers", tags=["papers"])

_writer = PaperWriter()


# Define decorator function for rate limiting if available
def apply_rate_limiting(rate: str = "60/minute"):
    if RATE_LIMITING_AVAILABLE:
        return limiter.limit(rate)
    return lambda func: func

@apply_rate_limiting("60/minute")
@router.get("/", response_model=list[Paper])
def list_papers(request: Request, db: Session = Depends(get_db)) -> list[Paper]:
    """List all stored papers."""
    return get_papers(db)


@apply_rate_limiting("30/minute")
@router.post("/write", response_model=PaperWriteResponse)
def write_paper(request: Request, paper_request: PaperWriteRequest, db: Session = Depends(get_db)) -> PaperWriteResponse:
    """Generate a paper from an idea and experiment results.

    Args:
        request: FastAPI request object.
        paper_request: Paper generation parameters.
        db: Database session dependency.

    Returns:
        Paper ID and status.
    """
    try:
        idea = get_idea(db, paper_request.idea_id)
        experiment = get_experiment(db, paper_request.experiment_id)

        if not idea:
            idea = Idea(id=paper_request.idea_id, title="Placeholder", description="Not found in storage", status=IdeaStatus.COMPLETED)
        
        if not experiment:
            experiment = Experiment(id=paper_request.experiment_id, idea_id=paper_request.idea_id, status=ExperimentStatus.COMPLETED)

        paper = _writer.write_paper(idea, experiment, template=paper_request.template)
        add_paper(db, paper)
        return PaperWriteResponse(paper_id=paper.id, status=paper.status, title=paper.title)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@apply_rate_limiting("60/minute")
@router.get("/{paper_id}", response_model=Paper)
def read_paper(request: Request, paper_id: str, db: Session = Depends(get_db)) -> Paper:
    """Get paper details.

    Args:
        request: FastAPI request object.
        paper_id: The paper ID.
        db: Database session dependency.
    Returns:
        The ``Paper`` object.
    """
    paper = get_paper(db, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


@apply_rate_limiting("30/minute")
@router.post("/import", response_model=Paper)
def import_paper(request: Request, import_request: dict, db: Session = Depends(get_db)) -> Paper:
    """Import a paper from ArXiv.

    Args:
        request: FastAPI request object.
        import_request: Dictionary containing arxiv_id.
        db: Database session dependency.

    Returns:
        Imported Paper object.
    """
    try:
        arxiv_id = import_request.get("arxiv_id")
        if not arxiv_id:
            raise HTTPException(status_code=400, detail="arxiv_id is required")
        
        paper = import_from_arxiv(arxiv_id)
        add_paper(db, paper)
        return paper
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@apply_rate_limiting("30/minute")
@router.get("/{paper_id}/download")
def download_paper(request: Request, paper_id: str, db: Session = Depends(get_db)) -> Response:
    """Download a paper as PDF.

    Args:
        request: FastAPI request object.
        paper_id: The paper ID.
        db: Database session dependency.

    Returns:
        PDF file response.
    """
    try:
        paper = get_paper(db, paper_id)
        if not paper:
            raise HTTPException(status_code=404, detail="Paper not found")

        # If we already have a pdf_path in the database, return that directly
        if paper.pdf_path and os.path.exists(paper.pdf_path):
            return FileResponse(
                path=paper.pdf_path,
                filename=f"{paper.title.replace(' ', '_')}.pdf".replace('/', '_'),
                media_type="application/pdf"
            )

        # Otherwise, compile the LaTeX source to PDF
        output_dir = Path("./outputs/pdfs")
        output_dir.mkdir(exist_ok=True, parents=True)
        
        pdf_path = compile_latex(paper.latex_source, str(output_dir))
        
        # Update the paper with the pdf path in the database
        paper.pdf_path = pdf_path
        # Update the paper in storage/db
        add_paper(db, paper)
        
        return FileResponse(
            path=pdf_path,
            filename=f"{paper.title.replace(' ', '_')}.pdf".replace('/', '_'),
            media_type="application/pdf"
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
