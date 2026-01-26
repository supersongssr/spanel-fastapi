"""
SS-Panel FastAPI Main Application

This is the main entry point for the FastAPI application.
It initializes the app, configures middleware, and includes all API routers.
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.db.session import init_db, close_db
from app.db.redis import init_redis, close_redis
from app.api import api_router
from app.schemas.response import error_response

# Get settings
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events

    Handles:
    - Startup: Initialize database and Redis connections
    - Shutdown: Close database and Redis connections
    """
    # Startup
    print("=" * 60)
    print("🚀 Starting SS-Panel FastAPI...")
    print(f"   Version: {settings.app_version}")
    print(f"   Debug: {settings.debug}")
    print("=" * 60)

    # Initialize database
    try:
        await init_db()
    except Exception as e:
        print(f"⚠️  Warning: Database initialization failed: {e}")
        print("   Continuing anyway...")

    # Initialize Redis
    try:
        await init_redis()
    except Exception as e:
        print(f"⚠️  Warning: Redis initialization failed: {e}")
        print("   Continuing anyway...")

    print("✅ Application started successfully!")
    print("=" * 60)

    yield

    # Shutdown
    print("\n" + "=" * 60)
    print("🛑 Shutting down SS-Panel FastAPI...")

    # Close connections
    await close_db()
    await close_redis()

    print("✅ Application shut down successfully!")
    print("=" * 60)


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="SS-Panel FastAPI Backend - Modern rewrite of SS-Panel Mod Uim",
    version=settings.app_version,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan,
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for all unhandled exceptions

    Returns a standardized error response compatible with the original PHP project.
    """
    import traceback

    # Log the error
    if settings.debug:
        print(f"❌ Exception: {str(exc)}")
        print(traceback.format_exc())

    # Return error response
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response(
            msg=str(exc) if settings.debug else "Internal server error"
        )
    )


# Include API routers
app.include_router(
    api_router,
    prefix="/app/api",
    tags=["api"]
)


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint

    Returns basic information about the API.
    """
    return {
        "ret": 1,
        "msg": "SS-Panel FastAPI",
        "data": {
            "name": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs" if settings.debug else "disabled",
        }
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info"
    )
