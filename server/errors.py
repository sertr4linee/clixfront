"""FastAPI exception handlers for clix API errors."""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from clix.core.auth import AuthError
from clix.core.client import APIError, RateLimitError, StaleEndpointError


def setup_exception_handlers(app: FastAPI) -> None:
    """Register all clix exception handlers on the FastAPI app."""

    @app.exception_handler(AuthError)
    async def _auth(_: Request, exc: AuthError) -> JSONResponse:
        return JSONResponse(
            status_code=401,
            content={"error": str(exc), "type": "AuthError", "retry": False},
        )

    @app.exception_handler(RateLimitError)
    async def _rate_limit(_: Request, exc: RateLimitError) -> JSONResponse:
        return JSONResponse(
            status_code=429,
            content={"error": str(exc), "type": "RateLimitError", "retry": True},
        )

    @app.exception_handler(StaleEndpointError)
    async def _stale(_: Request, exc: StaleEndpointError) -> JSONResponse:
        return JSONResponse(
            status_code=503,
            content={"error": str(exc), "type": "StaleEndpointError", "retry": True},
        )

    @app.exception_handler(APIError)
    async def _api_error(_: Request, exc: APIError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code or 500,
            content={
                "error": str(exc),
                "type": "APIError",
                "status_code": exc.status_code,
                "retry": False,
            },
        )
