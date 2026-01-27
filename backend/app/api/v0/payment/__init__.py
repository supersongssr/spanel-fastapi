"""
Payment Router

This router handles payment-related operations including:
- Creating payment orders
- Payment gateway callbacks (webhooks)
- Debug/manual payment confirmation
"""

from fastapi import APIRouter
from app.api.v0.payment import payment

router = APIRouter()

# Include payment endpoints
router.include_router(payment.router)
