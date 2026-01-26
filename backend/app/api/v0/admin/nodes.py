"""
Admin Nodes API Endpoint

This module handles node list queries for administrators.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.core.deps import get_current_admin_user
from app.models.user import User
from app.models.node import Node
from app.schemas.admin import AdminNodeResponse, PaginatedResponse
from app.schemas.response import success_response
from app.utils.node_utils import (
    check_node_online,
    get_node_type_name,
    calculate_traffic_percent
)

router = APIRouter()


@router.get("/nodes")
async def get_nodes_list(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """
    Get Nodes List (Admin Only)

    Returns a paginated list of all nodes with detailed status information.

    Args:
        current_user: Authenticated admin user
        db: Database session
        page: Page number (1-indexed)
        page_size: Number of nodes per page (max 100)

    Returns:
        Paginated list of nodes with status and traffic info

    Response Format:
        {
            "ret": 1,
            "msg": "ok",
            "data": {
                "nodes": [...],
                "total": 50,
                "page": 1,
                "page_size": 20,
                "total_pages": 3
            }
        }
    """
    # Build query
    query = select(Node)

    # Get total count
    count_query = select(func.count()).select_from(Node)
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Calculate offset and apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    # Execute query
    result = await db.execute(query)
    nodes = result.scalars().all()

    # Convert to AdminNodeResponse using helper
    nodes_data = []
    for node in nodes:
        is_online = await check_node_online(node)

        # Calculate bandwidth usage percentage
        bandwidth_used_percent = calculate_traffic_percent(
            node.node_bandwidth,
            node.node_bandwidth_limit
        )

        # Calculate daily traffic usage percentage
        total_daily = node.traffic_used_daily + node.traffic_left_daily
        daily_traffic_percent = calculate_traffic_percent(
            node.traffic_used_daily,
            total_daily
        )

        # Create AdminNodeResponse
        node_response = AdminNodeResponse.from_node(
            node=node,
            is_online=is_online,
            bandwidth_used_percent=bandwidth_used_percent,
            daily_traffic_percent=daily_traffic_percent
        )
        nodes_data.append(node_response.model_dump())

    # Create paginated response
    pagination = PaginatedResponse.create(
        items=nodes_data,
        total=total,
        page=page,
        page_size=page_size
    )

    return success_response(
        msg="ok",
        data={
            "nodes": pagination.items,
            "total": pagination.total,
            "page": pagination.page,
            "page_size": pagination.page_size,
            "total_pages": pagination.total_pages
        }
    )
