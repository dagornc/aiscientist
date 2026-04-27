"""API routes — Pipeline execution endpoints."""

from __future__ import annotations

import asyncio
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.core.pipeline import AIScientistPipeline

router = APIRouter(prefix="/pipeline", tags=["pipeline"])

# In-memory store for pipeline runs (production would use DB)
_pipeline_runs: dict[str, dict[str, Any]] = {}


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
