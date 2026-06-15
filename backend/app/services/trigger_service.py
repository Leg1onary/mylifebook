"""Business logic for trigger events."""
from collections import Counter
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.trigger_event import TriggerEvent


async def get_trigger_category_stats(
    db: AsyncSession, user_id: int, days: int = 30
) -> list[dict]:
    """Return trigger counts grouped by category."""
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


async def count_triggers_for_week(
    db: AsyncSession, user_id: int, week_start: date, week_end: date
) -> int:
    result = await db.execute(
        select(func.count(TriggerEvent.id)).where(
            TriggerEvent.user_id == user_id,
            TriggerEvent.created_at >= week_start,
            TriggerEvent.created_at <= week_end,
        )
    )
    return result.scalar_one() or 0


async def get_triggers_for_week(
    db: AsyncSession, user_id: int, week_start: date, week_end: date
) -> list[TriggerEvent]:
    result = await db.execute(
        select(TriggerEvent).where(
            TriggerEvent.user_id == user_id,
            TriggerEvent.created_at >= week_start,
            TriggerEvent.created_at <= week_end,
        ).order_by(TriggerEvent.created_at.desc())
    )
    return list(result.scalars().all())
