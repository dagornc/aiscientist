"""API routes — Model listing endpoints."""

from __future__ import annotations

from fastapi import APIRouter

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    limiter = Limiter(key_func=get_remote_address)
    RATE_LIMITING_AVAILABLE = True
except ImportError:
    RATE_LIMITING_AVAILABLE = False
    limiter = None

from app.core.llm_factory import list_available_providers

router = APIRouter(prefix="/models", tags=["models"])


# Define decorator function for rate limiting if available
def apply_rate_limiting(rate: str = "60/minute"):
    if RATE_LIMITING_AVAILABLE:
        return limiter.limit(rate)
    return lambda func: func

@apply_rate_limiting("60/minute")
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
