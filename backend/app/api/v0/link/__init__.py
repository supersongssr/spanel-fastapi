"""
Link/Subscription API Router

This module aggregates subscription-related endpoints.
"""

from fastapi import APIRouter

from app.api.v0.link.subscription import router as subscription_router

router = APIRouter()

# Include subscription router
router.include_router(subscription_router, tags=["Subscription"])

# Export the main router
__all__ = ["router"]
