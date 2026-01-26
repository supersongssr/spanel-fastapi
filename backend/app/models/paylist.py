"""
Payment Models

These modules define the paylist, payback, and code table models.
"""

from sqlalchemy import Column, Integer, BigInteger, String, Text, Decimal, DateTime
from app.db.session import Base


class Paylist(Base):
    """
    Paylist Model (Payment Orders)

    Records all payment orders.
    """

    __tablename__ = "paylist"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="Order ID")
    userid = Column(BigInteger, nullable=False, comment="User ID")
    total = Column(Decimal(12, 2), nullable=False, comment="Amount")
    status = Column(Integer, nullable=False, default=0, comment="Status (0=unpaid, 1=paid)")
    tradeno = Column(Text, nullable=True, comment="Transaction Number")
    datetime = Column(BigInteger, nullable=False, default=0, comment="Order Time (timestamp)")

    def __repr__(self):
        return f"<Paylist(id={self.id}, userid={self.userid}, total={self.total}, status={self.status})>"


class Payback(Base):
    """
    Payback Model (Referral Commission)

    Records referral commission payouts.
    """

    __tablename__ = "payback"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="Payback ID")
    total = Column(Decimal(12, 2), nullable=False, comment="Purchase Amount")
    userid = Column(BigInteger, nullable=False, comment="User ID")
    ref_by = Column(BigInteger, nullable=False, comment="Referrer ID")
    ref_get = Column(Decimal(12, 2), nullable=False, comment="Commission Amount")
    datetime = Column(BigInteger, nullable=False, comment="Time (timestamp)")
    callback = Column(Integer, nullable=True, comment="Callback Status (0=no, 1=yes, 3=referrer deleted)")

    def __repr__(self):
        return f"<Payback(id={self.id}, userid={self.userid}, ref_get={self.ref_get})>"


class Code(Base):
    """
    Code Model (Redemption Codes)

    Stores redemption codes for top-up or special packages.
    """

    __tablename__ = "code"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="Code ID")
    code = Column(Text, nullable=False, comment="Code String")
    type = Column(Integer, nullable=False, comment="Type (-1=deposit, -2=withdraw, >0=traffic)")
    number = Column(Decimal(11, 2), nullable=False, comment="Amount/Traffic")
    isused = Column(Integer, nullable=False, default=0, comment="Used Status (0=no, 1=yes)")
    userid = Column(BigInteger, nullable=False, comment="User ID")
    usedatetime = Column(DateTime, nullable=False, comment="Usage Time")

    def __repr__(self):
        return f"<Code(id={self.id}, code={self.code}, type={self.type}, isused={self.isused})>"
