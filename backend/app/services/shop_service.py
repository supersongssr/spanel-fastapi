"""
Shop Service

Handles business logic for shop-related operations including:
- Package purchases
- User balance deduction
- Traffic reset
- User level and expiration updates
- Purchase history recording
"""

import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from decimal import Decimal

from app.models.user import User
from app.models.shop import Shop, Bought
from app.schemas.response import error_response


class ShopService:
    """Service for shop operations"""

    @staticmethod
    async def get_available_packages(
        db: AsyncSession
    ) -> list[Shop]:
        """
        Get all available shop packages

        Args:
            db: Database session

        Returns:
            List of available Shop objects
        """
        result = await db.execute(
            select(Shop).where(Shop.status == 1)
        )
        packages = result.scalars().all()
        return list(packages)

    @staticmethod
    def parse_shop_content(content: str) -> Dict[str, Any]:
        """
        Parse shop content JSON string

        Args:
            content: JSON string from shop.content field

        Returns:
            Parsed content dictionary

        Content format example:
        {
            "traffic": 100,        // Traffic in GB
            "class": 1,            // User level to set
            "class_expire": 30,    // Days to add to class_expire
            "expire_in": 30,       // Days to add to expire_in
            "reset_traffic": true  // Whether to reset u/d to 0
        }
        """
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {}

    @staticmethod
    async def check_user_can_purchase(
        user: User,
        shop: Shop,
        db: AsyncSession
    ) -> tuple[bool, Optional[str]]:
        """
        Check if user can purchase this package

        Args:
            user: User object
            shop: Shop/package object
            db: Database session

        Returns:
            Tuple of (can_purchase, error_message)
        """
        # Check balance
        if user.money < shop.price:
            return False, f"余额不足，当前余额: {user.money} 元，需要: {shop.price} 元"

        # Parse content for additional constraints
        content = ShopService.parse_shop_content(shop.content)

        # Check if user already has this package (optional logic)
        # Uncomment if you want to prevent duplicate purchases
        # existing_bought = await db.execute(
        #     select(Bought).where(
        #         and_(
        #             Bought.userid == user.id,
        #             Bought.shopid == shop.id
        #         )
        #     ).order_by(Bought.datetime.desc()).limit(1)
        # )
        # last_purchase = existing_bought.scalar_one_or_none()
        # if last_purchase:
        #     # Check if still valid (within 24 hours)
        #     if last_purchase.datetime > int(time.time()) - 86400:
        #         return False, "您已购买过此套餐，请勿重复购买"

        return True, None

    @staticmethod
    async def purchase_package(
        user: User,
        shop: Shop,
        db: AsyncSession
    ) -> tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """
        Process package purchase

        This is the CORE business logic for purchases.
        Everything happens in a single database transaction.

        Args:
            user: User object
            shop: Shop/package object
            db: Database session (must be in transaction)

        Returns:
            Tuple of (success, error_message, result_data)

        Transaction includes:
        1. Deduct money from user.balance
        2. Record purchase in bought table
        3. Update user.class and user.class_expire
        4. Update user.expire_in
        5. Reset traffic if required
        6. Update transfer_enable if package includes traffic
        """
        content = ShopService.parse_shop_content(shop.content)

        # Calculate new expiration dates
        now = datetime.now()

        # class_expire handling
        current_class_expire = user.class_expire if user.class_expire > now else now
        class_expire_days = content.get("class_expire", 0)
        if class_expire_days > 0:
            new_class_expire = current_class_expire + timedelta(days=class_expire_days)
        else:
            new_class_expire = current_class_expire

        # expire_in handling (account expiration)
        current_expire_in = user.expire_in if user.expire_in > now else now
        expire_in_days = content.get("expire_in", 0)
        if expire_in_days > 0:
            new_expire_in = current_expire_in + timedelta(days=expire_in_days)
        else:
            new_expire_in = current_expire_in

        # Traffic handling
        traffic_gb = content.get("traffic", 0)
        reset_traffic = content.get("reset_traffic", False)

        # Convert GB to bytes
        traffic_bytes = int(traffic_gb * 1024 ** 3)

        # Calculate new transfer_enable
        # If package includes traffic, update transfer_enable
        if traffic_bytes > 0:
            # Option 1: Add to existing traffic
            new_transfer_enable = user.transfer_enable + traffic_bytes
            # Option 2: Set to package traffic (uncomment to use)
            # new_transfer_enable = traffic_bytes
        else:
            new_transfer_enable = user.transfer_enable

        # Reset u/d if required
        if reset_traffic:
            new_u = 0
            new_d = 0
        else:
            new_u = user.u
            new_d = user.d

        # Update user level
        new_class = content.get("class", user.class_level)

        # BEGIN TRANSACTION: All updates in one atomic transaction
        try:
            # 1. Deduct money
            await db.execute(
                update(User)
                .where(User.id == user.id)
                .values(money=User.money - shop.price)
            )

            # 2. Update user package attributes
            await db.execute(
                update(User)
                .where(User.id == user.id)
                .values(
                    class_level=new_class,
                    class_expire=new_class_expire,
                    expire_in=new_expire_in,
                    transfer_enable=new_transfer_enable,
                    u=new_u,
                    d=new_d
                )
            )

            # 3. Record purchase history
            bought = Bought(
                userid=user.id,
                shopid=shop.id,
                datetime=int(now.timestamp()),
                renew=int(new_class_expire.timestamp()) if class_expire_days > 0 else 0,
                coupon="",  # Empty for now, can be extended later
                price=shop.price
            )
            db.add(bought)

            # Commit transaction
            await db.commit()

            # Prepare result data
            result = {
                "user_id": user.id,
                "shop_id": shop.id,
                "shop_name": shop.name,
                "price": float(shop.price),
                "new_balance": float(user.money) - float(shop.price),
                "new_class": new_class,
                "new_class_expire": new_class_expire.isoformat(),
                "new_expire_in": new_expire_in.isoformat(),
                "new_transfer_enable": new_transfer_enable,
                "traffic_added_gb": traffic_gb,
                "traffic_reset": reset_traffic
            }

            return True, None, result

        except Exception as e:
            await db.rollback()
            return False, f"购买失败: {str(e)}", None

    @staticmethod
    async def get_user_purchase_history(
        user_id: int,
        db: AsyncSession,
        limit: int = 20
    ) -> list[Bought]:
        """
        Get user's purchase history

        Args:
            user_id: User ID
            db: Database session
            limit: Maximum number of records

        Returns:
            List of Bought objects
        """
        result = await db.execute(
            select(Bought)
            .where(Bought.userid == user_id)
            .order_by(Bought.datetime.desc())
            .limit(limit)
        )
        purchases = result.scalars().all()
        return list(purchases)
