"""API routes — Pipeline execution endpoints."""

from __future__ import annotations

import asyncio
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    limiter = Limiter(key_func=get_remote_address)
    RATE_LIMITING_AVAILABLE = True
except ImportError:
    RATE_LIMITING_AVAILABLE = False
    limiter = None

from app.core.pipeline import AIScientistPipeline

router = APIRouter(prefix="/pipeline", tags=["pipeline"])

# In-memory store for pipeline runs (production would use DB)
_pipeline_runs: dict[str, dict[str, Any]] = {}


# Define decorator function for rate limiting if available
def apply_rate_limiting(rate: str = "10/minute"):
    if RATE_LIMITING_AVAILABLE:
        return limiter.limit(rate)
    return lambda func: func

@apply_rate_limiting("10/minute")
@router.post("/run")
async def run_pipeline(body: dict[str, Any]) -> dict[str, str]:
    """Launch the complete AI Scientist pipeline.

    Args:
        body: JSON with ``domain``, ``num_ideas`` (optional), ``max_iterations`` (optional).

    Returns:
        Pipeline run ID and initial status.
    """
    domain = body.get("domain", "machine_learning")
    num_ideas = body.get("num_ideas", 3)
    max_iterations = body.get("max_iterations", 3)

    run_id = uuid.uuid4().hex[:12]
    _pipeline_runs[run_id] = {
        "run_id": run_id,
        "domain": domain,
        "num_ideas": num_ideas,
        "max_iterations": max_iterations,
        "status": "queued",
        "progress": 0,
        "current_step": "initializing",
        "results": {},
        "error": None,
    }

    # Start pipeline in background
    asyncio.create_task(_execute_pipeline(run_id, domain, max_iterations))

    return {"run_id": run_id, "status": "queued"}


@apply_rate_limiting("30/minute")  # More permissive rate for status checking
@router.get("/{run_id}/status")
def get_pipeline_status(run_id: str) -> dict[str, Any]:
    """Get the status of a pipeline run.

    Args:
        run_id: The pipeline run ID.

    Returns:
        Current status, progress, and results.
    """
    if run_id not in _pipeline_runs:
        raise HTTPException(status_code=404, detail="Pipeline run not found")
    return _pipeline_runs[run_id]


def get_pipeline_run_status(run_id: str) -> dict[str, Any]:
    """Get the status of a pipeline run (internal function available to other modules).

    Args:
        run_id: The pipeline run ID.

    Returns:
        Current status, progress, and results.
    """
    if run_id not in _pipeline_runs:
        raise HTTPException(status_code=404, detail="Pipeline run not found")
    return _pipeline_runs[run_id]


@apply_rate_limiting("30/minute")
@router.get("/{run_id}/graph")
def get_pipeline_run_graph(run_id: str) -> dict[str, Any]:
    """Get the pipeline graph with status for a specific run ID.

    Args:
        run_id: The pipeline run ID.

    Returns:
        Graph structure with node coloring based on execution status.
    """
    if run_id not in _pipeline_runs:
        raise HTTPException(status_code=404, detail="Pipeline run not found")
    
    run_status = get_pipeline_run_status(run_id)
    
    # Define default nodes and edges
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
        "edges": default_edges,
        "run_id": run_id,
        "run_status": run_status
    }


async def _execute_pipeline(run_id: str, domain: str, max_iterations: int) -> None:
    """Execute the pipeline asynchronously and update status."""
    pipeline = AIScientistPipeline()
    _pipeline_runs[run_id]["status"] = "running"
    _pipeline_runs[run_id]["current_step"] = "idea_generation"

    try:
        for state_update in pipeline.stream_execute(domain, max_attempts=max_iterations):
            state = list(state_update.values())[0] if state_update else {}
            status = state.get("status", "running")

            _pipeline_runs[run_id].update({
                "status": "running",
                "current_step": _map_status_to_step(status),
                "progress": _estimate_progress(status),
                "results": {
                    "ideas_count": len(state.get("ideas", [])),
                    "experiments_count": len(state.get("experiment_results", [])),
                    "papers_count": len(state.get("drafts", [])),
                    "reviews_count": len(state.get("reviews", [])),
                },
            })
            await asyncio.sleep(0)

        _pipeline_runs[run_id]["status"] = "completed"
        _pipeline_runs[run_id]["progress"] = 100
        _pipeline_runs[run_id]["current_step"] = "done"

    except Exception as exc:
        _pipeline_runs[run_id]["status"] = "failed"
        _pipeline_runs[run_id]["error"] = str(exc)


def _map_status_to_step(status: str) -> str:
    """Map pipeline status to a human-readable step name."""
    mapping = {
        "INITIALIZED": "initializing",
        "IDEAS_GENERATED": "idea_generation",
        "IDEA_SELECTED": "idea_selection",
        "EXPERIMENT_COMPLETED": "experimentation",
        "PAPER_WRITTEN": "paper_writing",
        "PAPER_REVIEWED_ACCEPT": "review_accepted",
        "PAPER_REVIEWED_REJECT": "review_rejected",
        "PAPER_REVIEWED_BORDERLINE": "review_borderline",
        "REVISION_REQUIRED": "revision",
    }
    return mapping.get(status, status.lower())


def _estimate_progress(status: str) -> int:
    """Estimate pipeline progress percentage from status."""
    progress_map = {
        "INITIALIZED": 5,
        "IDEAS_GENERATED": 20,
        "IDEA_SELECTED": 30,
        "EXPERIMENT_COMPLETED": 50,
        "PAPER_WRITTEN": 70,
        "PAPER_REVIEWED_ACCEPT": 100,
        "PAPER_REVIEWED_REJECT": 70,
        "PAPER_REVIEWED_BORDERLINE": 75,
        "REVISION_REQUIRED": 60,
    }
    return progress_map.get(status, 50)
