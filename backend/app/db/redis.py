"""
Redis Connection Management

This module handles Redis connection and common operations,
providing async support using redis-py.
"""

import json
import redis.asyncio as aioredis
from typing import Optional, Any
from app.core.config import get_settings

settings = get_settings()


class RedisClient:
    """
    Async Redis client wrapper

    This class provides a high-level interface for Redis operations,
    supporting common data types and operations.
    """

    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None

    async def connect(self):
        """Establish Redis connection"""
        self.redis = await aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=settings.redis_decode_responses,
            max_connections=50,
        )
        try:
            await self.redis.ping()
            print("✅ Redis connection successful!")
        except Exception as e:
            print(f"❌ Redis connection failed: {e}")
            raise

    async def close(self):
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()
            print("✅ Redis connection closed!")

    async def get(self, key: str) -> Optional[str]:
        """Get value from Redis"""
        if not self.redis:
            return None
        return await self.redis.get(key)

    async def set(
        self,
        key: str,
        value: str,
        ex: Optional[int] = None,
    ) -> bool:
        """
        Set value in Redis

        Args:
            key: Redis key
            value: Value to store
            ex: Expiration time in seconds
        """
        if not self.redis:
            return False
        return await self.redis.set(key, value, ex=ex)

    async def delete(self, key: str) -> int:
        """Delete key from Redis"""
        if not self.redis:
            return 0
        return await self.redis.delete(key)

    async def exists(self, key: str) -> bool:
        """Check if key exists in Redis"""
        if not self.redis:
            return False
        return await self.redis.exists(key) > 0

    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration time for key"""
        if not self.redis:
            return False
        return await self.redis.expire(key, seconds)

    async def ttl(self, key: str) -> int:
        """Get time to live for key"""
        if not self.redis:
            return -1
        return await self.redis.ttl(key)

    async def incr(self, key: str, amount: int = 1) -> int:
        """Increment value by amount"""
        if not self.redis:
            return 0
        return await self.redis.incrby(key, amount)

    async def decr(self, key: str, amount: int = 1) -> int:
        """Decrement value by amount"""
        if not self.redis:
            return 0
        return await self.redis.decrby(key, amount)

    async def hget(self, name: str, key: str) -> Optional[str]:
        """Get hash field value"""
        if not self.redis:
            return None
        return await self.redis.hget(name, key)

    async def hset(self, name: str, key: str, value: str) -> bool:
        """Set hash field value"""
        if not self.redis:
            return False
        return await self.redis.hset(name, key, value)

    async def hgetall(self, name: str) -> dict:
        """Get all hash fields and values"""
        if not self.redis:
            return {}
        return await self.redis.hgetall(name)

    async def hdel(self, name: str, *keys: str) -> int:
        """Delete hash fields"""
        if not self.redis:
            return 0
        return await self.redis.hdel(name, *keys)

    async def sadd(self, name: str, *values: str) -> int:
        """Add members to set"""
        if not self.redis:
            return 0
        return await self.redis.sadd(name, *values)

    async def srem(self, name: str, *values: str) -> int:
        """Remove members from set"""
        if not self.redis:
            return 0
        return await self.redis.srem(name, *values)

    async def smembers(self, name: str) -> set:
        """Get all set members"""
        if not self.redis:
            return set()
        return await self.redis.smembers(name)

    async def lpush(self, name: str, *values: str) -> int:
        """Push values to left of list"""
        if not self.redis:
            return 0
        return await self.redis.lpush(name, *values)

    async def rpush(self, name: str, *values: str) -> int:
        """Push values to right of list"""
        if not self.redis:
            return 0
        return await self.redis.rpush(name, *values)

    async def lrange(self, name: str, start: int, end: int) -> list:
        """Get range of list elements"""
        if not self.redis:
            return []
        return await self.redis.lrange(name, start, end)

    async def ltrim(self, name: str, start: int, end: int) -> bool:
        """Trim list to range"""
        if not self.redis:
            return False
        return await self.redis.ltrim(name, start, end)

    async def json_get(self, key: str) -> Optional[dict]:
        """Get JSON value from Redis"""
        value = await self.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                pass
        return None

    async def json_set(self, key: str, value: Any, ex: Optional[int] = None) -> bool:
        """Set JSON value in Redis"""
        json_str = json.dumps(value)
        return await self.set(key, json_str, ex)

    async def cache_get(
        self,
        key: str,
        json_decode: bool = False,
    ) -> Optional[Any]:
        """
        Get value from cache with optional JSON decoding

        Args:
            key: Cache key
            json_decode: Whether to decode as JSON

        Returns:
            Cached value or None
        """
        value = await self.get(key)
        if value and json_decode:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return value

    async def cache_set(
        self,
        key: str,
        value: Any,
        ex: int = 3600,
        json_encode: bool = False,
    ) -> bool:
        """
        Set value in cache with optional JSON encoding

        Args:
            key: Cache key
            value: Value to cache
            ex: Expiration time in seconds (default 1 hour)
            json_encode: Whether to encode as JSON

        Returns:
            True if successful
        """
        if json_encode and not isinstance(value, str):
            value = json.dumps(value)
        return await self.set(key, value, ex=ex)


# Global Redis client instance
redis_client = RedisClient()


async def init_redis():
    """Initialize Redis connection"""
    await redis_client.connect()


async def close_redis():
    """Close Redis connection"""
    await redis_client.close()


async def get_redis() -> RedisClient:
    """
    Dependency function to get Redis client

    This function can be used as a FastAPI dependency.

    Yields:
        RedisClient: Redis client instance
    """
    return redis_client
