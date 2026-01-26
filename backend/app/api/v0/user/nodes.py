"""
User Nodes API Endpoint

This module handles node list queries for users.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.node import Node
from app.schemas.user import NodeInfo, NodeListResponse
from app.schemas.response import success_response
from app.utils.node_utils import check_node_online, get_node_type_name, format_traffic_rate

router = APIRouter()


@router.get("/nodes", response_model=NodeListResponse)
async def get_user_nodes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get Available Nodes for User

    Returns a list of nodes that the user can access based on:
    - User level (class) vs node requirements
    - Node group membership
    - Node visibility (type=1 for show, type=0 for hide)

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        List of available nodes

    Response Format:
        {
            "ret": 1,
            "msg": "ok",
            "data": {
                "nodes": [...],
                "total": 10
            }
        }
    """
    # Query nodes that:
    # 1. Are visible (type != 0)
    # 2. User level meets requirements (node_class <= user.class_level)
    # 3. Node group matches or is 0 (all groups)
    result = await db.execute(
        select(Node).where(
            and_(
                Node.type != 0,  # Visible nodes only
                Node.node_class <= current_user.class_level,  # User level check
                # Node group check: either user's group is 0 or matches node's group
                (current_user.node_group == 0) | (Node.node_group == current_user.node_group)
            )
        ).order_by(Node.node_sort)  # Sort by node_sort
    )

    nodes = result.scalars().all()

    # Build response with node info
    node_list = []
    for node in nodes:
        node_info = NodeInfo(
            id=node.id,
            name=node.name,
            server=node.server,
            server_port=0,  # Port is configured per user, not in node table
            method=node.method,
            is_online=await check_node_online(node),
            traffic_rate=format_traffic_rate(node.traffic_rate),
            info=node.info,
            type=get_node_type_name(node.sort),
            class_level=node.node_class,
            node_group=node.node_group
        )
        node_list.append(node_info)

    return success_response(
        msg="ok",
        data={
            "nodes": [node.model_dump() for node in node_list],
            "total": len(node_list)
        }
    )
