"""
User API Router

This module aggregates all user-related endpoints.
"""

from fastapi import APIRouter

from app.api.v0.user.info import router as info_router
from app.api.v0.user.nodes import router as nodes_router
from app.api.v0.user.checkin import router as checkin_router
from app.api.v0.user.shop import router as shop_router

router = APIRouter()

# Include all user routers
router.include_router(info_router, tags=["User"])
router.include_router(nodes_router, tags=["User"])
router.include_router(checkin_router, tags=["User"])
router.include_router(shop_router, tags=["User"])

# Export the main router
__all__ = ["router"]
