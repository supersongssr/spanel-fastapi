"""
User Shop Endpoints

This module handles shop-related operations including:
- Viewing available packages
- Purchasing packages
- Viewing purchase history
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.shop import Shop, Bought
from app.services.shop_service import ShopService
from app.schemas.response import success_response, error_response
from pydantic import BaseModel, Field


router = APIRouter()


# Request/Response Schemas
class ShopItemResponse(BaseModel):
    """Shop item response"""
    id: int
    name: str
    price: float
    content: str  # JSON string with traffic, class, etc.
    auto_renew: int
    auto_reset_bandwidth: int
    status: int


class PurchaseRequest(BaseModel):
    """Purchase request"""
    shop_id: int = Field(..., description="Package ID to purchase")


class BoughtItemResponse(BaseModel):
    """Purchase history item response"""
    id: int
    shopid: int
    datetime: int
    renew: int
    price: float
    coupon: str


@router.get("/shop")
async def get_shop_packages(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    GET /app/api/v0/user/shop - Get Available Packages

    Returns list of available packages in the shop.

    Response:
    {
        "ret": 1,
        "msg": "ok",
        "data": {
            "packages": [
                {
                    "id": 1,
                    "name": "月度套餐 100GB",
                    "price": 19.99,
                    "content": "{\"traffic\": 100, \"class\": 1, \"class_expire\": 30}",
                    ...
                }
            ]
        }
    }
    """
    packages = await ShopService.get_available_packages(db)

    package_list = []
    for pkg in packages:
        package_list.append({
            "id": pkg.id,
            "name": pkg.name,
            "price": float(pkg.price),
            "content": pkg.content,
            "auto_renew": pkg.auto_renew,
            "auto_reset_bandwidth": pkg.auto_reset_bandwidth,
            "status": pkg.status
        })

    return success_response(
        msg="ok",
        data={
            "packages": package_list,
            "count": len(package_list)
        }
    )


@router.post("/buy")
async def purchase_package(
    request: PurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    POST /app/api/v0/user/buy - Purchase Package

    Processes package purchase including:
    - Balance deduction
    - User level and expiration updates
    - Traffic reset/update
    - Purchase history recording

    All operations are wrapped in a single database transaction.

    Request Body:
    {
        "shop_id": 1
    }

    Response:
    {
        "ret": 1,
        "msg": "购买成功",
        "data": {
            "shop_name": "月度套餐 100GB",
            "price": 19.99,
            "new_balance": 80.01,
            "new_class": 1,
            "new_class_expire": "2025-02-26T12:00:00",
            ...
        }
    }

    Error Cases:
        - 400: Package not found
        - 400: Insufficient balance
        - 500: Transaction failure
    """
    shop_id = request.shop_id

    # Get package
    result = await db.execute(select(Shop).where(Shop.id == shop_id))
    shop = result.scalar_one_or_none()

    if not shop:
        return error_response(msg="套餐不存在")

    if shop.status != 1:
        return error_response(msg="该套餐已下架")

    # Check if user can purchase
    can_purchase, error_msg = await ShopService.check_user_can_purchase(
        current_user, shop, db
    )

    if not can_purchase:
        return error_response(msg=error_msg)

    # Process purchase in transaction
    async with db.begin():
        success, error_msg, result_data = await ShopService.purchase_package(
            current_user, shop, db
        )

        if not success:
            return error_response(msg=error_msg)

    # Refresh user from database to get updated values
    await db.refresh(current_user)

    return success_response(
        msg="购买成功",
        data=result_data
    )


@router.get("/bought")
async def get_purchase_history(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    GET /app/api/v0/user/bought - Get Purchase History

    Returns user's purchase history.

    Query Parameters:
        limit: Maximum number of records (default: 20)

    Response:
    {
        "ret": 1,
        "msg": "ok",
        "data": {
            "history": [
                {
                    "id": 123,
                    "shopid": 1,
                    "datetime": 1737888000,
                    "renew": 1737974400,
                    "price": 19.99,
                    "coupon": ""
                }
            ],
            "count": 1
        }
    }
    """
    if limit > 100:
        limit = 100  # Cap at 100

    purchases = await ShopService.get_user_purchase_history(
        current_user.id, db, limit
    )

    history_list = []
    for purchase in purchases:
        history_list.append({
            "id": purchase.id,
            "shopid": purchase.shopid,
            "datetime": purchase.datetime,
            "renew": purchase.renew,
            "price": float(purchase.price),
            "coupon": purchase.coupon
        })

    return success_response(
        msg="ok",
        data={
            "history": history_list,
            "count": len(history_list)
        }
    )
