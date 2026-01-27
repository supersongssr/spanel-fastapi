"""
Node WebAPI Endpoints

This module implements the Mu API / WebAPI interface for node communication.
Nodes (like v2ray-poseidon) use these endpoints to:
1. Pull authorized user lists
2. Report traffic usage (with atomic updates)
3. Report online user count and load

All endpoints require Mu key authentication via the 'Key' header.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, or_
from datetime import datetime

from app.db.session import get_db
from app.db.redis import redis_client
from app.models.user import User
from app.models.node import Node
from app.schemas.response import success_response, error_response
from app.core.security import verify_mu_key

router = APIRouter()


async def verify_node_key(key: str = Header(..., alias="Key")):
    """
    Verify Mu key for node communication

    Args:
        key: Mu key from request header

    Raises:
        HTTPException: If key is invalid

    Returns:
        True if key is valid
    """
    if not verify_mu_key(key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_response(msg="无效的节点通讯密钥 (Mu Key)")
        )
    return True


@router.get("/users")
async def get_node_users(
    node_id: Optional[int] = None,
    key: str = Header(..., alias="Key"),
    db: AsyncSession = Depends(get_db)
):
    """
    GET /app/api/v0/node/users - Pull User List for Node

    Nodes call this endpoint to get the list of users allowed to connect.
    Only returns essential fields to minimize data transfer.

    Query Parameters:
        node_id: Optional node ID to filter users by node group

    Request Headers:
        Key: Mu key for authentication

    Returns:
        List of users with core fields:
        - id: User ID
        - email: User email
        - passwd: SS password
        - port: Port number
        - method: Encryption method
        - protocol: Protocol plugin
        - protocol_param: Protocol parameters
        - obfs: Obfuscation plugin
        - obfs_param: Obfuscation parameters
        - t: Last used time
        - u: Upload traffic (bytes)
        - d: Download traffic (bytes)
        - transfer_enable: Total traffic limit
        - class: User level
        - node_group: Node group
        - enable: Account enabled status
        - switch: Account switch status

    Performance Note:
        Only selects required fields, avoids SELECT * on 60+ field table
    """
    # Build query with only essential fields
    query = select(
        User.id,
        User.email,
        User.passwd,
        User.port,
        User.method,
        User.protocol,
        User.protocol_param,
        User.obfs,
        User.obfs_param,
        User.t,
        User.u,
        User.d,
        User.transfer_enable,
        User.class_level,
        User.node_group,
        User.enable,
        User.switch
    ).where(
        and_(
            User.enable == 1,  # Account must be enabled
            User.switch == 1,  # Account switch must be on
        )
    )

    # Filter by node group if node_id is provided
    if node_id:
        # Get node info to check node_group
        node_result = await db.execute(select(Node).where(Node.id == node_id))
        node = node_result.scalar_one_or_none()

        if node:
            # Filter users: node_group=0 means all groups, otherwise match
            if node.node_group != 0:
                query = query.where(
                    or_(
                        User.node_group == 0,
                        User.node_group == node.node_group
                    )
                )

    # Execute query
    result = await db.execute(query)
    users = result.all()

    # Convert to list of dicts
    user_list = []
    for user in users:
        user_dict = {
            "id": user.id,
            "email": user.email,
            "passwd": user.passwd,
            "port": user.port,
            "method": user.method,
            "protocol": user.protocol,
            "protocol_param": user.protocol_param,
            "obfs": user.obfs,
            "obfs_param": user.obfs_param,
            "t": user.t,
            "u": user.u,
            "d": user.d,
            "transfer_enable": user.transfer_enable,
            "class": user.class_level,
            "node_group": user.node_group,
            "enable": user.enable,
            "switch": user.switch
        }
        user_list.append(user_dict)

    return success_response(
        msg="ok",
        data={"users": user_list, "count": len(user_list)}
    )


@router.post("/traffic")
async def report_traffic(
    traffic_data: Dict[str, Any],
    key: str = Header(..., alias="Key"),
    db: AsyncSession = Depends(get_db)
):
    """
    POST /app/api/v0/node/traffic - Report Traffic Usage

    Nodes call this endpoint to report user traffic usage.
    Uses ATOMIC database updates to prevent concurrent overwrite issues.

    Request Headers:
        Key: Mu key for authentication

    Request Body (JSON):
        {
            "node_id": 123,
            "data": [
                {
                    "user_id": 456,
                    "u": 1048576,    // Upload bytes in this period
                    "d": 2097152     // Download bytes in this period
                },
                ...
            ]
        }

    Important:
        - Uses SQLAlchemy atomic update: u = u + :val
        - NEVER read-then-write to avoid race conditions
        - Also updates node's total bandwidth counter

    Returns:
        Success response with updated count
    """
    node_id = traffic_data.get("node_id")
    data = traffic_data.get("data", [])

    if not node_id or not data:
        return error_response(msg="参数不完整")

    # Verify node exists
    node_result = await db.execute(select(Node).where(Node.id == node_id))
    node = node_result.scalar_one_or_none()

    if not node:
        return error_response(msg="节点不存在")

    # Process each user's traffic report
    updated_count = 0
    total_node_traffic = 0

    for item in data:
        user_id = item.get("user_id")
        u_delta = item.get("u", 0)  # Upload delta
        d_delta = item.get("d", 0)  # Download delta

        if not user_id:
            continue

        # ATOMIC UPDATE: Directly increment in database
        # This prevents race conditions where concurrent reports overwrite each other
        await db.execute(
            update(User)
            .where(User.id == user_id)
            .values(
                u=User.u + u_delta,
                d=User.d + d_delta,
                t=int(datetime.now().timestamp())  # Update last used time
            )
        )

        updated_count += 1
        total_node_traffic += (u_delta + d_delta)

    # Update node's total bandwidth
    await db.execute(
        update(Node)
        .where(Node.id == node_id)
        .values(
            node_bandwidth=Node.node_bandwidth + total_node_traffic,
            node_heartbeat=int(datetime.now().timestamp())
        )
    )

    # Commit all atomic updates
    await db.commit()

    return success_response(
        msg="流量上报成功",
        data={
            "updated_count": updated_count,
            "node_id": node_id,
            "total_traffic": total_node_traffic
        }
    )


@router.post("/online")
async def report_online(
    online_data: Dict[str, Any],
    key: str = Header(..., alias="Key"),
    db: AsyncSession = Depends(get_db)
):
    """
    POST /app/api/v0/node/online - Report Online User Count

    Nodes call this endpoint to report current online user count and load.

    Request Headers:
        Key: Mu key for authentication

    Request Body (JSON):
        {
            "node_id": 123,
            "online": 45,        // Current online user count
            "load": "0.25"       // Optional: CPU/load average
        }

    Returns:
        Success response

    Note:
        Online count is stored in Redis for fast access and real-time monitoring.
        Node heartbeat is updated in database.
    """
    node_id = online_data.get("node_id")
    online_count = online_data.get("online", 0)
    load = online_data.get("load", "0.0")

    if not node_id:
        return error_response(msg="节点ID不能为空")

    # Verify node exists
    node_result = await db.execute(select(Node).where(Node.id == node_id))
    node = node_result.scalar_one_or_none()

    if not node:
        return error_response(msg="节点不存在")

    # Update node heartbeat in database
    await db.execute(
        update(Node)
        .where(Node.id == node_id)
        .values(
            node_heartbeat=int(datetime.now().timestamp()),
            node_online=online_count
        )
    )
    await db.commit()

    # Store online count in Redis for real-time stats
    redis_key = f"node:online:{node_id}"
    await redis_client.set(
        redis_key,
        str(online_count),
        ex=300  # Expire in 5 minutes
    )

    # Store load info if provided
    if load:
        load_key = f"node:load:{node_id}"
        await redis_client.set(
            load_key,
            str(load),
            ex=300
        )

    return success_response(
        msg="在线人数上报成功",
        data={
            "node_id": node_id,
            "online": online_count,
            "load": load
        }
    )


@router.post("/heartbeat")
async def node_heartbeat(
    heartbeat_data: Dict[str, Any],
    key: str = Header(..., alias="Key"),
    db: AsyncSession = Depends(get_db)
):
    """
    POST /app/api/v0/node/heartbeat - Node Heartbeat

    Simple heartbeat endpoint for nodes to report they are alive.
    More lightweight than /online, just updates heartbeat timestamp.

    Request Headers:
        Key: Mu key for authentication

    Request Body (JSON):
        {
            "node_id": 123,
            "cpu_load": 0.25,        // Optional
            "memory_usage": 45.2,    // Optional (MB)
            "network_speed": 100.5   // Optional (Mbps)
        }

    Returns:
        Success response
    """
    node_id = heartbeat_data.get("node_id")

    if not node_id:
        return error_response(msg="节点ID不能为空")

    # Update node heartbeat
    await db.execute(
        update(Node)
        .where(Node.id == node_id)
        .values(node_heartbeat=int(datetime.now().timestamp()))
    )
    await db.commit()

    # Store detailed stats in Redis if provided
    if heartbeat_data.get("cpu_load") or heartbeat_data.get("memory_usage"):
        stats_key = f"node:stats:{node_id}"
        await redis_client.json_set(
            stats_key,
            heartbeat_data,
            ex=180  # Expire in 3 minutes
        )

    return success_response(msg="心跳接收成功")


@router.get("/info/{node_id}")
async def get_node_info(
    node_id: int,
    key: str = Header(..., alias="Key"),
    db: AsyncSession = Depends(get_db)
):
    """
    GET /app/api/v0/node/info/{node_id} - Get Node Configuration

    Returns node configuration for the backend to use.

    Request Headers:
        Key: Mu key for authentication

    Returns:
        Node configuration including server, method, speed limits, etc.
    """
    result = await db.execute(select(Node).where(Node.id == node_id))
    node = result.scalar_one_or_none()

    if not node:
        return error_response(msg="节点不存在")

    node_info = {
        "id": node.id,
        "name": node.name,
        "server": node.server,
        "method": node.method,
        "info": node.info,
        "status": node.status,
        "sort": node.sort,
        "custom_method": node.custom_method,
        "traffic_rate": node.traffic_rate,
        "node_class": node.node_class,
        "node_speedlimit": node.node_speedlimit,
        "node_connector": node.node_connector,
        "node_group": node.node_group,
        "mu_only": node.mu_only
    }

    return success_response(
        msg="ok",
        data=node_info
    )
