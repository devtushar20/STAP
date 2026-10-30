import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.config import get_settings
from app.models import Base, engine
from app.limiter import limiter
from app.routers import (
    demo,
    auth,
    dashboard,
    jobs,
    candidates,
    runs,
    agents,
    pipeline,
    audit,
)

settings = get_settings()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("stap.main")

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for STAP: Autonomous Multi-Agent Recruitment Orchestration Platform",
    version="1.0.0",
)

# Attach Slowapi Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
allowed_origins = [
    settings.FRONTEND_URL.rstrip("/"),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(demo.router)
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(runs.router)
app.include_router(agents.router)
app.include_router(pipeline.router)
app.include_router(audit.router)


@app.get("/", tags=["Health & Status"])
def root():
    return {
        "service": "STAP AI Recruitment Backend",
        "status": "operational",
        "version": "1.0.0",
        "docs_url": "/docs",
    }


@app.get("/health", tags=["Health & Status"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "agents": 6,
    }
