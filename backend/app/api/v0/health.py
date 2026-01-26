"""
Health Check API

This module provides health check endpoints to verify database and Redis connections.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db.session import get_db
from app.db.redis import RedisClient, get_redis
from app.schemas.response import ResponseModel, HealthCheckResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=ResponseModel[HealthCheckResponse],
    summary="Health Check",
    description="Check database and Redis connections"
)
async def health_check(
    db: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis)
):
    """
    Health Check Endpoint

    Tests connections to:
    - MySQL Database
    - Redis

    Returns:
        ResponseModel with connection statuses

    Example:
        GET /app/api/v0/health

        Response:
        {
            "ret": 1,
            "msg": "ok",
            "data": {
                "database": "connected",
                "redis": "connected",
                "version": "1.0.0"
            }
        }
    """
    # Check database connection
    db_status = "disconnected"
    try:
        # Execute a simple query to test connection
        result = await db.execute(text("SELECT 1"))
        db_status = "connected" if result else "error"
    except Exception as e:
        db_status = f"error: {str(e)}"

    # Check Redis connection
    redis_status = "disconnected"
    try:
        # Ping Redis
        await redis.redis.ping()
        redis_status = "connected"
    except Exception as e:
        redis_status = f"error: {str(e)}"

    # Prepare response data
    health_data = HealthCheckResponse(
        database=db_status,
        redis=redis_status,
        version="1.0.0"  # TODO: Get from config
    )

    return ResponseModel(
        ret=1,
        msg="ok",
        data=health_data
    )


@router.get(
    "/ping",
    response_model=ResponseModel[dict],
    summary="Ping",
    description="Simple ping endpoint"
)
async def ping():
    """
    Simple Ping Endpoint

    Returns:
        ResponseModel with pong message

    Example:
        GET /app/api/v0/ping

        Response:
        {
            "ret": 1,
            "msg": "pong",
            "data": null
        }
    """
    return ResponseModel(
        ret=1,
        msg="pong",
        data=None
    )
