"""
API Router Initialization

This module initializes and aggregates all API routers.
"""

from fastapi import APIRouter
from app.api.v0 import health

# Create main API router
api_router = APIRouter()

# Include v0 routers
api_router.include_router(
    health.router,
    prefix="/v0",
    tags=["v0"]
)
