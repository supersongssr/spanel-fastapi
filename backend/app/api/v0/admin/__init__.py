"""
Admin API Router

This module aggregates all admin-related endpoints.
"""

from fastapi import APIRouter

from app.api.v0.admin.users import router as users_router
from app.api.v0.admin.nodes import router as nodes_router

router = APIRouter()

# Include all admin routers
router.include_router(users_router, tags=["Admin"])
router.include_router(nodes_router, tags=["Admin"])

# Export the main router
__all__ = ["router"]
