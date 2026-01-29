"""
APScheduler Configuration

This module configures the AsyncIOScheduler for background tasks.
All scheduled jobs are defined here with proper error handling and logging.

Tasks:
- DailyJob: Daily at 02:00
- HourlyJob: Every hour at minute 5
- CheckJob: Every 10 minutes
"""

import asyncio
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.executors.asyncio import AsyncIOExecutor
from datetime import datetime

from app.core.config import get_settings
from app.services.tasks import (
    daily_job,
    hourly_job,
    check_job,
    db_clean_job
)

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.debug else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create scheduler
executors = {
    'default': AsyncIOExecutor()
}

scheduler = AsyncIOScheduler(
    executors=executors,
    timezone='Asia/Shanghai',
    job_defaults={
        'coalesce': True,  # Combine missed jobs into one
        'max_instances': 1,  # Only one instance of each job
        'misfire_grace_time': 3600  # Allow 1 hour grace time for misfired jobs
    }
)


def start_scheduler():
    """
    Start the APScheduler with all jobs

    This function is called during application startup
    """
    if not settings.enable_scheduler:
        logger.warning("Scheduler is disabled in config")
        return

    logger.info("Starting APScheduler...")

    # Schedule DailyJob - Daily at 02:00
    scheduler.add_job(
        daily_job,
        trigger=CronTrigger(hour=2, minute=0),
        id='daily_job',
        name='Daily Job',
        replace_existing=True
    )
    logger.info("✓ Scheduled DailyJob: Daily at 02:00")

    # Schedule HourlyJob - Every hour at minute 5
    scheduler.add_job(
        hourly_job,
        trigger=CronTrigger(minute=5),
        id='hourly_job',
        name='Hourly Job',
        replace_existing=True
    )
    logger.info("✓ Scheduled HourlyJob: Every hour at minute 5")

    # Schedule CheckJob - Every 10 minutes
    scheduler.add_job(
        check_job,
        trigger=CronTrigger(minute='*/10'),
        id='check_job',
        name='Check Job',
        replace_existing=True
    )
    logger.info("✓ Scheduled CheckJob: Every 10 minutes")

    # Schedule DbClean - Weekly on Sunday at 04:00
    scheduler.add_job(
        db_clean_job,
        trigger=CronTrigger(day_of_week='sun', hour=4, minute=0),
        id='db_clean_job',
        name='Database Clean Job',
        replace_existing=True
    )
    logger.info("✓ Scheduled DbClean: Weekly on Sunday at 04:00")

    # Start the scheduler
    scheduler.start()
    logger.info("✅ APScheduler started successfully")

    # Log next run times
    jobs = scheduler.get_jobs()
    for job in jobs:
        logger.info(f"  - {job.name}: Next run at {job.next_run_time}")


def stop_scheduler():
    """
    Stop the APScheduler

    This function is called during application shutdown
    """
    logger.info("Stopping APScheduler...")
    scheduler.shutdown(wait=True)
    logger.info("✅ APScheduler stopped")


def get_scheduler_status():
    """
    Get scheduler status information

    Returns:
        dict: Scheduler status with job information
    """
    jobs = scheduler.get_jobs()

    return {
        "scheduler_running": scheduler.running,
        "total_jobs": len(jobs),
        "jobs": [
            {
                "id": job.id,
                "name": job.name,
                "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
            }
            for job in jobs
        ]
    }
