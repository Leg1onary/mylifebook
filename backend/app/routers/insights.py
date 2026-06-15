"""Read-only analytics endpoints for charts and pattern detection."""
from datetime import date, timedelta
from collections import Counter

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.daily_checkin import DailyCheckin
from app.models.trigger_event import TriggerEvent
from app.models.thought_record import ThoughtRecord

router = APIRouter()


class MoodPoint(BaseModel):
    entry_date: date
    mood: int
    energy: int
    anxiety: int


class TriggerCategoryCount(BaseModel):
    category: str
    count: int


class DistortionCount(BaseModel):
    distortion: str
    count: int


class ScriptStats(BaseModel):
    period_days: int
    triggered: int
    resisted: int
    resistance_rate: float


@router.get("/mood-trend", response_model=list[MoodPoint])
async def mood_trend(
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    since = date.today() - timedelta(days=days)
    result = await db.execute(
        select(
            DailyCheckin.entry_date,
            DailyCheckin.mood,
            DailyCheckin.energy,
            DailyCheckin.anxiety,
        ).where(
            DailyCheckin.user_id == user.id,
            DailyCheckin.entry_date >= since,
        ).order_by(DailyCheckin.entry_date)
    )
    return [MoodPoint(entry_date=r.entry_date, mood=r.mood, energy=r.energy, anxiety=r.anxiety)
            for r in result.all()]


@router.get("/trigger-categories", response_model=list[TriggerCategoryCount])
async def trigger_categories(
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    since = date.today() - timedelta(days=days)
    result = await db.execute(
        select(TriggerEvent.category, func.count(TriggerEvent.id).label("cnt"))
        .where(
            TriggerEvent.user_id == user.id,
            TriggerEvent.created_at >= since,
            TriggerEvent.category.is_not(None),
        )
        .group_by(TriggerEvent.category)
        .order_by(func.count(TriggerEvent.id).desc())
    )
    return [TriggerCategoryCount(category=r.category, count=r.cnt) for r in result.all()]


@router.get("/distortions", response_model=list[DistortionCount])
async def distortion_stats(
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    since = date.today() - timedelta(days=days)
    result = await db.execute(
        select(ThoughtRecord.distortions)
        .where(
            ThoughtRecord.user_id == user.id,
            ThoughtRecord.created_at >= since,
            ThoughtRecord.distortions.is_not(None),
        )
    )
    counter: Counter = Counter()
    for (distortions,) in result.all():
        if distortions:
            counter.update(distortions)
    return [DistortionCount(distortion=k, count=v) for k, v in counter.most_common()]


@router.get("/script-stats", response_model=ScriptStats)
async def script_stats(
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    since = date.today() - timedelta(days=days)
    result = await db.execute(
        select(
            func.sum(DailyCheckin.old_script_triggered.cast(db.bind.dialect.NUMERIC)).label("triggered"),
            func.sum(DailyCheckin.old_script_resisted.cast(db.bind.dialect.NUMERIC)).label("resisted"),
        ).where(
            DailyCheckin.user_id == user.id,
            DailyCheckin.entry_date >= since,
        )
    )
    row = result.one()
    triggered = int(row.triggered or 0)
    resisted = int(row.resisted or 0)
    rate = round(resisted / triggered, 2) if triggered > 0 else 0.0
    return ScriptStats(period_days=days, triggered=triggered, resisted=resisted, resistance_rate=rate)
