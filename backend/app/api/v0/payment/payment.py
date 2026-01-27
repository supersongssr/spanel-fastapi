"""
Payment Endpoints

This module handles payment operations including:
- Creating recharge orders
- Payment gateway callbacks (webhooks)
- Debug mode manual confirmation
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime
from decimal import Decimal

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.paylist import Paylist
from app.schemas.response import success_response, error_response
from pydantic import BaseModel, Field

router = APIRouter()


# Request/Response Schemas
class CreatePaymentRequest(BaseModel):
    """Create payment request"""
    total: float = Field(..., gt=0, description="Recharge amount")
    gateway: Optional[str] = Field("alipay", description="Payment gateway")


class PaymentOrderResponse(BaseModel):
    """Payment order response"""
    id: int
    total: float
    status: int
    tradeno: Optional[str]
    datetime: int


@router.post("/create")
async def create_payment_order(
    request: CreatePaymentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    POST /app/api/v0/payment/create - Create Payment Order

    Creates a recharge order for the user.

    Request Body:
    {
        "total": 100.00,          // Recharge amount
        "gateway": "alipay"       // Payment gateway (optional)
    }

    Response:
    {
        "ret": 1,
        "msg": "订单创建成功",
        "data": {
            "order_id": 123,
            "total": 100.00,
            "status": 0,           // 0=unpaid, 1=paid
            "tradeno": "...",
            "datetime": 1737888000,
            "payment_url": "..."   // Payment URL for user to complete payment
        }
    }

    Note:
        - status is always 0 (unpaid) when created
        - tradeno is generated for tracking
        - payment_url is returned if gateway provides one
    """
    recharge_amount = Decimal(str(request.total))

    # Check amount validity
    if recharge_amount <= 0:
        return error_response(msg="充值金额必须大于0")

    # Generate transaction number
    tradeno = f"ORDER-{int(datetime.now().timestamp())}-{current_user.id}"

    # Create order
    order = Paylist(
        userid=current_user.id,
        total=recharge_amount,
        status=0,  # 0 = unpaid
        tradeno=tradeno,
        datetime=int(datetime.now().timestamp())
    )

    db.add(order)
    await db.commit()
    await db.refresh(order)

    # Generate payment URL based on gateway
    # For now, return a placeholder
    payment_url = f"/app/api/v0/payment/checkout/{order.id}"

    return success_response(
        msg="订单创建成功",
        data={
            "order_id": order.id,
            "total": float(order.total),
            "status": order.status,
            "tradeno": order.tradeno,
            "datetime": order.datetime,
            "payment_url": payment_url
        }
    )


