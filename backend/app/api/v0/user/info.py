"""
User Info API Endpoint

This module handles user information queries.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserInfoResponse, UserTrafficStats, UserDashboardResponse
from app.schemas.response import success_response

router = APIRouter()


@router.get("/info", response_model=UserDashboardResponse)
async def get_user_info(
    current_user: User = Depends(get_current_user),
):
    """
    Get User Information and Traffic Statistics

    Returns detailed user information including traffic usage,
    account status, and subscription details.

    Args:
        current_user: Authenticated user from JWT token

    Returns:
        User dashboard data with traffic statistics

    Response Format:
        {
            "ret": 1,
            "msg": "ok",
            "data": {
                "user": {...},
                "traffic": {...}
            }
        }
    """
    # Calculate traffic statistics
    total_used = current_user.u + current_user.d
    remaining = current_user.transfer_enable - total_used if current_user.transfer_enable > total_used else 0
    usage_percent = round((total_used / current_user.transfer_enable * 100), 2) if current_user.transfer_enable > 0 else 0

    # Convert bytes to GB for human-readable format
    def bytes_to_gb(bytes_value: int) -> float:
        return round(bytes_value / (1024**3), 2)

    # Create user info response
    user_info = UserInfoResponse(
        id=current_user.id,
        email=current_user.email,
        user_name=current_user.user_name,
        is_admin=current_user.is_admin,
        is_enabled=current_user.enable,
        class_level=current_user.class_level,
        expire_in=current_user.expire_in,
        upload_traffic=current_user.u,
        download_traffic=current_user.d,
        total_traffic_used=total_used,
        transfer_enable=current_user.transfer_enable,
        last_checkin_time=current_user.t,
        traffic_remaining=remaining,
        traffic_used_percent=usage_percent,
        money=float(current_user.money),
        port=current_user.port,
        method=current_user.method,
        ss_password=current_user.passwd,
        node_group=current_user.node_group,
        sub_limit=current_user.sub_limit,
        warning=current_user.warming
    )

    # Create traffic stats response
    traffic_stats = UserTrafficStats(
        upload_bytes=current_user.u,
        download_bytes=current_user.d,
        total_used=total_used,
        total_limit=current_user.transfer_enable,
        remaining=remaining,
        usage_percent=usage_percent,
        upload_gb=bytes_to_gb(current_user.u),
        download_gb=bytes_to_gb(current_user.d),
        total_used_gb=bytes_to_gb(total_used),
        total_limit_gb=bytes_to_gb(current_user.transfer_enable),
        remaining_gb=bytes_to_gb(remaining)
    )

    return success_response(
        msg="ok",
        data={
            "user": user_info.model_dump(by_alias=True),
            "traffic": traffic_stats.model_dump()
        }
    )
