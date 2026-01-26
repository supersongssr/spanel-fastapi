"""
FastAPI Dependencies

This module provides common dependency functions for FastAPI routes,
including database sessions, Redis clients, and user authentication.
"""

from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.redis import RedisClient, get_redis
from app.models.user import User
from app.core.security import decode_access_token
from app.services.auth_service import AuthService


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis),
    authorization: Optional[str] = Header(None)
) -> User:
    """
    Dependency to get the current authenticated user

    Extracts and validates JWT token from Authorization header.

    Args:
        db: Database session
        redis: Redis client
        authorization: Authorization header (format: "Bearer <token>")

    Returns:
        The authenticated user object

    Raises:
        HTTPException: 401 if authentication fails, 403 if account disabled
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"ret": 0, "msg": "未授权或 Token 无效", "data": None},
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Extract token from Authorization header
    if not authorization:
        raise credentials_exception

    if not authorization.startswith("Bearer "):
        raise credentials_exception

    token = authorization.split(" ")[1]

    # Verify token and check blacklist
    payload = await AuthService.verify_token(redis, token)

    if payload is None:
        raise credentials_exception

    user_id: Optional[int] = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    # Get user from database
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    if not user.is_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"ret": 0, "msg": "用户账户已被禁用", "data": None}
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to get the current active user

    Args:
        current_user: The authenticated user

    Returns:
        The active user object

    Raises:
        HTTPException: If user is disabled
    """
    if not current_user.is_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to get the current admin user

    Verifies that the current user has admin privileges.

    Args:
        current_user: The authenticated user

    Returns:
        The admin user object

    Raises:
        HTTPException: 403 if user is not an admin
    """
    if not current_user.is_admin_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"ret": 0, "msg": "权限不足", "data": None}
        )
    return current_user


async def verify_mu_token(
    token: str,
    redis: RedisClient = Depends(get_redis)
) -> bool:
    """
    Dependency to verify Mu token for node communication

    Args:
        token: The Mu token to verify
        redis: Redis client instance

    Returns:
        True if token is valid

    Raises:
        HTTPException: If token is invalid
    """
    from app.core.security import verify_mu_key

    if not verify_mu_key(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Mu token"
        )

    return True
