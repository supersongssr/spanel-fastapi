"""
Authentication API Router

This module aggregates all authentication-related endpoints.
"""

from fastapi import APIRouter

from app.api.v0.auth.login import router as login_router
from app.api.v0.auth.register import router as register_router
from app.api.v0.auth.logout import router as logout_router

router = APIRouter()

# Include all auth routers
router.include_router(login_router, tags=["Authentication"])
router.include_router(register_router, tags=["Authentication"])
router.include_router(logout_router, tags=["Authentication"])

# Export the main router
__all__ = ["router"]
