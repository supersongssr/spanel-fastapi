"""
Admin Schemas

This module defines Pydantic schemas for admin-related requests and responses.
These schemas provide standardized data structures for admin endpoints.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class AdminUserResponse(BaseModel):
    """
    Admin User Response Schema

    Standardized user information for admin endpoints.
    Uses readable field names.
    """

    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    user_name: str = Field(..., description="Username")
    is_admin: int = Field(..., description="Is admin (1=yes, 0=no)")
    is_enabled: int = Field(..., description="Account enabled (1=yes, 0=no)")
    class_level: int = Field(..., description="User level", alias="class")
    money: float = Field(..., description="Account balance")
    transfer_enable: int = Field(..., description="Total traffic limit (bytes)")
    upload_traffic: int = Field(..., description="Upload traffic (bytes)", alias="u")
    download_traffic: int = Field(..., description="Download traffic (bytes)", alias="d")
    total_used: int = Field(..., description="Total used traffic (bytes)")
    reg_date: Optional[str] = Field(None, description="Registration date")
    expire_in: Optional[str] = Field(None, description="Account expiration")

    class Config:
        populate_by_name = True

    @classmethod
    def from_user(cls, user: 'User') -> 'AdminUserResponse':
        """
        Create AdminUserResponse from User model

        Args:
            user: User model instance

        Returns:
            AdminUserResponse instance
        """
        return cls(
            id=user.id,
            email=user.email,
            user_name=user.user_name,
            is_admin=user.is_admin,
            is_enabled=user.enable,
            class_level=user.class_level,
            money=float(user.money),
            transfer_enable=user.transfer_enable,
            upload_traffic=user.u,
            download_traffic=user.d,
            total_used=user.u + user.d,
            reg_date=user.reg_date.isoformat() if user.reg_date else None,
            expire_in=user.expire_in.isoformat() if user.expire_in else None
        )


class AdminNodeResponse(BaseModel):
    """
    Admin Node Response Schema

    Detailed node information for admin endpoints.
    """

    id: int = Field(..., description="Node ID")
    name: str = Field(..., description="Node name")
    server: str = Field(..., description="Server address")
    method: str = Field(..., description="Encryption method")
    type: str = Field(..., description="Node type (ss/ssr/vmess/etc)")
    is_online: bool = Field(..., description="Node online status")
    last_heartbeat: Optional[str] = Field(None, description="Last heartbeat time")
    status: str = Field(..., description="Node status")
    info: str = Field(..., description="Node description")
    class_level: int = Field(..., description="Required user level")
    node_group: int = Field(..., description="Node group ID")
    traffic_rate: float = Field(..., description="Traffic rate multiplier")
    bandwidth_used_gb: float = Field(..., description="Used bandwidth (GB)")
    bandwidth_limit_gb: float = Field(..., description="Bandwidth limit (GB)")
    bandwidth_used_percent: float = Field(..., description="Bandwidth usage percentage")
    daily_traffic_used_gb: float = Field(..., description="Daily traffic used (GB)")
    daily_traffic_left_gb: float = Field(..., description="Daily traffic left (GB)")
    daily_traffic_percent: float = Field(..., description="Daily traffic usage percentage")
    speed_limit_mbps: float = Field(..., description="Speed limit (MB/s)")
    connection_limit: int = Field(..., description="Connection limit")
    online_users: int = Field(..., description="Number of online users")
    node_cost: int = Field(..., description="Node cost")
    country_code: str = Field(..., description="Country code")

    @classmethod
    def from_node(
        cls,
        node: 'Node',
        is_online: bool,
        bandwidth_used_percent: float,
        daily_traffic_percent: float
    ) -> 'AdminNodeResponse':
        """
        Create AdminNodeResponse from Node model

        Args:
            node: Node model instance
            is_online: Node online status
            bandwidth_used_percent: Bandwidth usage percentage
            daily_traffic_percent: Daily traffic usage percentage

        Returns:
            AdminNodeResponse instance
        """
        from app.utils.node_utils import bytes_to_gb, get_last_heartbeat_timestamp

        return cls(
            id=node.id,
            name=node.name,
            server=node.server,
            method=node.method,
            type=get_node_type_name(node.sort),
            is_online=is_online,
            last_heartbeat=get_last_heartbeat_timestamp(node.node_heartbeat),
            status=node.status,
            info=node.info,
            class_level=node.node_class,
            node_group=node.node_group,
            traffic_rate=node.traffic_rate,
            bandwidth_used_gb=bytes_to_gb(node.node_bandwidth),
            bandwidth_limit_gb=bytes_to_gb(node.node_bandwidth_limit),
            bandwidth_used_percent=bandwidth_used_percent,
            daily_traffic_used_gb=bytes_to_gb(node.traffic_used_daily),
            daily_traffic_left_gb=bytes_to_gb(node.traffic_left_daily),
            daily_traffic_percent=daily_traffic_percent,
            speed_limit_mbps=node.node_speedlimit,
            connection_limit=node.node_connector,
            online_users=node.node_online,
            node_cost=node.node_cost,
            country_code=node.country_code
        )


class PaginatedResponse(BaseModel):
    """
    Generic paginated response schema
    """

    items: list = Field(..., description="List of items")
    total: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")

    @classmethod
    def create(
        cls,
        items: list,
        total: int,
        page: int,
        page_size: int
    ) -> 'PaginatedResponse':
        """
        Create paginated response

        Args:
            items: List of items
            total: Total number of items
            page: Current page number
            page_size: Items per page

        Returns:
            PaginatedResponse instance
        """
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
