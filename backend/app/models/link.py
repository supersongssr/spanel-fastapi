"""
Link Model

This module defines the link table model for subscription links.
"""

from sqlalchemy import Column, Integer, BigInteger, String, Text
from app.db.session import Base


class Link(Base):
    """
    Link Model (Subscription Links)

    Stores user subscription tokens and configurations.
    """

    __tablename__ = "link"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="Link ID")
    type = Column(Integer, nullable=False, comment="Link Type")
    address = Column(Text, nullable=False, comment="Server Address")
    port = Column(Integer, nullable=False, comment="Port")
    token = Column(Text, nullable=False, comment="Subscription Token")
    ios = Column(Integer, nullable=False, default=0, comment="iOS Configuration")
    userid = Column(BigInteger, nullable=False, comment="User ID")
    isp = Column(Text, nullable=True, comment="ISP")
    geo = Column(Integer, nullable=True, comment="Geography")
    method = Column(Text, nullable=True, comment="Encryption Method")

    def __repr__(self):
        return f"<Link(id={self.id}, userid={self.userid}, token={self.token})>"
