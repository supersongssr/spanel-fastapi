"""
User Model

This module defines the User table model, maintaining 100% compatibility
with the original PHP project's database schema.

CRITICAL: Do NOT modify table names, field names, types, or defaults!
"""

from sqlalchemy import Column, Integer, String, BigInteger, DateTime, Text, Float
from sqlalchemy.types import DECIMAL as Decimal
from sqlalchemy.sql import func
from app.db.session import Base


class User(Base):
    """
    User Model

    This model represents the 'user' table from the original PHP project.
    All field names, types, and constraints match the original schema exactly.

    Attributes:
        All attributes correspond to columns in the 'user' table.
        Refer to the original SQL schema for detailed field descriptions.
    """

    __tablename__ = "user"

    # Primary Key
    id = Column(Integer, primary_key=True, autoincrement=True, comment="User ID")

    # Basic Information
    user_name = Column(String(128), nullable=False, comment="Username")
    email = Column(String(64), nullable=False, unique=True, index=True, comment="Email")
    # Note: 'pass' is a Python keyword, so we use setattr in __init__ or access via table.c.pass
    _password_hash = Column("pass", String(64), nullable=False, comment="Password Hash")
    passwd = Column(String(16), nullable=False, comment="SS Password")
    v2ray_uuid = Column(String(64), nullable=True, comment="V2Ray UUID")

    # Traffic Statistics
    t = Column(Integer, nullable=False, default=0, comment="Last Used Time")
    u = Column(BigInteger, nullable=False, default=0, comment="Upload Traffic (bytes)")
    d = Column(BigInteger, nullable=False, default=0, comment="Download Traffic (bytes)")
    transfer_enable = Column(BigInteger, nullable=False, comment="Total Traffic Limit (bytes)")
    transfer_limit = Column(
        BigInteger,
        nullable=False,
        default=1073741824,
        comment="Daily Traffic Limit (default 1GB)"
    )
    last_day_t = Column(BigInteger, nullable=False, default=0, comment="Yesterday's Traffic")

    # Connection Settings
    port = Column(Integer, nullable=False, comment="Port Number")
    method = Column(String(64), nullable=False, default="rc4-md5", comment="Encryption Method")
    protocol = Column(String(128), nullable=True, default="origin", comment="Protocol Plugin")
    protocol_param = Column(String(128), nullable=True, comment="Protocol Parameters")
    obfs = Column(String(128), nullable=True, default="plain", comment="Obfuscation Plugin")
    obfs_param = Column(String(128), nullable=True, comment="Obfuscation Parameters")

    # Limits and Constraints
    node_speedlimit = Column(Float, nullable=False, default=0.00, comment="Speed Limit (MB/s)")
    node_connector = Column(Integer, nullable=False, default=0, comment="Connection Limit")
    switch = Column(Integer, nullable=False, default=1, comment="Switch (1=on, 0=off)")
    enable = Column(Integer, nullable=False, default=1, comment="Account Enabled (1=yes, 0=no)")
    type = Column(Integer, nullable=False, default=1, comment="User Type")
    is_admin = Column(Integer, nullable=False, default=0, comment="Is Admin (1=yes, 0=no)")
    is_multi_user = Column(Integer, nullable=False, default=0, comment="Is Multi-User")

    # Financial
    money = Column(Decimal(12, 2), nullable=False, default=0, comment="Balance")

    # Referral System
    ref_by = Column(Integer, nullable=False, default=0, comment="Referrer User ID")
    score = Column(Integer, nullable=False, default=0, comment="User Score")

    # User Level & Expiration
    class_level = Column("class", Integer, nullable=False, default=0, comment="User Level")
    class_expire = Column(
        DateTime,
        nullable=False,
        default="1989-06-04 00:05:00",
        comment="Level Expiration Time"
    )
    expire_in = Column(
        DateTime,
        nullable=False,
        default="2099-06-04 00:05:00",
        comment="Account Expiration Time"
    )

    # Node Group & Subscription
    node_group = Column(Integer, nullable=False, default=0, comment="Node Group")
    is_hide = Column(Integer, nullable=False, default=0, comment="Is Hidden")
    telegram_id = Column(BigInteger, nullable=True, comment="Telegram ID")
    ban_times = Column(Integer, nullable=False, default=0, comment="Ban Count")
    sub_limit = Column(Integer, nullable=False, default=16, comment="Subscription Node Limit")

    # Subscription Tracking
    rss_ip = Column(String(64), nullable=True, comment="Subscription Source IP")
    cncdn = Column(String(64), nullable=False, default="0", comment="CN CDN")
    cncdn_count = Column(String(64), nullable=False, default="0", comment="CN Count")
    cfcdn = Column(String(64), nullable=False, default="0", comment="Cloudflare CDN")
    cfcdn_count = Column(String(64), nullable=False, default="0", comment="CF Count")
    rss_count = Column(Integer, nullable=False, default=0, comment="Subscription Count")
    rss_count_lastday = Column(Integer, nullable=False, default=0, comment="Yesterday Sub Count")
    rss_ips_count = Column(Integer, nullable=False, default=0, comment="Subscription IP Count")
    rss_ips_lastday = Column(Integer, nullable=False, default=0, comment="Yesterday IP Count")
    warming = Column(Text, nullable=True, comment="Warning Message")

    # Contact Information
    im_type = Column(Integer, nullable=True, default=1, comment="Contact Type (1=WeChat, 2=QQ, 3=Google+, 4=Telegram)")
    im_value = Column(Text, nullable=True, comment="Contact Value")

    # Activity Tracking
    last_check_in_time = Column(Integer, nullable=False, default=0, comment="Last Check-in Time")
    last_get_gift_time = Column(Integer, nullable=False, default=0, comment="Last Gift Time")
    last_rest_pass_time = Column(Integer, nullable=False, default=0, comment="Last Password Reset Time")
    send_daily_mail = Column(Integer, nullable=False, default=0, comment="Send Daily Mail")

    # Auto Reset
    auto_reset_day = Column(Integer, nullable=False, default=0, comment="Traffic Reset Day")
    auto_reset_bandwidth = Column(Decimal(12, 2), nullable=False, default=0.00, comment="Traffic Reset Value")
    renew = Column(Float, nullable=False, default=0, comment="Traffic Accumulator")
    renew_time = Column(Integer, nullable=False, default=0, comment="Next Reset Time")

    # Forbidden Rules
    forbidden_ip = Column(Text, nullable=True, comment="Forbidden IPs")
    forbidden_port = Column(Text, nullable=True, comment="Forbidden Ports")
    disconnect_ip = Column(Text, nullable=True, comment="Disconnect IPs")

    # 2FA
    ga_token = Column(Text, nullable=True, comment="Google Authenticator Token")
    ga_enable = Column(Integer, nullable=False, default=0, comment="GA Enabled")

    # PAC & Theme
    pac = Column(Text, nullable=True, comment="PAC Script")
    theme = Column(Text, nullable=True, comment="Theme")

    # Other
    remark = Column(Text, nullable=True, comment="Remark")
    reg_date = Column(DateTime, nullable=False, comment="Registration Date")
    reg_ip = Column(String(128), nullable=False, default="127.0.0.1", comment="Registration IP")
    invite_num = Column(Integer, nullable=False, comment="Invite Code Count")
    expire_time = Column(Integer, nullable=False, default=0, comment="Expire Time")
    is_email_verify = Column(Integer, nullable=False, default=0, comment="Email Verified")
    plan = Column(String(2), nullable=False, default="A", comment="Plan")
    is_edu = Column(String(64), nullable=False, default="0", comment="Is EDU User")
    upswd = Column(String(64), nullable=False, default="0", comment="User Password")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, user_name={self.user_name})>"

    @property
    def password_hash(self) -> str:
        """Access the password hash field (avoiding Python keyword 'pass')"""
        return self._password_hash

    @property
    def is_enabled(self) -> bool:
        """Check if user account is enabled"""
        return self.enable == 1

    @property
    def is_admin_user(self) -> bool:
        """Check if user is admin"""
        return self.is_admin == 1

    @property
    def total_traffic_used(self) -> int:
        """Calculate total traffic used (upload + download)"""
        return self.u + self.d

    @property
    def traffic_remaining(self) -> int:
        """Calculate remaining traffic"""
        return self.transfer_enable - self.u - self.d

    @property
    def traffic_used_percent(self) -> float:
        """Calculate traffic usage percentage"""
        if self.transfer_enable == 0:
            return 0.0
        return round((self.total_traffic_used / self.transfer_enable) * 100, 2)

    @property
    def is_expired(self) -> bool:
        """Check if account is expired"""
        from datetime import datetime
        return self.expire_in < datetime.now()

    @property
    def class_is_expired(self) -> bool:
        """Check if user level is expired"""
        from datetime import datetime
        return self.class_expire < datetime.now()
