from fastapi import APIRouter

from app.routers.auth import router as auth_router
from app.routers.daily_checkins import router as checkins_router
from app.routers.thought_records import router as thoughts_router
from app.routers.experiments import router as experiments_router
from app.routers.triggers import router as triggers_router
from app.routers.weekly_reviews import router as weekly_router
from app.routers.today import router as today_router
from app.routers.personal_context import router as context_router
from app.routers.insights import router as insights_router
from app.routers.ai import router as ai_router
from app.routers.exports import router as exports_router
from app.routers.settings import router as settings_router
from app.routers.journal import router as journal_router

api_router = APIRouter()

api_router.include_router(auth_router,        prefix="/auth",         tags=["auth"])
api_router.include_router(today_router,       prefix="/today",        tags=["today"])
api_router.include_router(checkins_router,    prefix="/checkins",     tags=["checkins"])
api_router.include_router(thoughts_router,    prefix="/thoughts",     tags=["thoughts"])
api_router.include_router(experiments_router, prefix="/experiments",  tags=["experiments"])
api_router.include_router(triggers_router,    prefix="/triggers",     tags=["triggers"])
api_router.include_router(weekly_router,      prefix="/weekly",       tags=["weekly"])
api_router.include_router(context_router,     prefix="/context",      tags=["context"])
api_router.include_router(insights_router,    prefix="/insights",     tags=["insights"])
api_router.include_router(ai_router,          prefix="/ai",           tags=["ai"])
api_router.include_router(exports_router,     prefix="/exports",      tags=["exports"])
api_router.include_router(settings_router,    prefix="/settings",     tags=["settings"])
api_router.include_router(journal_router,     prefix="/journal",      tags=["journal"])
