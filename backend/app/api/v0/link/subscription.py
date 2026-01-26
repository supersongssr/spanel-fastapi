"""
Subscription Link API Endpoint

This module handles subscription link generation for clients.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.subscribe_service import SubscriptionService

router = APIRouter()


@router.get("/{token}")
async def get_subscription(
    token: str,
    db: AsyncSession = Depends(get_db),
    subtype: str = Query("ss", description="Subscription type: ss, ssr, vmess, trojan, auto")
):
    """
    Get Subscription Link

    Generate subscription content for the user based on their token.
    Compatible with original SS-Panel subscription format.

    Args:
        token: User's subscription token (can be user ID for now)
        db: Database session
        subtype: Subscription type (default: ss)

    Returns:
        Subscription content (Base64 encoded)

        Content-Type: text/plain
        Content-Disposition: attachment; filename="subscription"

    Examples:
        GET /link/123?subtype=ss
        GET /link/123?subtype=vmess
        GET /link/123?subtype=auto
    """
    # For now, use token as user_id
    # TODO: Implement secure token generation in Phase 5
    try:
        user_id = int(token)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid token")

    # Get user from database
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.is_enabled:
        raise HTTPException(status_code=403, detail="Account disabled")

    # Check if expired
    if user.is_expired:
        raise HTTPException(status_code=403, detail="Account expired")

    # Generate subscription based on subtype
    if subtype == "auto":
        content = await SubscriptionService.generate_auto_subscription(db, user)
    else:
        content = await SubscriptionService.generate_subscription(db, user, subtype)

    # Return as plain text
    return Response(
        content=content,
        media_type="text/plain",
        headers={
            "Content-Disposition": f'attachment; filename="subscription_{user_id}"',
            "Subscription-Userinfo": f"upload={user.u}; download={user.d}; total={user.transfer_enable}; expire={user.expire_in.isoformat() if user.expire_in else 0}"
        }
    )


@router.get("/info/{token}")
async def get_subscription_info(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get Subscription Information

    Returns subscription info including traffic usage and node count.

    Args:
        token: User's subscription token
        db: Database session

    Returns:
        Subscription information

    Response Format:
        {
            "ret": 1,
            "msg": "ok",
            "data": {
                "upload": 1073741824,
                "download": 2147483648,
                "total": 107374182400,
                "used_percent": 3.0
            }
        }
    """
    try:
        user_id = int(token)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid token")

    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Calculate traffic
    total_used = user.u + user.d
    used_percent = round((total_used / user.transfer_enable * 100), 2) if user.transfer_enable > 0 else 0

    from app.schemas.response import success_response
    return success_response(
        msg="ok",
        data={
            "upload": user.u,
            "download": user.d,
            "total": user.transfer_enable,
            "used_percent": used_percent
        }
    )
