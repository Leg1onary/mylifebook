"""Business logic for behavioural experiments."""
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.experiment import Experiment


async def get_active_experiments(
    db: AsyncSession, user_id: int, limit: int = 5
) -> list[Experiment]:
    """Return planned/in-progress experiments ordered by creation date."""
    result = await db.execute(
        select(Experiment)
        .where(
            Experiment.user_id == user_id,
            Experiment.status.in_(["planned", "in_progress"]),
        )
        .order_by(Experiment.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def count_completed_for_week(
    db: AsyncSession, user_id: int, week_start: date, week_end: date
) -> int:
    result = await db.execute(
        select(func.count(Experiment.id)).where(
            Experiment.user_id == user_id,
            Experiment.status == "completed",
            Experiment.updated_at >= week_start,
            Experiment.updated_at <= week_end,
        )
    )
    return result.scalar_one() or 0


async def get_experiments_for_week(
    db: AsyncSession, user_id: int, week_start: date, week_end: date
) -> list[Experiment]:
    result = await db.execute(
        select(Experiment).where(
            Experiment.user_id == user_id,
            Experiment.updated_at >= week_start,
            Experiment.updated_at <= week_end,
        ).order_by(Experiment.updated_at.desc())
    )
    return list(result.scalars().all())
