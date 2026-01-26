"""
Shop and Bought Models

These modules define the shop and bought table models.
"""

from sqlalchemy import Column, Integer, BigInteger, String, Text, Decimal, DateTime
from app.db.session import Base


class Shop(Base):
    """
    Shop Model

    Represents available packages/plans for users to purchase.
    """

    __tablename__ = "shop"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="Shop ID")
    name = Column(Text, nullable=False, comment="Shop Name")
    price = Column(Decimal(12, 2), nullable=False, comment="Price")
    content = Column(Text, nullable=False, comment="Shop Content (JSON)")
    auto_renew = Column(Integer, nullable=False, comment="Auto Renew")
    auto_reset_bandwidth = Column(Integer, nullable=False, default=0, comment="Reset Bandwidth")
    status = Column(Integer, nullable=False, default=1, comment="Status (1=active, 0=inactive)")

    def __repr__(self):
        return f"<Shop(id={self.id}, name={self.name}, price={self.price})>"


class Bought(Base):
    """
    Bought Model

    Records user purchase history.
    """

    __tablename__ = "bought"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="Purchase ID")
    userid = Column(BigInteger, nullable=False, comment="User ID")
    shopid = Column(BigInteger, nullable=False, comment="Shop ID")
    datetime = Column(BigInteger, nullable=False, comment="Purchase Time (timestamp)")
    renew = Column(BigInteger, nullable=False, comment="Renew Time")
    coupon = Column(Text, nullable=False, comment="Coupon Code")
    price = Column(Decimal(12, 2), nullable=False, comment="Purchase Price")

    def __repr__(self):
        return f"<Bought(id={self.id}, userid={self.userid}, shopid={self.shopid})>"
