"""
Authentication Service

This module handles all authentication-related business logic including
login, registration, token management, and token blacklisting.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.user import User
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.db.redis import RedisClient
from app.core.config import get_settings

settings = get_settings()


class AuthService:
    """
    Authentication Service

    Handles user authentication operations including login, registration,
    and token management.
    """

    @staticmethod
    async def authenticate_user(
        db: AsyncSession,
        email: str,
        password: str
    ) -> Optional[User]:
        """
        Authenticate user with email and password

        Args:
            db: Database session
            email: User email
            password: Plain text password

        Returns:
            User object if authentication successful, None otherwise
        """
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()

        if not user:
            return None

        if not verify_password(password, user.password_hash):
            return None

        return user

    @staticmethod
    async def login(
        db: AsyncSession,
        redis: RedisClient,
        email: str,
        password: str
    ) -> Dict[str, Any]:
        """
        Login user and return JWT token

        Args:
            db: Database session
            redis: Redis client
            email: User email
            password: Plain text password

        Returns:
            Dictionary containing token and user info

        Raises:
            HTTPException: If authentication fails
        """
        user = await AuthService.authenticate_user(db, email, password)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="邮箱或密码错误"
            )

        if not user.is_enabled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="用户账户已被禁用"
            )

        # Create JWT token
        token_payload = {
            "sub": str(user.id),
            "email": user.email,
            "is_admin": user.is_admin
        }

        access_token = create_access_token(token_payload)

        # Store token in Redis for blacklist support
        # Key format: auth_token:{user_id}
        await redis.set(
            f"auth_token:{user.id}",
            access_token,
            ex=settings.jwt_access_token_expire_minutes * 60
        )

        return {
            "token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "user_name": user.user_name,
                "is_admin": user.is_admin,
                "class_level": user.class_level,
                "transfer_enable": user.transfer_enable,
                "u": user.u,
                "d": user.d,
                "expire_in": user.expire_in.isoformat() if user.expire_in else None
            }
        }

    @staticmethod
    async def register(
        db: AsyncSession,
        email: str,
        password: str,
        user_name: Optional[str] = None,
        ref_by: Optional[int] = None
    ) -> User:
        """
        Register a new user

        Args:
            db: Database session
            email: User email
            password: Plain text password
            user_name: Optional username
            ref_by: Optional referrer user ID

        Returns:
            Created user object

        Raises:
            HTTPException: If registration fails
        """
        # Check if email already exists
        result = await db.execute(
            select(User).where(User.email == email)
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被注册"
            )

        # Hash password
        hashed_password = get_password_hash(password)

        # Generate username from email if not provided
        if not user_name:
            user_name = email.split("@")[0]

        # Generate random port and SS password
        import random
        import string

        port = random.randint(10000, 65535)
        ss_passwd = ''.join(random.choices(string.ascii_letters + string.digits, k=16))

        # Calculate transfer enable (default traffic from config)
        transfer_enable = settings.default_traffic * 1024 * 1024 * 1024  # Convert GB to bytes

        # Create user
        # Note: we use _password_hash attribute which maps to 'pass' column
        new_user = User(
            email=email,
            _password_hash=hashed_password,
            passwd=ss_passwd,
            user_name=user_name,
            port=port,
            transfer_enable=transfer_enable,
            ref_by=ref_by or 0,
            reg_date=datetime.now(),
            node_group=settings.register_node_group,
            sub_limit=settings.sub_limit,
            method="aes-256-gcm",
            enable=1,
            is_admin=0
        )

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        return new_user

    @staticmethod
    async def logout(
        redis: RedisClient,
        user_id: int,
        token: str
    ) -> bool:
        """
        Logout user by adding token to blacklist

        Args:
            redis: Redis client
            user_id: User ID
            token: JWT token to blacklist

        Returns:
            True if successful
        """
        # Add token to blacklist
        # Key format: blacklist_token:{token}
        await redis.set(
            f"blacklist_token:{token}",
            str(user_id),
            ex=settings.jwt_access_token_expire_minutes * 60
        )

        # Remove active token
        await redis.delete(f"auth_token:{user_id}")

        return True

    @staticmethod
    async def is_token_blacklisted(
        redis: RedisClient,
        token: str
    ) -> bool:
        """
        Check if token is blacklisted

        Args:
            redis: Redis client
            token: JWT token to check

        Returns:
            True if token is blacklisted
        """
        return await redis.exists(f"blacklist_token:{token}")

    @staticmethod
    async def verify_token(
        redis: RedisClient,
        token: str
    ) -> Optional[Dict[str, Any]]:
        """
        Verify JWT token and check blacklist

        Args:
            redis: Redis client
            token: JWT token to verify

        Returns:
            Token payload if valid, None otherwise
        """
        # Check if token is blacklisted
        if await AuthService.is_token_blacklisted(redis, token):
            return None

        # Decode token
        payload = decode_access_token(token)

        if not payload:
            return None

        return payload
