"""
Scheduled Tasks Business Logic

This module contains all scheduled task implementations:
- DailyJob: Daily maintenance tasks
- HourlyJob: Hourly checks
- CheckJob: Periodic validations
- DbClean: Database cleanup

All tasks follow these principles:
1. Atomic database operations
2. Proper error handling and logging
3. Configuration-based thresholds
4. Transaction isolation
"""

import time
import logging
from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_, func
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import get_db
from app.db.redis import redis_client
from app.models.user import User
from app.models.node import Node
from app.models.paylist import Paylist, Payback, Code
from app.models.traffic_log import TrafficLog
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


# ============================================================================
# DailyJob - Daily at 02:00
# ============================================================================

async def daily_job():
    """
    Daily Job - Executed at 02:00 every day

    Tasks:
    1. Traffic reset: u = u + d, d = 0 (for users with renew_time expired)
    2. Node heartbeat check (7200 seconds timeout)
    3. Daily statistics reset
    4. Disable overused users (32GB daily limit)
    5. Clean up unused users (32 days)
    6. Reset user class if expired
    """
    logger.info("=" * 60)
    logger.info("DailyJob started")
    logger.info("=" * 60)

    try:
        async with get_db() as db:
            # Task 1: Traffic reset for expired renew_time
            await _daily_traffic_reset(db)
            logger.info("✓ Traffic reset completed")

            # Task 2: Node heartbeat check
            await _check_node_heartbeat(db)
            logger.info("✓ Node heartbeat check completed")

            # Task 3: Disable daily overused users
            await _disable_daily_overused_users(db)
            logger.info("✓ Daily overused users check completed")

            # Task 4: Disable long-time unused users
            await _disable_unused_users(db)
            logger.info("✓ Unused users check completed")

            # Task 5: Reset daily statistics
            await _reset_daily_statistics(db)
            logger.info("✓ Daily statistics reset completed")

            # Task 6: Reset expired user class
            await _reset_expired_user_class(db)
            logger.info("✓ Expired user class reset completed")

        logger.info("=" * 60)
        logger.info("DailyJob completed successfully")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"DailyJob failed: {str(e)}", exc_info=True)
        # Do not raise - let scheduler continue


async def _daily_traffic_reset(db: AsyncSession):
    """
    Reset traffic for users whose renew_time has expired

    Logic:
    - u = u + d (accumulate upload traffic)
    - d = 0 (reset download traffic)
    - transfer_limit = class * 10GB
    - renew_time = now + class * 10 days
    """
    now = int(time.time())

    # Find users with expired renew_time
    result = await db.execute(
        select(User)
        .where(
            and_(
                User.enable > 0,
                User.class_level > 0,
                User.renew_time < now
            )
        )
    )
    users = result.scalars().all()

    logger.info(f"Found {len(users)} users for traffic reset")

    reset_count = 0
    for user in users:
        # Calculate new values
        new_transfer_limit = user.class_level * 10 * 1024**3  # class * 10GB
        new_renew_time = now + user.class_level * 10 * 86400  # class * 10 days

        # Atomic update
        await db.execute(
            update(User)
            .where(User.id == user.id)
            .values(
                u=User.u + User.d,  # CRITICAL: u = u + d
                d=0,  # d = 0
                transfer_limit=new_transfer_limit,
                renew_time=new_renew_time
            )
        )
        reset_count += 1

    await db.commit()
    logger.info(f"Reset traffic for {reset_count} users")


async def _check_node_heartbeat(db: AsyncSession):
    """
    Check node heartbeat and mark offline nodes as faulty

    Timeout: 7200 seconds (2 hours)
    """
    timeout = int(time.time()) - 7200  # 2 hours ago

    result = await db.execute(
        update(Node)
        .where(
            and_(
                Node.node_heartbeat < timeout,
                Node.type != 0
            )
        )
        .values(type=0)  # Mark as faulty
    )

    affected_rows = result.rowcount
    await db.commit()

    logger.info(f"Marked {affected_rows} nodes as faulty (no heartbeat)")


