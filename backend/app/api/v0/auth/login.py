"""
Login API Endpoint

This module handles user login requests.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.redis import RedisClient, get_redis
from app.services.auth_service import AuthService
from app.schemas.auth import LoginRequest, LoginResponse
from app.schemas.response import success_response, error_response

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis)
):
    """
    User Login Endpoint

    Authenticate user with email and password, return JWT token on success.

    Args:
        request: Login request containing email and password
        db: Database session
        redis: Redis client

    Returns:
        Response containing JWT token and user information

    Raises:
        HTTPException: If authentication fails (401) or account disabled (403)
    """
    try:
        result = await AuthService.login(
            db=db,
            redis=redis,
            email=request.email,
            password=request.passwd
        )

        return success_response(
            msg="登录成功",
            data=result
        )

    except HTTPException as e:
        # Re-raise HTTP exceptions with proper status code
        raise e
    except Exception as e:
        # Log error and return generic error response
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"登录失败: {str(e)}"
        )
