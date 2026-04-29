"""Authentication middleware for API key verification."""

import structlog
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


logger = structlog.get_logger(__name__)


class AuthMiddleware:
    """Middleware to verify API key in X-API-Key header."""
    
    def __init__(self, api_key: str, excluded_paths: list[str] | None = None):
        """
        Initialize the authentication middleware.
        
        Args:
            api_key: The expected API key value
            excluded_paths: List of paths that don't require authentication
        """
        self.api_key = api_key
        self.excluded_paths = excluded_paths or ["/api/health", "/api/docs", "/docs", "/openapi.json", "/api/redoc"]
    
    async def __call__(self, request: Request, call_next):
        """
        Process incoming requests and check API key.
        
        Args:
            request: FastAPI request object
            call_next: Next middleware/function in chain
            
        Returns:
            Response from the next handler
        """
        # Allow OPTIONS requests to pass through (for preflight requests)
        if request.method == "OPTIONS":
            return await call_next(request)
            
        # Check if the path is public/allowed to bypass authentication
        if request.url.path in self.excluded_paths:
            return await call_next(request)
            
        # Attempt to retrieve API key from the header
        x_api_key = request.headers.get("X-API-Key")
        provided_api_key = x_api_key or ""
        
        # Validate the provided API key against the configured one
        if provided_api_key != self.api_key and self.api_key:
            logger.warning(
                "auth_unauthorized",
                client_ip=request.client.host,
                path=request.url.path,
                method=request.method
            )
            raise HTTPException(status_code=401, detail="Invalid API key")
            
        # Authentication passed - continue processing
        response = await call_next(request)
        return response


def add_auth_middleware(app, api_key: str | None = None):
    """
    Convenience function to add the authentication middleware to the app.
    This can be called from main.py
    
    Args:
        app: FastAPI app instance
        api_key: The API key value (obtained from settings)
    """
    from starlette.middleware.base import BaseHTTPMiddleware
    
    if api_key:  # Only add middleware if API key is configured
        middleware = AuthMiddleware(api_key=api_key)
        app.add_middleware(BaseHTTPMiddleware, dispatch=middleware.__call__)