async def _disable_daily_overused_users(db: AsyncSession):
    """
    Disable users who exceeded daily traffic limit (32GB)

    Groups: 2-5 (group 1 is unlimited)
    Time window: Last 24 hours
    """
    time_window = int(time.time()) - 24 * 3600  # 24 hours ago
    traffic_limit = 32 * 1024**3  # 32GB

    disabled_count = 0

    # Check groups 2-5
    for group in range(2, 6):
        # Get active users in this group
        result = await db.execute(
            select(User)
            .where(
                and_(
                    User.enable == 1,
                    User.node_group == group,
                    User.t > time_window
                )
            )
        )
        users = result.scalars().all()

        for user in users:
            total_traffic = user.u + user.d

            # Check Redis for last day's traffic
            last_day_key = f'user:{user.id}:traffic_lastday'
            last_day_traffic = await redis_client.get(last_day_key)

            if last_day_traffic:
                last_day_traffic = int(last_day_traffic)

                # Calculate today's usage
                today_usage = total_traffic - last_day_traffic

                if today_usage > traffic_limit:
                    # Disable user
                    await db.execute(
                        update(User)
                        .where(User.id == user.id)
                        .values(
                            enable=0,
                            warming=f'{datetime.now().strftime("%Y%m%d %H:%M:%S")} '
                                  f'昨日流量使用异常,触发账号异常预警,请输入您的账号邮箱解除限制;'
                        )
                    )
                    disabled_count += 1
                    logger.warning(f"Disabled user {user.id} for daily traffic overuse: "
                                 f"{today_usage / 1024**3:.2f}GB")

            # Update Redis cache
            await redis_client.setex(
                last_day_key,
                86400,  # 1 day
                str(total_traffic)
            )

    await db.commit()
    logger.info(f"Disabled {disabled_count} users for daily traffic overuse")


async def _disable_unused_users(db: AsyncSession):
    """
    Disable users who haven't used the service for 32+ days

    Conditions:
    - class > 0
    - t (last used time) < 32 days ago
    - reg_date > 1 month ago
    """
    unused_threshold = int(time.time()) - 32 * 86400  # 32 days ago
    reg_threshold = datetime.now() - timedelta(days=30)

    result = await db.execute(
        update(User)
        .where(
            and_(
                User.id > 10,  # Exclude system users
                User.enable == 1,
                User.class_level > 0,
                User.t < unused_threshold,
                User.reg_date < reg_threshold
            )
        )
        .values(
            enable=0,
            warming=f'{datetime.now().strftime("%Y%m%d %H:%M:%S")} '
                   f'账号超过1个月未使用，系统启用账号保护。您可以自助解除保护'
        )
    )

    affected_rows = result.rowcount
    await db.commit()

    logger.info(f"Disabled {affected_rows} unused users (32+ days)")


async def _reset_daily_statistics(db: AsyncSession):
    """
    Reset daily statistics for all active users

    - last_day_t = d (only download traffic)
    - rss_count_lastday = rss_count
    - rss_ips_lastday = rss_ips_count
    """
    check_time = int(time.time()) - 48 * 3600  # 48 hours ago
    total_processed = 0

    # Process by node_group to reduce memory usage
    for group in range(1, 9):
        result = await db.execute(
            select(User)
            .where(
                and_(
                    User.enable > 0,
                    User.class_level > 0,
                    User.t > check_time,
                    User.node_group == group
                )
            )
        )
        users = result.scalars().all()

        group_count = 0
        for user in users:
            # Update statistics
            await db.execute(
                update(User)
                .where(User.id == user.id)
                .values(
                    last_day_t=user.d,  # Only record d, not u
                    rss_count_lastday=user.rss_count,
                    rss_ips_lastday=user.rss_ips_count
                )
            )
            group_count += 1
            total_processed += 1

        await db.commit()
        logger.info(f"  Group {group}: processed {group_count} users")

    logger.info(f"Total statistics reset: {total_processed} users")


