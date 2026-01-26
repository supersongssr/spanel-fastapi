"""
Node Model

This module defines the ss_node table model, maintaining 100% compatibility
with the original PHP project's database schema.

CRITICAL: Do NOT modify table names, field names, types, or defaults!
"""

from sqlalchemy import Column, Integer, String, BigInteger, Text, Float
from sqlalchemy.sql import func
from app.db.session import Base


class Node(Base):
    """
    Node Model (SS Node)

    This model represents the 'ss_node' table from the original PHP project.
    All field names, types, and constraints match the original schema exactly.

    Attributes:
        All attributes correspond to columns in the 'ss_node' table.
        Refer to the original SQL schema for detailed field descriptions.
    """

    __tablename__ = "ss_node"

    # Primary Key
    id = Column(Integer, primary_key=True, autoincrement=True, comment="Node ID")

    # Basic Information
    name = Column(String(128), nullable=False, comment="Node Name")
    type = Column(Integer, nullable=False, comment="1=Show, 0=Hide")
    server = Column(String(500), nullable=False, comment="Server Address")
    method = Column(String(64), nullable=False, comment="Encryption Method")
    info = Column(String(128), nullable=False, comment="Node Description")
    status = Column(String(128), nullable=False, comment="Node Status")

    # Protocol Type
    # 0 = SS, 1-9 = SSR, 11 = VMess, 13 = VLess, 14 = Trojan
    sort = Column(Integer, nullable=False, comment="Protocol Type")

    # Configuration
    custom_method = Column(Integer, nullable=False, default=0, comment="Custom Encryption Allowed")
    traffic_rate = Column(Float, nullable=False, default=1.0, comment="Traffic Rate Multiplier")

    # Requirements & Limits
    node_class = Column(Integer, nullable=False, default=0, comment="Required User Level")
    node_speedlimit = Column(Float, nullable=False, default=0.00, comment="Speed Limit (MB/s)")
    node_connector = Column(Integer, nullable=False, default=0, comment="Connection Limit")

    # Bandwidth Tracking
    node_bandwidth = Column(BigInteger, nullable=False, default=0, comment="Used Traffic (bytes)")
    node_bandwidth_limit = Column(
        BigInteger,
        nullable=False,
        default=0,
        comment="Bandwidth Limit (bytes)"
    )
    node_bandwidth_lastday = Column(
        BigInteger,
        nullable=False,
        default=0,
        comment="Yesterday's Traffic (bytes)"
    )
    bandwidthlimit_resetday = Column(Integer, nullable=False, default=0, comment="Reset Day (1-31)")

    # Heartbeat & Status
    node_heartbeat = Column(BigInteger, nullable=False, default=0, comment="Last Heartbeat Time")
    node_ip = Column(String(255), nullable=False, comment="Node IP (comma-separated)")

    # Group & Subscription
    node_group = Column(Integer, nullable=False, default=0, comment="Node Group")
    custom_rss = Column(Integer, nullable=False, default=0, comment="Custom RSS Supported")
    mu_only = Column(Integer, nullable=False, default=0, comment="Mu Only")

    # Cost & Performance
    node_cost = Column(Integer, nullable=False, default=5, comment="Node Cost")
    node_online = Column(Integer, nullable=False, default=1, comment="Show Online Users")
    node_oncost = Column(Float, nullable=False, default=0, comment="Cost Performance")

    # Sorting & Cloning
    node_sort = Column(Integer, nullable=False, default=0, comment="Node Fault Sort")
    is_clone = Column(Integer, nullable=False, default=0, comment="Clone Node ID (0=not cloned)")

    # Traffic Statistics (Daily)
    traffic_used = Column(BigInteger, nullable=False, default=0, comment="Traffic Used (bytes)")
    traffic_left = Column(BigInteger, nullable=False, default=0, comment="Traffic Left (bytes)")
    traffic_used_daily = Column(BigInteger, nullable=False, default=0, comment="Daily Traffic Used")
    traffic_left_daily = Column(BigInteger, nullable=False, default=0, comment="Daily Traffic Left")

    # Unlock & Location
    node_unlock = Column(String(500), nullable=False, default="", comment="IP Unlock Rules")
    country_code = Column(String(32), nullable=False, default="", comment="Country Code")

    # CDN
    cncdn = Column(Integer, nullable=True, comment="CN CDN")

    def __repr__(self):
        return f"<Node(id={self.id}, name={self.name}, sort={self.sort})>"

    @property
    def is_online(self) -> bool:
        """Check if node is online (based on heartbeat)"""
        import time
        # Node is considered online if heartbeat was within last hour
        return (time.time() - self.node_heartbeat) < 3600

    @property
    def is_bandwidth_exceeded(self) -> bool:
        """Check if node bandwidth limit is exceeded"""
        if self.node_bandwidth_limit == 0:
            return False
        return self.node_bandwidth >= self.node_bandwidth_limit

    @property
    def is_accessible(self) -> bool:
        """Check if node is accessible for users"""
        return self.type == 1 and not self.is_bandwidth_exceeded and self.is_online

    @property
    def protocol_name(self) -> str:
        """Get protocol name based on sort value"""
        protocol_map = {
            0: "Shadowsocks",
            11: "VMess",
            13: "VLess",
            14: "Trojan",
        }
        # 1-9 are SSR variants
        if 1 <= self.sort <= 9:
            return "ShadowsocksR"
        return protocol_map.get(self.sort, "Unknown")

    @property
    def bandwidth_used_percent(self) -> float:
        """Calculate bandwidth usage percentage"""
        if self.node_bandwidth_limit == 0:
            return 0.0
        return round((self.node_bandwidth / self.node_bandwidth_limit) * 100, 2)
