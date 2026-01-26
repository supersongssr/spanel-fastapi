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
from app.schemas.response import success_response, error_response

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

    # Serialize users
    users_data = []
    for user in users:
        users_data.append({
            "id": user.id,
            "email": user.email,
            "user_name": user.user_name,
            "is_admin": user.is_admin,
            "is_enabled": user.enable,
            "class_level": user.class_level,
            "money": float(user.money),
            "transfer_enable": user.transfer_enable,
            "upload_traffic": user.u,
            "download_traffic": user.d,
            "total_used": user.u + user.d,
            "reg_date": user.reg_date.isoformat() if user.reg_date else None,
            "expire_in": user.expire_in.isoformat() if user.expire_in else None
        })

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return success_response(
        msg="ok",
        data={
            "users": users_data,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }
    )
