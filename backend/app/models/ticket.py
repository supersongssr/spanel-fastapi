"""
Ticket Model

This module defines the ticket table model for support tickets.
"""

from sqlalchemy import Column, Integer, BigInteger, Text, DateTime
from app.db.session import Base


class Ticket(Base):
    """
    Ticket Model (Support Tickets)

    User support tickets and admin replies.
    """

    __tablename__ = "ticket"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="Ticket ID")
    title = Column(Text, nullable=False, comment="Ticket Title")
    content = Column(Text, nullable=False, comment="Ticket Content")
    rootid = Column(BigInteger, nullable=False, comment="Root Ticket ID (0=main ticket)")
    userid = Column(BigInteger, nullable=False, comment="User ID")
    datetime = Column(BigInteger, nullable=False, comment="Creation Time (timestamp)")
    status = Column(Integer, nullable=False, default=1, comment="Status (1=open, 2=replied, 3=closed)")
    sort = Column(Integer, nullable=False, default=0, comment="User Level Sort")

    def __repr__(self):
        return f"<Ticket(id={self.id}, title={self.title}, status={self.status})>"
