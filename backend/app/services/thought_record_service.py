"""Business logic for thought records (CBT thought logs)."""
from collections import Counter
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.thought_record import ThoughtRecord


async def get_distortion_stats(
    db: AsyncSession, user_id: int, days: int = 30
) -> list[dict]:
    """Return most common cognitive distortions over the given period."""
    since = date.today() - timedelta(days=days)
    result = await db.execute(
        select(ThoughtRecord.distortions).where(
            ThoughtRecord.user_id == user_id,
            ThoughtRecord.created_at >= since,
            ThoughtRecord.distortions.is_not(None),
        )
    )
    counter: Counter = Counter()
    for (distortions,) in result.all():
        if distortions:
            counter.update(distortions)
    return [
        {"distortion": k, "count": v}
        for k, v in counter.most_common()
    ]


async def get_recent_thoughts(
    db: AsyncSession, user_id: int, limit: int = 5, sos_only: bool = False
) -> list[ThoughtRecord]:
    q = select(ThoughtRecord).where(ThoughtRecord.user_id == user_id)
    if sos_only:
        q = q.where(ThoughtRecord.is_sos == True)  # noqa: E712
    q = q.order_by(ThoughtRecord.created_at.desc()).limit(limit)
    result = await db.execute(q)
    return list(result.scalars().all())


async def get_thoughts_for_week(
    db: AsyncSession, user_id: int, week_start: date, week_end: date
) -> list[ThoughtRecord]:
    result = await db.execute(
        select(ThoughtRecord).where(
            ThoughtRecord.user_id == user_id,
            ThoughtRecord.created_at >= week_start,
            ThoughtRecord.created_at <= week_end,
        ).order_by(ThoughtRecord.created_at.desc())
    )
    return list(result.scalars().all())
