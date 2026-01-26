"""
Check-in API Endpoint

This module handles daily check-in functionality with traffic rewards.
"""

import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.response import success_response, error_response
from app.core.config import get_settings

settings = get_settings()

router = APIRouter()


async def check_if_checked_today(user: User) -> bool:
    """
    Check if user has already checked in today

    Args:
        user: User object

    Returns:
        True if checked in today, False otherwise
    """
    if user.last_check_in_time == 0:
        return False

    # Convert timestamp to datetime
    last_checkin_date = datetime.fromtimestamp(user.last_check_in_time)
    today = datetime.now().date()

    return last_checkin_date.date() == today


@router.post("/checkin")
async def daily_checkin(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Daily Check-in

    Allows users to check in daily and receive random traffic rewards.
    Uses atomic update to prevent concurrent check-in exploits.

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        Check-in result with traffic reward

    Response Format:
        {
            "ret": 1,
            "msg": "签到成功！获得 50 MB 流量",
            "data": {
                "traffic_added_mb": 50,
                "new_total_gb": 100.5
            }
        }

    Error Response:
        {
            "ret": 0,
            "msg": "今天已经签到过了",
            "data": null
        }
    """
    # Check if already checked in today
    already_checked = await check_if_checked_today(current_user)
    if already_checked:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail=error_response(msg="今天已经签到过了", data=None)
        )

    # Get random traffic reward from config
    min_traffic_mb = settings.checkin_min
    max_traffic_mb = settings.checkin_max
    traffic_reward_mb = random.randint(min_traffic_mb, max_traffic_mb)

    # Convert MB to bytes
    traffic_reward_bytes = traffic_reward_mb * 1024 * 1024

    # Current timestamp
    current_time = int(datetime.now().timestamp())

    # Atomic update: update transfer_enable and last_check_in_time
    # This prevents race conditions where multiple requests could check in twice
    await db.execute(
        update(User)
        .where(User.id == current_user.id)
        .where(User.last_check_in_time < int((datetime.now() - timedelta(days=1)).timestamp()))
        .values(
            transfer_enable=User.transfer_enable + traffic_reward_bytes,
            last_check_in_time=current_time
        )
    )

    await db.commit()

    # Refresh user to get updated values
    await db.refresh(current_user)

    # Calculate new total in GB
    new_total_gb = round(current_user.transfer_enable / (1024**3), 2)

    return success_response(
        msg=f"签到成功！获得 {traffic_reward_mb} MB 流量",
        data={
            "traffic_added_mb": traffic_reward_mb,
            "traffic_added_bytes": traffic_reward_bytes,
            "new_total_gb": new_total_gb,
            "new_total_bytes": current_user.transfer_enable,
            "checkin_time": current_time
        }
    )


@router.get("/checkin/status")
async def get_checkin_status(
    current_user: User = Depends(get_current_user),
):
    """
    Get Check-in Status

    Returns whether user has checked in today and when they can check in next.

    Args:
        current_user: Authenticated user

    Returns:
        Check-in status information

    Response Format:
        {
            "ret": 1,
            "msg": "ok",
            "data": {
                "checked_today": true,
                "last_checkin_time": 1706745600,
                "can_checkin": false
            }
        }
    """
    checked_today = await check_if_checked_today(current_user)

    return success_response(
        msg="ok",
        data={
            "checked_today": checked_today,
            "last_checkin_time": current_user.last_check_in_time,
            "can_checkin": not checked_today
        }
    )
