from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/api/docs" if settings.debug else None,
    redoc_url="/api/redoc" if settings.debug else None,
    openapi_url="/api/openapi.json" if settings.debug else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────
from app.routers import auth, checkins, thoughts, experiments, weekly, sos, export  # noqa: E402

app.include_router(auth.router,        prefix="/api/v1/auth",        tags=["auth"])
app.include_router(checkins.router,    prefix="/api/v1/checkins",    tags=["checkins"])
app.include_router(thoughts.router,    prefix="/api/v1/thoughts",    tags=["thoughts"])
app.include_router(experiments.router, prefix="/api/v1/experiments", tags=["experiments"])
app.include_router(weekly.router,      prefix="/api/v1/weekly",      tags=["weekly"])
app.include_router(sos.router,         prefix="/api/v1/sos",         tags=["sos"])
app.include_router(export.router,      prefix="/api/v1/export",      tags=["export"])


@app.get("/api/health", tags=["system"])
async def health():
    return {"status": "ok", "version": settings.app_version}
