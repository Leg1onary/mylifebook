"""Higher-level insight helpers used by the insights router."""
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.daily_checkin import DailyCheckin
from app.models.trigger_event import TriggerEvent
from app.models.thought_record import ThoughtRecord


async def mood_trend(
    db: AsyncSession, user_id: int, days: int = 30
) -> list[dict]:
    since = date.today() - timedelta(days=days)
    result = await db.execute(
        select(
            DailyCheckin.entry_date,
            DailyCheckin.mood,
            DailyCheckin.energy,
            DailyCheckin.anxiety,
        ).where(
            DailyCheckin.user_id == user_id,
            DailyCheckin.entry_date >= since,
        ).order_by(DailyCheckin.entry_date)
    )
    return [
        {"entry_date": r.entry_date, "mood": r.mood, "energy": r.energy, "anxiety": r.anxiety}
        for r in result.all()
    ]


async def top_trigger_categories(
    db: AsyncSession, user_id: int, days: int = 30
) -> list[dict]:
    since = date.today() - timedelta(days=days)
    result = await db.execute(
        select(TriggerEvent.category, func.count(TriggerEvent.id).label("cnt"))
        .where(
            TriggerEvent.user_id == user_id,
            TriggerEvent.created_at >= since,
            TriggerEvent.category.is_not(None),
        )
        .group_by(TriggerEvent.category)
        .order_by(func.count(TriggerEvent.id).desc())
    )
    return [{"category": r.category, "count": r.cnt} for r in result.all()]


async def script_resistance_rate(
    db: AsyncSession, user_id: int, days: int = 30
) -> dict:
    since = date.today() - timedelta(days=days)
    result = await db.execute(
        select(
            func.sum(
                DailyCheckin.old_script_triggered.cast(type_=None)
            ).label("triggered"),
            func.sum(
                DailyCheckin.old_script_resisted.cast(type_=None)
            ).label("resisted"),
        ).where(
            DailyCheckin.user_id == user_id,
            DailyCheckin.entry_date >= since,
        )
    )
    row = result.one()
    triggered = int(row.triggered or 0)
    resisted = int(row.resisted or 0)
    return {
        "period_days": days,
        "triggered": triggered,
        "resisted": resisted,
        "resistance_rate": round(resisted / triggered, 2) if triggered > 0 else 0.0,
    }
