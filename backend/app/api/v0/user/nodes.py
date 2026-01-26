"""
User Nodes API Endpoint

This module handles node list queries for users.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.node import Node
from app.schemas.user import NodeInfo, NodeListResponse
from app.schemas.response import success_response
from app.core.config import get_settings

settings = get_settings()

router = APIRouter()


async def check_node_online(node: Node) -> bool:
    """
    Check if node is online based on heartbeat

    Args:
        node: Node object

    Returns:
        True if node is online (heartbeat within 5 minutes)
    """
    if node.node_heartbeat == 0:
        return False

    # Consider node offline if no heartbeat in 5 minutes (300 seconds)
    heartbeat_threshold = 300
    current_time = int(datetime.now().timestamp())
    return (current_time - node.node_heartbeat) < heartbeat_threshold


def get_node_type_name(sort: int) -> str:
    """
    Get human-readable node type name

    Args:
        sort: Node sort value

    Returns:
        Node type string
    """
    type_mapping = {
        0: "ss",      # Shadowsocks
        1: "ssr",     # ShadowsocksR
        2: "ssr",
        3: "ssr",
        4: "ssr",
        5: "ssr",
        6: "ssr",
        7: "ssr",
        8: "ssr",
        9: "ssr",
        11: "vmess",  # V2Ray VMess
        13: "vless",  # V2Ray VLess
        14: "trojan"  # Trojan
    }
    return type_mapping.get(sort, "ss")


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
        # Determine traffic rate string
        traffic_rate_str = f"{node.traffic_rate}x" if node.traffic_rate != 1 else "1x"

        node_info = NodeInfo(
            id=node.id,
            name=node.name,
            server=node.server,
            server_port=0,  # Port is configured per user, not in node table
            method=node.method,
            is_online=await check_node_online(node),
            traffic_rate=traffic_rate_str,
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
