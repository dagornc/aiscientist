"""API routes — Model listing endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from app.core.llm_factory import list_available_providers

router = APIRouter(prefix="/models", tags=["models"])


@router.get("/")
def list_models() -> dict:
    """List available LLM providers and models.

    Returns:
        Provider list and current configuration (no API keys exposed).
    """
    from app.config import settings

    return {
        "providers": list_available_providers(),
        "current": {
            "provider": settings.llm_provider,
            "model": settings.llm_model,
        },
    }