@router.post("/notify/{gateway}")
async def payment_notify(
    gateway: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    POST /app/api/v0/payment/notify/{gateway} - Payment Callback (Webhook)

    Receives payment status notifications from payment gateways.

    Path Parameters:
        gateway: Payment gateway name (alipay, wechat, etc.)

    Request Body:
        Varies by gateway, typically includes:
        - order_id: Order ID
        - trade_no: Gateway transaction number
        - status: Payment status
        - signature: Verification signature

    Response:
        Returns "success" or "fail" as required by most gateways

    Note:
        This is a SKELETON implementation.
        Real implementation MUST verify:
        1. Request signature
        2. Order exists
        3. Amount matches
        4. Process refund if duplicate

    Supported gateways:
        - alipay: Alipay (支付宝)
        - wechat: WeChat Pay (微信支付)
        - yft: Yft Payment
        - chenPay: ChenPay
        - paypal: PayPal
    """
    # Get raw request body for signature verification
    raw_body = await request.body()

    # Log incoming callback (in production, use proper logging)
    print(f"Payment callback from {gateway}")
    print(f"Raw body: {raw_body.decode()}")

    # Parse callback data based on gateway
    # Each gateway has different format
    if gateway == "alipay":
        return await _handle_alipay_notify(raw_body, db)
    elif gateway == "wechat":
        return await _handle_wechat_notify(raw_body, db)
    elif gateway in ["yft", "chenPay", "paypal"]:
        return await _handle_generic_notify(gateway, raw_body, db)
    else:
        return error_response(msg="不支持的支付网关")


async def _handle_alipay_notify(raw_body: bytes, db: AsyncSession):
    """
    Handle Alipay notification

    Reference: https://opendocs.alipay.com/open/204/105301
    """
    # TODO: Implement Alipay signature verification
    # TODO: Parse notification parameters
    # TODO: Extract order_id and trade_no
    # TODO: Verify payment status
    # TODO: Update order status
    # TODO: Credit user balance

    # For now, return success to avoid gateway retries
    return {"ret": 1, "msg": "success"}


async def _handle_wechat_notify(raw_body: bytes, db: AsyncSession):
    """
    Handle WeChat Pay notification

    Reference: https://pay.weixin.qq.com/wiki/doc/api/index.html
    """
    # TODO: Implement WeChat Pay signature verification
    # TODO: Parse XML notification
    # TODO: Extract order_id and transaction_id
    # TODO: Verify payment status
    # TODO: Update order status
    # TODO: Credit user balance

    return {"ret": 1, "msg": "success"}


async def _handle_generic_notify(gateway: str, raw_body: bytes, db: AsyncSession):
    """
    Handle generic payment gateway notification

    For gateways like Yft, ChenPay, PayPal
    """
    # TODO: Implement gateway-specific verification
    # TODO: Parse notification
    # TODO: Verify and process payment

    return {"ret": 1, "msg": "success"}


async def process_payment_success(
    order_id: int,
    tradeno: str,
    db: AsyncSession
):
    """
    Process successful payment

    This is the CORE logic for payment completion:
    1. Update order status to paid
    2. Credit user balance
    3. Handle referral commission (if configured)

    Args:
        order_id: Order ID
        tradeno: Gateway transaction number
        db: Database session (must be in transaction)
    """
    # Get order
    result = await db.execute(select(Paylist).where(Paylist.id == order_id))
    order = result.scalar_one_or_none()

    if not order:
        raise ValueError("订单不存在")

    if order.status == 1:
        # Already paid, ignore duplicate notification
        return

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

    # TODO: Handle referral commission (payback table)
    # TODO: Send notification email

    await db.commit()


@router.post("/debug/confirm")
async def debug_confirm_payment(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    POST /app/api/v0/payment/debug/confirm - DEBUG MODE: Confirm Payment

    DEBUG ONLY endpoint to manually mark an order as paid.
    This bypasses payment gateway verification.

    WARNING: DISABLE THIS IN PRODUCTION!

    Request Body:
    {
        "order_id": 123
    }

    Response:
    {
        "ret": 1,
        "msg": "充值成功",
        "data": {
            "order_id": 123,
            "amount": 100.00,
            "new_balance": 150.00
        }
    }
    """
    from app.core.config import get_settings
    settings = get_settings()

    if not settings.debug:
        return error_response(msg="调试模式已关闭，无法使用此接口")

    # Get order
    result = await db.execute(
        select(Paylist).where(
            Paylist.id == order_id,
            Paylist.userid == current_user.id
        )
    )
    order = result.scalar_one_or_none()

    if not order:
        return error_response(msg="订单不存在")

    if order.status == 1:
        return error_response(msg="订单已支付，请勿重复操作")

    # Process payment
    async with db.begin():
        await process_payment_success(
            order.id,
            f"DEBUG-{int(datetime.now().timestamp())}",
            db
        )

    # Refresh user to get new balance
    await db.refresh(current_user)

    return success_response(
        msg="充值成功 (DEBUG模式)",
        data={
            "order_id": order.id,
            "amount": float(order.total),
            "new_balance": float(current_user.money)
        }
    )


@router.get("/orders")
async def get_payment_orders(
    status: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    GET /app/api/v0/payment/orders - Get User's Payment Orders

    Returns user's payment order history.

    Query Parameters:
        status: Filter by status (0=unpaid, 1=paid, None=all)

    Response:
    {
        "ret": 1,
        "msg": "ok",
        "data": {
            "orders": [
                {
                    "id": 123,
                    "total": 100.00,
                    "status": 1,
                    "tradeno": "...",
                    "datetime": 1737888000
                }
            ],
            "count": 1
        }
    }
    """
    query = select(Paylist).where(Paylist.userid == current_user.id)

    if status is not None:
        query = query.where(Paylist.status == status)

    query = query.order_by(Paylist.datetime.desc()).limit(50)

    result = await db.execute(query)
    orders = result.scalars().all()

    order_list = []
    for order in orders:
        order_list.append({
            "id": order.id,
            "total": float(order.total),
            "status": order.status,
            "tradeno": order.tradeno,
            "datetime": order.datetime
        })

    return success_response(
        msg="ok",
        data={
            "orders": order_list,
            "count": len(order_list)
        }
    )


@router.get("/status/{order_id}")
async def get_payment_status(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    GET /app/api/v0/payment/status/{order_id} - Check Payment Status

    Check if a payment order has been paid.

    Path Parameters:
        order_id: Order ID

    Response:
    {
        "ret": 1,
        "msg": "ok",
        "data": {
            "order_id": 123,
            "status": 1,           // 0=unpaid, 1=paid
            "total": 100.00,
            "tradeno": "..."
        }
    }
    """
    result = await db.execute(
        select(Paylist).where(
            Paylist.id == order_id,
            Paylist.userid == current_user.id
        )
    )
    order = result.scalar_one_or_none()

    if not order:
        return error_response(msg="订单不存在")

    return success_response(
        msg="ok",
        data={
            "order_id": order.id,
            "status": order.status,
            "total": float(order.total),
            "tradeno": order.tradeno
        }
    )
