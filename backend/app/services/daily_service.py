"""Business logic for daily check-ins and streak calculation."""
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.daily_checkin import DailyCheckin


async def get_checkin_by_date(
    db: AsyncSession, user_id: int, entry_date: date
) -> DailyCheckin | None:
    result = await db.execute(
        select(DailyCheckin).where(
            DailyCheckin.user_id == user_id,
            DailyCheckin.entry_date == entry_date,
        )
    )
    return result.scalar_one_or_none()


async def calculate_streak(db: AsyncSession, user_id: int) -> int:
    """Count consecutive days with a checkin ending today (or yesterday if today is missing)."""
    streak = 0
    check_date = date.today()
    while True:
        result = await db.execute(
            select(DailyCheckin.id).where(
                DailyCheckin.user_id == user_id,
                DailyCheckin.entry_date == check_date,
            )
        )
        if result.scalar_one_or_none() is None:
            break
        streak += 1
        check_date -= timedelta(days=1)
    return streak


async def get_mood_stats(
    db: AsyncSession, user_id: int, since: date
) -> dict:
    """Return avg mood/energy/anxiety for a date range."""
    result = await db.execute(
        select(
            func.avg(DailyCheckin.mood).label("avg_mood"),
            func.avg(DailyCheckin.energy).label("avg_energy"),
            func.avg(DailyCheckin.anxiety).label("avg_anxiety"),
            func.count(DailyCheckin.id).label("count"),
        ).where(
            DailyCheckin.user_id == user_id,
            DailyCheckin.entry_date >= since,
        )
    )
    row = result.one()
    return {
        "avg_mood": float(row.avg_mood) if row.avg_mood else None,
        "avg_energy": float(row.avg_energy) if row.avg_energy else None,
        "avg_anxiety": float(row.avg_anxiety) if row.avg_anxiety else None,
        "count": row.count or 0,
    }


async def get_script_stats(
    db: AsyncSession, user_id: int, since: date
) -> dict:
    """Count old_script_triggered and old_script_resisted days."""
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
        "triggered": triggered,
        "resisted": resisted,
        "resistance_rate": round(resisted / triggered, 2) if triggered > 0 else 0.0,
    }
