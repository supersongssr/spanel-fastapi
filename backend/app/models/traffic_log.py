"""
Traffic Log Model

This module defines the user_traffic_log table model.
"""

from sqlalchemy import Column, Integer, BigInteger, Float, String, DateTime
from app.db.session import Base


class TrafficLog(Base):
    """
    Traffic Log Model

    Records traffic usage for each user on each node.
    """

    __tablename__ = "user_traffic_log"

    id = Column(Integer, primary_key=True, autoincrement=True, comment="Log ID")
    user_id = Column(Integer, nullable=False, index=True, comment="User ID")
    u = Column(BigInteger, nullable=False, comment="Upload Traffic (bytes)")
    d = Column(BigInteger, nullable=False, comment="Download Traffic (bytes)")
    node_id = Column(Integer, nullable=False, index=True, comment="Node ID")
    rate = Column(Float, nullable=False, comment="Traffic Rate Multiplier")
    traffic = Column(String(32), nullable=False, comment="Traffic Total (formatted)")
    log_time = Column(Integer, nullable=False, comment="Log Time (timestamp)")

    def __repr__(self):
        return f"<TrafficLog(id={self.id}, user_id={self.user_id}, node_id={self.node_id})>"
