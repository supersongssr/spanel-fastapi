"""
Admin Nodes API Endpoint

This module handles node list queries for administrators.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime

from app.db.session import get_db
from app.core.deps import get_current_admin_user
from app.models.user import User
from app.models.node import Node
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


def bytes_to_gb(bytes_value: int) -> float:
    """Convert bytes to GB"""
    return round(bytes_value / (1024**3), 2)


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

    # Serialize nodes with admin-level details
    nodes_data = []
    for node in nodes:
        is_online = await check_node_online(node)

        # Calculate bandwidth usage
        bandwidth_used_percent = 0
        if node.node_bandwidth_limit > 0:
            bandwidth_used_percent = round(
                (node.node_bandwidth / node.node_bandwidth_limit) * 100, 2
            )

        # Calculate daily traffic usage
        daily_traffic_used_percent = 0
        if node.traffic_used_daily > 0:
            total_daily = node.traffic_used_daily + node.traffic_left_daily
            if total_daily > 0:
                daily_traffic_used_percent = round(
                    (node.traffic_used_daily / total_daily) * 100, 2
                )

        # Last heartbeat time
        last_heartbeat = None
        if node.node_heartbeat > 0:
            last_heartbeat = datetime.fromtimestamp(node.node_heartbeat).isoformat()

        nodes_data.append({
            "id": node.id,
            "name": node.name,
            "server": node.server,
            "method": node.method,
            "type": get_node_type_name(node.sort),
            "is_online": is_online,
            "last_heartbeat": last_heartbeat,
            "status": node.status,
            "info": node.info,
            "class_level": node.node_class,
            "node_group": node.node_group,
            "traffic_rate": node.traffic_rate,
            "bandwidth_used_gb": bytes_to_gb(node.node_bandwidth),
            "bandwidth_limit_gb": bytes_to_gb(node.node_bandwidth_limit),
            "bandwidth_used_percent": bandwidth_used_percent,
            "daily_traffic_used_gb": bytes_to_gb(node.traffic_used_daily),
            "daily_traffic_left_gb": bytes_to_gb(node.traffic_left_daily),
            "daily_traffic_percent": daily_traffic_used_percent,
            "speed_limit_mbps": node.node_speedlimit,
            "connection_limit": node.node_connector,
            "online_users": node.node_online,
            "node_cost": node.node_cost,
            "country_code": node.country_code
        })

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return success_response(
        msg="ok",
        data={
            "nodes": nodes_data,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }
    )
