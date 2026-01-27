"""
Node Backend Communication Router (Mu API / WebAPI)

This router handles communication between the panel backend and node backend
(e.g., v2ray-poseidon). It provides endpoints for nodes to pull user lists,
report traffic, and update online status.

Security: All endpoints require Mu key authentication via X-Key header.
"""

from fastapi import APIRouter
from app.api.v0.node import webapi

router = APIRouter()

# Include WebAPI endpoints
router.include_router(webapi.router)
