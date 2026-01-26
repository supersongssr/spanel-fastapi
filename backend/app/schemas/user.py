"""
User Schemas

This module defines Pydantic schemas for user-related requests and responses.
It provides readable field aliases for database columns (u, d, t, etc.).
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_serializer


class UserInfoResponse(BaseModel):
    """
    User Information Response Schema

    Provides user data with readable field names while maintaining
    compatibility with the original database schema.

    Note: passwd field is for SS password (16 chars), NOT login password.
    Login password is stored in the 'pass' column and should never be returned.
    """

    # Basic Info
    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    user_name: str = Field(..., description="Username")

    # User Status
    is_admin: int = Field(..., description="Is admin (1=yes, 0=no)")
    is_enabled: int = Field(..., description="Account enabled (1=yes, 0=no)")
    class_level: int = Field(..., description="User level (0=free, 1+=paid)", alias="class")
    expire_in: Optional[str] = Field(None, description="Account expiration time")

    # Traffic Statistics (readable aliases for u, d, t fields)
    upload_traffic: int = Field(..., description="Upload traffic in bytes", alias="u")
    download_traffic: int = Field(..., description="Download traffic in bytes", alias="d")
    total_traffic_used: int = Field(..., description="Total used traffic (u + d)")
    transfer_enable: int = Field(..., description="Total traffic limit in bytes")
    last_checkin_time: int = Field(..., description="Last check-in timestamp", alias="t")

    # Traffic Calculations
    traffic_remaining: int = Field(..., description="Remaining traffic in bytes")
    traffic_used_percent: float = Field(..., description="Traffic usage percentage")

    # Financial
    money: float = Field(..., description="Account balance")

    # Node Settings
    port: int = Field(..., description="SS port number")
    method: str = Field(..., description="Encryption method")
    ss_password: str = Field(..., description="SS password (16 chars)", alias="passwd")

    # Subscription
    node_group: int = Field(..., description="Node group ID")
    sub_limit: int = Field(..., description="Subscription node limit")

    # Warning message
    warning: Optional[str] = Field(None, description="Account warning message", alias="warming")

    class Config:
        # Allow population by field name
        populate_by_name = True

    @field_serializer('expire_in')
    def serialize_expire_in(self, expire_in: Optional[datetime]) -> Optional[str]:
        """Serialize datetime to ISO format string"""
        if expire_in:
            return expire_in.isoformat()
        return None


class UserTrafficStats(BaseModel):
    """
    User Traffic Statistics Schema

    Detailed breakdown of user traffic usage.
    """

    upload_bytes: int = Field(..., description="Upload traffic in bytes")
    download_bytes: int = Field(..., description="Download traffic in bytes")
    total_used: int = Field(..., description="Total used traffic in bytes")
    total_limit: int = Field(..., description="Total traffic limit in bytes")
    remaining: int = Field(..., description="Remaining traffic in bytes")
    usage_percent: float = Field(..., description="Usage percentage")

    # Human-readable formats
    upload_gb: float = Field(..., description="Upload traffic in GB")
    download_gb: float = Field(..., description="Download traffic in GB")
    total_used_gb: float = Field(..., description="Total used traffic in GB")
    total_limit_gb: float = Field(..., description="Total traffic limit in GB")
    remaining_gb: float = Field(..., description="Remaining traffic in GB")


class NodeInfo(BaseModel):
    """
    Node Information Schema

    Basic node information for user display.
    """

    id: int = Field(..., description="Node ID")
    name: str = Field(..., description="Node name")
    server: str = Field(..., description="Server address")
    server_port: int = Field(..., description="Server port")
    method: str = Field(..., description="Encryption method")
    is_online: bool = Field(..., description="Node online status")
    traffic_rate: Optional[str] = Field(None, description="Traffic rate (e.g., '1G *')")
    info: Optional[str] = Field(None, description="Node description")
    type: str = Field(..., description="Node type (ss/ssrk/v2ray/etc)")
    class_level: int = Field(..., description="Required user level", alias="class")
    node_group: int = Field(..., description="Node group ID")

    class Config:
        populate_by_name = True


class NodeListResponse(BaseModel):
    """
    Node List Response Schema
    """

    nodes: list[NodeInfo] = Field(..., description="List of available nodes")
    total: int = Field(..., description="Total number of nodes")


class UserDashboardResponse(BaseModel):
    """
    Complete User Dashboard Response

    Combines user info and traffic statistics.
    """

    user: UserInfoResponse = Field(..., description="User information")
    traffic: UserTrafficStats = Field(..., description="Traffic statistics")