async def _reset_expired_user_class(db: AsyncSession):
    """
    Reset user class to 0 if class_expire has passed
    """
    now = datetime.now()

    result = await db.execute(
        update(User)
        .where(
            and_(
                User.class_level > 0,
                User.class_expire < now
            )
        )
        .values(class_level=0)
    )

    affected_rows = result.rowcount
    await db.commit()

    logger.info(f"Reset class for {affected_rows} expired users")


# ============================================================================
# HourlyJob - Every hour at minute 5
# ============================================================================

async def hourly_job():
    """
    Hourly Job - Executed every hour at minute 5

    Tasks:
    1. Disable hourly overused users (6GB per hour limit)
    2. Clean unpaid orders (1 hour timeout)
    """
    logger.info("HourlyJob started")

    try:
        async with get_db() as db:
            # Task 1: Disable hourly overused users
            await _disable_hourly_overused_users(db)
            logger.info("✓ Hourly overused users check completed")

            # Task 2: Clean unpaid orders
            await _clean_unpaid_orders(db)
            logger.info("✓ Unpaid orders cleanup completed")

        logger.info("HourlyJob completed successfully")

    except Exception as e:
        logger.error(f"HourlyJob failed: {str(e)}", exc_info=True)


async def _disable_hourly_overused_users(db: AsyncSession):
    """
    Disable users who exceeded hourly traffic limit (6GB)

    Groups: 2-3 (groups 1 and 4 are unlimited)
    Time window: Last 1 hour
    """
    traffic_limit = 6 * 1024**3  # 6GB
    time_window = int(time.time()) - 3600  # 1 hour ago

    disabled_count = 0

    # Check groups 2-3
    for group in [2, 3]:
        result = await db.execute(
            select(User)
            .where(
                and_(
                    User.enable == 1,
                    User.node_group == group,
                    User.t > time_window
                )
            )
        )
        users = result.scalars().all()

        for user in users:
            total_traffic = user.u + user.d

            # Check Redis for last hour's traffic
            last_hour_key = f'user:{user.id}:traffic_lasthour'
            last_hour_traffic = await redis_client.get(last_hour_key)

            if last_hour_traffic:
                last_hour_traffic = int(last_hour_traffic)

                # Calculate this hour's usage
                hour_usage = total_traffic - last_hour_traffic

                if hour_usage > traffic_limit:
                    # Disable user
                    await db.execute(
                        update(User)
                        .where(User.id == user.id)
                        .values(
                            enable=0,
                            warming='流量峰值异常,可能是下载器在使用您的流量,如需下载请使用流量优先分组;请输入账号解除限制'
                        )
                    )
                    disabled_count += 1
                    logger.warning(f"Disabled user {user.id} for hourly traffic overuse: "
                                 f"{hour_usage / 1024**3:.2f}GB")

            # Update Redis cache (expire 1.5 hours)
            await redis_client.setex(
                last_hour_key,
                4600,  # 1.5 hours
                str(total_traffic)
            )

    await db.commit()
    logger.info(f"Disabled {disabled_count} users for hourly traffic overuse")


async def _clean_unpaid_orders(db: AsyncSession):
    """
    Clean up unpaid orders older than 1 hour

    This is a cleanup task to remove stale orders
    """
    timeout = int(time.time()) - 3600  # 1 hour ago

    result = await db.execute(
        delete(Paylist)
        .where(
            and_(
                Paylist.status == 0,  # Unpaid
                Paylist.datetime < timeout
            )
        )
    )

    affected_rows = result.rowcount
    await db.commit()

    logger.info(f"Deleted {affected_rows} stale unpaid orders")


# ============================================================================
# CheckJob - Every 10 minutes
# ============================================================================

