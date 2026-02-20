"""
StratAxis — backend/main.py
New unified FastAPI entry point.

Routes registered:
  /api/prices/*         → routes/prices.py   (rent listings, trends, predictions)
  /api/land/*           → routes/land.py      (land price listings, neighborhood summary)
  /api/institutional/*  → routes/institutional.py (gov docs, housing indicators)

  /api/* (existing)     → backend/src/main.py (auth, admin, bookings, analytics, users)

Run with:
  uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
"""

import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# New architecture routes
from backend.routes.prices import router as prices_router
from backend.routes.land import router as land_router
from backend.routes.institutional import router as institutional_router

# Existing battle-tested routers (auth, admin, bookings, etc.)
from backend.src.routers import (
    auth,
    users,
    properties,
    listings,
    analytics,
    predictions,
    bookings,
    admin,
)
from backend.src.config.env import settings
from backend.src.config.database import init_db
from backend.src.utils.logger import logger as app_logger
from backend.src.utils.exceptions import (
    StratAxisException,
    strataxis_exception_handler,
    generic_exception_handler,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("strataxis.main")

# ─────────────────────────────────────────────
# Rate Limiter
# ─────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)


# ─────────────────────────────────────────────
# Lifespan (startup / shutdown)
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("StratAxis backend starting...")
    try:
        await init_db()
        logger.info("Database initialized.")
    except Exception as e:
        logger.error(f"Database init failed: {e}")
    yield
    logger.info("StratAxis backend shutting down.")


# ─────────────────────────────────────────────
# App instantiation
# ─────────────────────────────────────────────
app = FastAPI(
    title="StratAxis API",
    description=(
        "Real estate market intelligence API for Cameroon. "
        "Covering Douala and Yaoundé — land prices, rent data, "
        "institutional indicators, ML forecasts."
    ),
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# ─────────────────────────────────────────────
# Middleware
# ─────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_exception_handler(StratAxisException, strataxis_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def logging_and_security_headers(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    elapsed = time.time() - start
    response.headers["X-Process-Time"] = str(round(elapsed, 4))
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({elapsed:.3f}s)")
    return response


# ─────────────────────────────────────────────
# Route Registration
# ─────────────────────────────────────────────

# NEW dynamic data routes
app.include_router(prices_router)           # /api/prices/*
app.include_router(land_router)             # /api/land/*
app.include_router(institutional_router)    # /api/institutional/*

# EXISTING robust routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(properties.router, prefix="/api")
app.include_router(listings.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


# ─────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────
@app.get("/api/health", tags=["System"])
@limiter.limit("10/minute")
async def health_check(request: Request):
    return {
        "status": "online",
        "project": "StratAxis",
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT,
        "timestamp": time.time(),
    }


# ─────────────────────────────────────────────
# Intelligence Pipeline Trigger (Admin endpoint)
# ─────────────────────────────────────────────
@app.post("/api/intelligence/run", tags=["Admin - Intelligence"])
async def trigger_intelligence_pipeline(request: Request):
    """
    Manually trigger the full intelligence pipeline:
    compute price trends + generate + store ML forecasts.
    Normally scheduled, but can be triggered manually by admin.
    """
    from backend.services.forecast_service import run_full_intelligence_pipeline
    import asyncio
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, run_full_intelligence_pipeline)
    return {"status": "triggered", "message": "Intelligence pipeline running in background"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
