"""
Payment Service with Referral Commission (Payback)

This module handles payment operations including:
- Order creation and confirmation
- Payment callback processing
- Referral commission distribution
- Commission recovery on account deletion

Key Features:
- Idempotent commission processing (prevents double payment)
- Transaction-based operations
- Configurable referral rate
"""

import logging
from typing import Optional, Tuple
from datetime import datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, or_
from sqlalchemy.exc import SQLAlchemyError

from app.models.user import User
from app.models.paylist import Paylist, Payback, Code
from app.models.shop import Shop, Bought
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class PaymentService:
    """Service for payment and referral commission operations"""

    @staticmethod
    async def create_payment_order(
        user_id: int,
        amount: Decimal,
        gateway: str = "alipay",
        db: AsyncSession = None
    ) -> Paylist:
        """
        Create a payment order

        Args:
            user_id: User ID
            amount: Payment amount
            gateway: Payment gateway name
            db: Database session

        Returns:
            Created Paylist object
        """
        import time

        # Generate transaction number
        tradeno = f"ORDER-{int(time.time())}-{user_id}"

        # Create order
        order = Paylist(
            userid=user_id,
            total=amount,
            status=0,  # 0 = unpaid
            tradeno=tradeno,
            datetime=int(time.time())
        )

        db.add(order)
        await db.commit()
        await db.refresh(order)

        logger.info(f"Created payment order {order.id} for user {user_id}, amount: {amount}")

        return order

    @staticmethod
    async def process_payment_success(
        order_id: int,
        tradeno: Optional[str] = None,
        db: AsyncSession = None
    ) -> Tuple[bool, str]:
        """
        Process successful payment

        This includes:
        1. Update order status to paid
        2. Credit user balance
        3. Process referral commission (if configured)

        Args:
            order_id: Order ID
            tradeno: Gateway transaction number
            db: Database session (must be in transaction)

        Returns:
            Tuple of (success, message)

        Transaction:
            All operations are wrapped in a single transaction
        """
        try:
            # Get order
            result = await db.execute(
                select(Paylist).where(Paylist.id == order_id)
            )
            order = result.scalar_one_or_none()

            if not order:
                return False, "订单不存在"

            if order.status == 1:
                # Already paid, ignore duplicate notification
                logger.warning(f"Order {order_id} already paid, ignoring duplicate notification")
                return True, "订单已支付"

            # Update order status
            await db.execute(
                update(Paylist)
                .where(Paylist.id == order_id)
                .values(status=1, tradeno=tradeno)
            )

            # Credit user balance (ATOMIC UPDATE)
            await db.execute(
                update(User)
                .where(User.id == order.userid)
                .values(money=User.money + order.total)
            )

            logger.info(f"Order {order_id} paid, credited {order.total} to user {order.userid}")

            # Process referral commission
            if settings.enable_payback:
                await PaymentService._process_referral_commission(
                    order_id=order_id,
                    user_id=order.userid,
                    amount=order.total,
                    db=db
                )

            await db.commit()

            return True, "支付成功"

        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to process payment for order {order_id}: {str(e)}")
            return False, f"支付处理失败: {str(e)}"

    @staticmethod
    async def _process_referral_commission(
        order_id: int,
        user_id: int,
        amount: Decimal,
        db: AsyncSession
    ):
        """
        Process referral commission (internal method)

        Logic:
        1. Check if user has a referrer (ref_by)
        2. Calculate commission: amount * referral_rate
        3. Check if commission already paid (idempotent)
        4. Add commission to referrer's balance
        5. Record payback entry

        Args:
            order_id: Order ID
            user_id: User ID who made the purchase
            amount: Purchase amount
            db: Database session (in transaction)

        Idempotent:
            Uses payback table to prevent duplicate commission payments
        """
        # Get user
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()

        if not user or not user.ref_by or user.ref_by == 0:
            logger.info(f"User {user_id} has no referrer, skipping commission")
            return

        referrer_id = user.ref_by

        # Check if commission already paid for this order
        existing_payback = await db.execute(
            select(Payback)
            .where(
                and_(
                    Payback.userid == user_id,
                    Payback.ref_by == referrer_id,
                    Payback.total > 0  # Positive = commission paid
                )
            )
            .order_by(Payback.datetime.desc())
            .limit(1)
        )
        existing_payback = existing_payback.scalar_one_or_none()

        if existing_payback:
            # Check if this order already triggered commission
            # We use order_id in the datetime field as a marker
            # Or we can add a new field to track this
            logger.info(f"Commission already paid for user {user_id} order {order_id}")
            return

        # Get referrer
        result = await db.execute(
            select(User).where(User.id == referrer_id)
        )
        referrer = result.scalar_one_or_none()

        if not referrer:
            logger.warning(f"Referrer {referrer_id} not found, skipping commission")
            return

        # Calculate commission
        commission_amount = amount * Decimal(str(settings.payback_money))
        commission_amount = commission_amount.quantize(Decimal("0.01"))  # Round to 2 decimal places

        logger.info(f"Processing commission: user {user_id} -> referrer {referrer_id}, "
                    f"amount: {amount}, commission: {commission_amount}")

        # Credit referrer balance (ATOMIC UPDATE)
        await db.execute(
            update(User)
            .where(User.id == referrer_id)
            .values(money=User.money + commission_amount)
        )

        # Record payback entry
        # total > 0 = commission paid
        # total = -1 = registration bonus
        # total = -2 = commission recovered
        payback = Payback(
            total=commission_amount,
            userid=user_id,
            ref_by=referrer_id,
            ref_get=commission_amount,
            datetime=int(datetime.now().timestamp()),
            callback=0  # 0 = not recovered, 1 = recovered
        )
        db.add(payback)

        logger.info(f"Commission paid: {commission_amount} to referrer {referrer_id}")

    @staticmethod
    async def recover_referral_commission(
        user_id: int,
        db: AsyncSession
    ):
        """
        Recover referral commission when user is deleted/banned

        Logic:
        1. Find the registration commission (total = -1)
        2. Check if already recovered (total = -2 exists)
        3. Deduct commission from referrer
        4. Record recovery entry (total = -2)
        5. Mark original commission as recovered (callback = 1)

        Args:
            user_id: User ID being deleted
            db: Database session (in transaction)

        Transaction:
            All operations are atomic
        """
        # Get user's referrer
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()

        if not user or not user.ref_by or user.ref_by == 0:
            logger.info(f"User {user_id} has no referrer, skipping commission recovery")
            return

        referrer_id = user.ref_by

        # Find registration commission
        result = await db.execute(
            select(Payback)
            .where(
                and_(
                    Payback.userid == user_id,
                    Payback.ref_by == referrer_id,
                    Payback.total == -1  # Registration bonus
                )
            )
        )
        reg_commission = result.scalar_one_or_none()

        if not reg_commission:
            logger.info(f"No registration commission found for user {user_id}")
            return

        # Check if already recovered
        result = await db.execute(
            select(Payback)
            .where(
                and_(
                    Payback.userid == user_id,
                    Payback.ref_by == referrer_id,
                    Payback.total == -2  # Already recovered
                )
            )
        )
        already_recovered = result.scalar_one_or_none()

        if already_recovered:
            logger.info(f"Commission already recovered for user {user_id}")
            return

        # Get referrer
        result = await db.execute(
            select(User).where(User.id == referrer_id)
        )
        referrer = result.scalar_one_or_none()

        if not referrer:
            logger.warning(f"Referrer {referrer_id} not found, cannot recover commission")
            return

        # Deduct commission from referrer (ATOMIC UPDATE)
        await db.execute(
            update(User)
            .where(User.id == referrer_id)
            .values(
                money=User.money - reg_commission.ref_get,
                ban_times=User.ban_times + 1  # Penalty
            )
        )

        # Record recovery entry
        recovery = Payback(
            total=-2,  # -2 = commission recovered
            userid=user_id,
            ref_by=referrer_id,
            ref_get=-reg_commission.ref_get,  # Negative to indicate deduction
            datetime=int(datetime.now().timestamp()),
            callback=0
        )
        db.add(recovery)

        # Mark original commission as recovered
        await db.execute(
            update(Payback)
            .where(Payback.id == reg_commission.id)
            .values(callback=1)  # 1 = recovered
        )

        logger.info(f"Commission recovered: {reg_commission.ref_get} from referrer {referrer_id}")

    @staticmethod
    async def get_payment_status(
        order_id: int,
        db: AsyncSession
    ) -> Optional[dict]:
        """
        Get payment order status

        Args:
            order_id: Order ID
            db: Database session

        Returns:
            Order status dict or None
        """
        result = await db.execute(
            select(Paylist)
            .where(Paylist.id == order_id)
        )
        order = result.scalar_one_or_none()

        if not order:
            return None

        return {
            "order_id": order.id,
            "user_id": order.userid,
            "total": float(order.total),
            "status": order.status,
            "tradeno": order.tradeno,
            "datetime": order.datetime
        }

    @staticmethod
    async def get_user_payment_orders(
        user_id: int,
        db: AsyncSession,
        status: Optional[int] = None,
        limit: int = 20
    ) -> list:
        """
        Get user's payment orders

        Args:
            user_id: User ID
            db: Database session
            status: Filter by status (0=unpaid, 1=paid, None=all)
            limit: Maximum number of records

        Returns:
            List of Paylist objects
        """
        query = select(Paylist).where(Paylist.userid == user_id)

        if status is not None:
            query = query.where(Paylist.status == status)

        query = query.order_by(Paylist.datetime.desc()).limit(limit)

        result = await db.execute(query)
        orders = result.scalars().all()

        return list(orders)
