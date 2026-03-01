import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from src.config.env import settings
from src.config.database import init_db, engine
from src.utils.logger import logger
from src.utils.exceptions import StratAxisException, strataxis_exception_handler, generic_exception_handler
from src.routers import auth, users, properties, listings, analytics, predictions, bookings, admin, payments, blogs, global_metrics

# Rate Limiter setup
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info("  StratAxis Backend Starting")
    logger.info(f"  Environment : {settings.ENVIRONMENT}")
    logger.info(f"  Port        : {settings.PORT}")
    logger.info(f"  Supabase    : {settings.SUPABASE_URL}")
    logger.info("=" * 60)

    try:
        await init_db()
        logger.info("✅ StratAxis Backend initialised successfully.")
    except Exception as e:
        # Fail LOUDLY — do not start with a broken DB
        logger.critical(
            f"❌ FATAL: Database initialisation failed: {e}\n"
            "Ensure the Supabase Docker stack is running:\n"
            "  cd infrastructure/supabase-docker/docker\n"
            "  docker compose up -d\n"
            "Then restart the backend."
        )
        raise  # Crash FastAPI so the error is impossible to miss

    yield

    # ── Shutdown ─────────────────────────────────────────────────────
    logger.info("Shutting down StratAxis Backend...")
    await engine.dispose()
    logger.info("Database connections closed.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
    debug=settings.ENVIRONMENT == "development",
)

# Rate Limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global Exception Handlers
app.add_exception_handler(StratAxisException, strataxis_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# CORS — origins are configured in env.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request Logging and Security Headers Middleware
@app.middleware("http")
async def add_process_time_and_log(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)

    # Standard Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.4f}s"
    )

    return response


# ── Routers ───────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(properties.router, prefix="/api")
app.include_router(listings.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(blogs.router, prefix="/api")
app.include_router(global_metrics.router, prefix="/api")


# ── Health Check ──────────────────────────────────────────────────────
@app.get("/api/health")
@limiter.limit("30/minute")
async def health_check(request: Request):
    """
    Detailed health check endpoint.
    Frontend can ping this to confirm the full stack is up before
    showing the dashboard. Returns DB status too.
    """
    from sqlalchemy import text
    from src.config.database import async_session

    db_status = "unknown"
    try:
        async with async_session() as session:
            await session.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "supabase_url": settings.SUPABASE_URL,
        "timestamp": time.time(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True,
    )
