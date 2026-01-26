"""
API Router Initialization

This module initializes and aggregates all API routers.
"""

from fastapi import APIRouter
from app.api.v0 import health
from app.api.v0.auth import router as auth_router

# Create main API router
api_router = APIRouter()

# Include v0 routers
api_router.include_router(
    health.router,
    prefix="/v0",
    tags=["v0"]
)

# Include auth router
api_router.include_router(
    auth_router,
    prefix="/v0/auth"
)
