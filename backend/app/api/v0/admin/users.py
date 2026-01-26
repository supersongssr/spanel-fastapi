"""
Admin Users API Endpoint

This module handles user list queries for administrators.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from typing import Optional

from app.db.session import get_db
from app.core.deps import get_current_admin_user
from app.models.user import User
from app.schemas.admin import AdminUserResponse, PaginatedResponse
from app.schemas.response import success_response

router = APIRouter()


@router.get("/users")
async def get_users_list(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by email or username"),
):
    """
    Get Users List (Admin Only)

    Returns a paginated list of all users. Admin can search by email or username.

    Args:
        current_user: Authenticated admin user
        db: Database session
        page: Page number (1-indexed)
        page_size: Number of users per page (max 100)
        search: Optional search term for email or username

    Returns:
        Paginated list of users with basic info

    Response Format:
        {
            "ret": 1,
            "msg": "ok",
            "data": {
                "users": [...],
                "total": 100,
                "page": 1,
                "page_size": 20,
                "total_pages": 5
            }
        }
    """
    # Build base query
    query = select(User)

    # Apply search filter if provided
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                User.email.like(search_pattern),
                User.user_name.like(search_pattern)
            )
        )

    # Get total count
    count_query = select(func.count()).select_from(query.alias())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Calculate offset and apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    # Execute query
    result = await db.execute(query)
    users = result.scalars().all()

    # Convert to AdminUserResponse using model_dump
    users_data = [AdminUserResponse.from_user(user).model_dump(by_alias=True) for user in users]

    # Create paginated response
    pagination = PaginatedResponse.create(
        items=users_data,
        total=total,
        page=page,
        page_size=page_size
    )

    return success_response(
        msg="ok",
        data={
            "users": pagination.items,
            "total": pagination.total,
            "page": pagination.page,
            "page_size": pagination.page_size,
            "total_pages": pagination.total_pages
        }
    )
