"""
Register API Endpoint

This module handles user registration requests.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.auth_service import AuthService
from app.schemas.auth import RegisterRequest, RegisterResponse
from app.schemas.response import success_response, error_response

router = APIRouter()


@router.post("/register", response_model=RegisterResponse)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    User Registration Endpoint

    Register a new user account with email and password.

    Args:
        request: Registration request containing email, password, and optional fields
        db: Database session

    Returns:
        Response containing new user information

    Raises:
        HTTPException: If registration fails (e.g., email already exists)
    """
    try:
        # Create new user
        new_user = await AuthService.register(
            db=db,
            email=request.email,
            password=request.passwd,
            user_name=request.user_name
            # Note: invite_code validation can be added later if needed
        )

        return success_response(
            msg="注册成功",
            data={
                "user_id": new_user.id,
                "email": new_user.email,
                "user_name": new_user.user_name,
                "msg": "注册成功，请登录"
            }
        )

    except HTTPException as e:
        # Re-raise HTTP exceptions with proper status code
        raise e
    except Exception as e:
        # Log error and return generic error response
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"注册失败: {str(e)}"
        )
