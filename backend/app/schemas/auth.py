"""
Authentication Schemas

This module defines Pydantic schemas for authentication-related requests and responses.
"""

from typing import Optional
from pydantic import BaseModel, Field, EmailStr, field_validator
import re


class LoginRequest(BaseModel):
    """Login request schema"""

    email: EmailStr = Field(
        ...,
        description="User email address",
        example="user@example.com"
    )
    passwd: str = Field(
        ...,
        min_length=6,
        max_length=64,
        description="User password",
        example="password123"
    )


class RegisterRequest(BaseModel):
    """Registration request schema"""

    email: EmailStr = Field(
        ...,
        description="User email address",
        example="user@example.com"
    )
    passwd: str = Field(
        ...,
        min_length=8,
        max_length=64,
        description="User password (min 8 characters)",
        example="password123"
    )
    passwd2: str = Field(
        ...,
        min_length=8,
        max_length=64,
        description="Confirm password",
        example="password123"
    )
    user_name: Optional[str] = Field(
        None,
        max_length=128,
        description="Optional username"
    )
    invite_code: Optional[str] = Field(
        None,
        max_length=64,
        description="Optional invitation code"
    )

    @field_validator('passwd')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('密码长度至少为 8 个字符')
        return v

    @field_validator('passwd2')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        """Validate that passwords match"""
        if 'passwd' in info.data and v != info.data['passwd']:
            raise ValueError('两次输入的密码不一致')
        return v

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Additional email validation if needed"""
        # Basic email format is already validated by EmailStr
        # Add any custom validation here if needed
        return v.lower()


class UserInfo(BaseModel):
    """User information schema"""

    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    user_name: str = Field(..., description="Username")
    is_admin: int = Field(..., description="Is admin (1=yes, 0=no)")
    class_level: int = Field(..., description="User level")
    transfer_enable: int = Field(..., description="Total traffic limit (bytes)")
    u: int = Field(..., description="Upload traffic (bytes)")
    d: int = Field(..., description="Download traffic (bytes)")
    expire_in: Optional[str] = Field(None, description="Account expiration time")


class LoginResponse(BaseModel):
    """Login response schema"""

    token: str = Field(..., description="JWT access token")
    user: UserInfo = Field(..., description="User information")


class RegisterResponse(BaseModel):
    """Registration response schema"""

    user_id: int = Field(..., description="New user ID")
    email: str = Field(..., description="User email")
    user_name: str = Field(..., description="Username")
    msg: str = Field(..., description="Registration message")


class LogoutResponse(BaseModel):
    """Logout response schema"""

    msg: str = Field(..., description="Logout message")
