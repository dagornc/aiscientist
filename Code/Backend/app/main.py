"""FastAPI application — Autosearch AI Scientist.

Main entry point for the backend API server.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_experiments import router as experiments_router
from app.api.routes_ideas import router as ideas_router
from app.api.routes_models import router as models_router
from app.api.routes_papers import router as papers_router
from app.api.routes_pipeline import router as pipeline_router
from app.api.routes_reviews import router as reviews_router
from app.config import settings
from app.core.pipeline import build_pipeline

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> None:
    """Application lifespan: startup and shutdown."""
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, settings.app_log_level)
        ),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )
    logger.info("autosearch_starting", provider=settings.llm_provider, model=settings.llm_model)

    # Pre-compile pipeline graph
    build_pipeline()
    logger.info("autosearch_pipeline_compiled")

    yield
    logger.info("autosearch_shutting_down")


app = FastAPI(
    title="Autosearch — AI Scientist",
    description="Fully automated scientific discovery pipeline inspired by Sakana AI's AI Scientist",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(ideas_router, prefix="/api")
app.include_router(experiments_router, prefix="/api")
app.include_router(papers_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")
app.include_router(models_router, prefix="/api")
app.include_router(pipeline_router, prefix="/api")


@app.get("/api/health")
def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "version": "0.1.0"}


@app.get("/api/pipeline/graph")
def get_pipeline_graph() -> dict[str, object]:
    """Get the pipeline graph structure for React Flow visualization."""
    return {
        "nodes": [
            {"id": "idea", "type": "custom", "position": {"x": 0, "y": 200}, "data": {"label": "Idea Generation", "icon": "lightbulb"}},
            {"id": "experiment", "type": "custom", "position": {"x": 300, "y": 200}, "data": {"label": "Experimental Iteration", "icon": "flask-conical"}},
            {"id": "paper", "type": "custom", "position": {"x": 600, "y": 200}, "data": {"label": "Paper Write-up", "icon": "file-text"}},
            {"id": "review", "type": "custom", "position": {"x": 900, "y": 200}, "data": {"label": "Peer Review", "icon": "search"}},
            {"id": "accept", "type": "custom", "position": {"x": 1200, "y": 100}, "data": {"label": "Accept", "icon": "check-circle"}},
            {"id": "reject", "type": "custom", "position": {"x": 1200, "y": 300}, "data": {"label": "Reject / Revise", "icon": "rotate-ccw"}},
        ],
        "edges": [
            {"id": "e-idea-exp", "source": "idea", "target": "experiment", "animated": True},
            {"id": "e-exp-paper", "source": "experiment", "target": "paper", "animated": True},
            {"id": "e-paper-review", "source": "paper", "target": "review", "animated": True},
            {"id": "e-review-accept", "source": "review", "target": "accept", "label": "Accept"},
            {"id": "e-review-reject", "source": "review", "target": "reject", "label": "Reject"},
            {"id": "e-reject-review", "source": "reject", "target": "review", "label": "Revise", "style": {"strokeDasharray": "5 5"}},
        ],
    }
