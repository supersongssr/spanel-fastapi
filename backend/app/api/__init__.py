"""
API Router Initialization

This module initializes and aggregates all API routers.
"""

from fastapi import APIRouter
from app.api.v0 import health
from app.api.v0.auth import router as auth_router
from app.api.v0.user import router as user_router
from app.api.v0.admin import router as admin_router
from app.api.v0.link import router as link_router

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

# Include user router
api_router.include_router(
    user_router,
    prefix="/v0/user"
)

# Include admin router
api_router.include_router(
    admin_router,
    prefix="/v0/admin"
)

# Include link/subscription router (no prefix, allows /link/{token})
api_router.include_router(link_router, prefix="/v0/link")
