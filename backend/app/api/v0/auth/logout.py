"""
Logout API Endpoint

This module handles user logout requests and token blacklisting.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.redis import RedisClient, get_redis
from app.services.auth_service import AuthService
from app.schemas.response import success_response

router = APIRouter()


@router.post("/logout")
async def logout(
    authorization: str = Header(..., description="Authorization header with Bearer token"),
    redis: RedisClient = Depends(get_redis)
):
    """
    User Logout Endpoint

    Logout user by adding the current token to the blacklist.

    Args:
        authorization: Authorization header containing Bearer token
        redis: Redis client

    Returns:
        Success response

    Raises:
        HTTPException: If logout fails
    """
    try:
        # Extract token from Authorization header
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format"
            )

        token = authorization.split(" ")[1]

        # Decode token to get user_id
        payload = await AuthService.verify_token(redis, token)

        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )

        user_id = int(payload.get("sub"))

        # Add token to blacklist
        await AuthService.logout(redis, user_id, token)

        return success_response(
            msg="注销成功",
            data=None
        )

    except HTTPException as e:
        # Re-raise HTTP exceptions with proper status code
        raise e
    except Exception as e:
        # Log error and return generic error response
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"注销失败: {str(e)}"
        )
