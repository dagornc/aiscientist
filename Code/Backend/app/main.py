"""FastAPI application — Autosearch AI Scientist.

Main entry point for the backend API server.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session

import structlog
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import get_db

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

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

    # Initialize database
    from app.db.database import init_db
    init_db()
    logger.info("database_initialized")

    yield
    logger.info("autosearch_shutting_down")


# Create the FastAPI app
app = FastAPI(
    title="Autosearch — AI Scientist",
    description="Fully automated scientific discovery pipeline inspired by Sakana AI's AI Scientist",
    version="0.1.0",
    lifespan=lifespan,
)

# Create limiter and set default rate limit (60 requests per minute for general API)
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add authentication middleware if an API key is configured
if settings.app_api_key:
    from app.auth import add_auth_middleware
    add_auth_middleware(app, api_key=settings.app_api_key)
    logger.info("auth_middleware_installed", message="API authentication enabled")
else:
    logger.info("auth_middleware_skipped", message="No API key configured, authentication disabled")

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with default rate limiting of 60/minute
general_rate_limited_router = limiter.limit("60/minute")(lambda: None)

# Include all routers 
app.include_router(ideas_router, prefix="/api")
app.include_router(experiments_router, prefix="/api")
app.include_router(papers_router, prefix="/api") 
app.include_router(reviews_router, prefix="/api")
app.include_router(models_router, prefix="/api")
app.include_router(pipeline_router, prefix="/api")  # Pipeline routes handle their own rate limiting internally

@app.get("/api/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Public health check endpoint."""
    return {"status": "healthy", "version": "0.1.0"}

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)) -> dict[str, int]:
    """Get aggregate statistics for the dashboard."""
    from app.storage import get_experiments, get_ideas, get_papers, get_reviews

    return {
        "ideas_count": len(get_ideas(db)),
        "experiments_count": len(get_experiments(db)),
        "papers_count": len(get_papers(db)),
        "reviews_count": len(get_reviews(db)),
    }


@app.get("/api/pipeline/graph")
@limiter.exempt  # Health and graph endpoints are exempt from rate limiting
def get_pipeline_graph(run_id: str | None = None) -> dict[str, object]:
    """Get the pipeline graph structure for React Flow visualization, optionally with status for a specific run."""
    from app.api.routes_pipeline import get_pipeline_run_status
    
    default_nodes = [
        {"id": "idea", "type": "custom", "position": {"x": 0, "y": 200}, "data": {"label": "Idea Generation", "icon": "lightbulb"}},
        {"id": "experiment", "type": "custom", "position": {"x": 300, "y": 200}, "data": {"label": "Experimental Iteration", "icon": "flask-conical"}},
        {"id": "paper", "type": "custom", "position": {"x": 600, "y": 200}, "data": {"label": "Paper Write-up", "icon": "file-text"}},
        {"id": "review", "type": "custom", "position": {"x": 900, "y": 200}, "data": {"label": "Peer Review", "icon": "search"}},
        {"id": "accept", "type": "custom", "position": {"x": 1200, "y": 100}, "data": {"label": "Accept", "icon": "check-circle"}},
        {"id": "reject", "type": "custom", "position": {"x": 1200, "y": 300}, "data": {"label": "Reject / Revise", "icon": "rotate-ccw"}},
    ]
    
    default_edges = [
        {"id": "e-idea-exp", "source": "idea", "target": "experiment", "animated": True},
        {"id": "e-exp-paper", "source": "experiment", "target": "paper", "animated": True},
        {"id": "e-paper-review", "source": "paper", "target": "review", "animated": True},
        {"id": "e-review-accept", "source": "review", "target": "accept", "label": "Accept"},
        {"id": "e-review-reject", "source": "review", "target": "reject", "label": "Reject"},
        {"id": "e-reject-review", "source": "reject", "target": "review", "label": "Revise", "style": {"strokeDasharray": "5 5"}},
    ]
    
    # If no run_id is provided, return static graph
    if run_id is None:
        return {
            "nodes": default_nodes,
            "edges": default_edges,
            "run_id": None
        }
    
    # Otherwise, return dynamic graph with run status
    try:
        run_status = get_pipeline_run_status(run_id)
        
        # Map current step to node styles
        status_node_mapping = {
            "initializing": ["idea"],
            "idea_generation": ["idea"],
            "idea_selection": ["idea"],
            "experimentation": ["experiment"],
            "paper_writing": ["paper"],
            "review": ["review"],
            "review_completed": ["accept", "reject"],
            "completed": ["accept"],
            "failed": [],
            "done": ["accept"]
        }
        
        current_step = run_status.get("current_step", "initializing")
        active_nodes = status_node_mapping.get(current_step, [])
        
        # Color the nodes based on current activity
        colored_nodes = []
        for node in default_nodes:
            node_copy = node.copy()
            if node["id"] in active_nodes:
                node_copy["data"] = {**node["data"], "color": "#10b981"}  # green for active
            elif node["id"] == "accept" and run_status.get("status") == "completed":
                node_copy["data"] = {**node["data"], "color": "#10b981"}  # green for completed
            elif node["id"] in ["accept", "reject"] and run_status.get("status") == "failed":
                node_copy["data"] = {**node["data"], "color": "#ef4444"}  # red for failure
            else:
                node_copy["data"] = {**node["data"]}
            
            colored_nodes.append(node_copy)
        
        return {
            "nodes": colored_nodes,
            "edges": default_edges,  # Edges stay the same
            "run_id": run_id,
            "run_status": run_status
        }
    except Exception:
        # If run_id is invalid, return static graph
        return {
            "nodes": default_nodes,
            "edges": default_edges,
            "run_id": None
        }