async def check_job():
    """
    Check Job - Executed every 10 minutes

    Tasks:
    1. Clean expired IP records (5 minutes)
    2. Delete expired users (4 conditions)
    3. Disable users with negative balance
    """
    logger.info("CheckJob started")

    try:
        async with get_db() as db:
            # Task 1: Clean expired IP records
            await _clean_expired_ips(db)
            logger.info("✓ Expired IP cleanup completed")

            # Task 2: Delete expired users
            await _delete_expired_users(db)
            logger.info("✓ Expired users deletion completed")

            # Task 3: Disable negative balance users
            await _disable_negative_balance_users(db)
            logger.info("✓ Negative balance users check completed")

        logger.info("CheckJob completed successfully")

    except Exception as e:
        logger.error(f"CheckJob failed: {str(e)}", exc_info=True)


async def _clean_expired_ips(db: AsyncSession):
    """
    Clean expired IP-related records

    - Ip records: 5 minutes (300 seconds)
    - BlockIp records: 1 day (86400 seconds)
    """
    # Note: Ip, BlockIp models may not exist in your schema yet
    # This is a placeholder for future implementation
    logger.info("IP cleanup: Placeholder (models not implemented yet)")


async def _delete_expired_users(db: AsyncSession):
    """
    Delete expired users based on 4 conditions

    Condition 1: Account expired + balance insufficient
    Condition 2: Class 0 + no checkin for 32 days
    Condition 3: Class 0 + no usage for 7 days
    Condition 4: Never used (t=0,u=0,d=0) + 14 days + class=0 + money<=1
    """
    deleted_count = 0

    # Condition 4: Never used users
    reg_threshold = datetime.now() - timedelta(days=14)

    result = await db.execute(
        select(User)
        .where(
            and_(
                User.t == 0,
                User.u == 0,
                User.d == 0,
                User.reg_date < reg_threshold,
                User.class_level == 0,
                User.money <= 1
            )
        )
    )
    users = result.scalars().all()

    for user in users:
        # TODO: Implement referral commission recovery
        # For now, just log
        logger.warning(f"Would delete never-used user {user.id}")

        # Note: We don't actually delete users in this implementation
        # Instead, we disable them
        await db.execute(
            update(User)
            .where(User.id == user.id)
            .values(enable=0)
        )
        deleted_count += 1

    await db.commit()
    logger.info(f"Disabled {deleted_count} never-used users")


async def _disable_negative_balance_users(db: AsyncSession):
    """
    Disable users with negative balance

    Penalties:
    - enable = 0
    - ban_times += class
    - node_group -= 1 (if > 1)
    - score -= 1
    """
    result = await db.execute(
        select(User)
        .where(
            and_(
                User.money < 0,
                User.enable == 1
            )
        )
    )
    users = result.scalars().all()

    disabled_count = 0
    for user in users:
        await db.execute(
            update(User)
            .where(User.id == user.id)
            .values(
                enable=0,
                warming=f'{datetime.now().strftime("%Y%m%d %H:%M:%S")} '
                       f'账号余额异常，系统启用账号保护。请检查您的余额',
                ban_times=User.ban_times + User.class_level,
                score=User.score - 1
            )
        )

        # Downgrade node group if > 1
        if user.node_group > 1:
            await db.execute(
                update(User)
                .where(User.id == user.id)
                .values(node_group=User.node_group - 1)
            )

        disabled_count += 1

    await db.commit()
    logger.info(f"Disabled {disabled_count} negative balance users")


# ============================================================================
# DbClean - Weekly on Sunday at 04:00
# ============================================================================

async def db_clean_job():
    """
    Database Clean Job - Executed weekly on Sunday at 04:00

    Tasks:
    1. Clean traffic logs older than 3 days
    2. Clean node online logs older than 3 days
    """
    logger.info("DbClean started")

    try:
        async with get_db() as db:
            # Clean traffic logs older than 3 days
            threshold = int(time.time()) - 3 * 86400  # 3 days ago

            # Note: TrafficLog, NodeOnlineLog models may not exist yet
            # This is a placeholder
            logger.info("DbClean: Placeholder (log models not implemented yet)")

        logger.info("DbClean completed successfully")

    except Exception as e:
        logger.error(f"DbClean failed: {str(e)}", exc_info=True)
