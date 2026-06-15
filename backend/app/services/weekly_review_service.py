"""Business logic for building and refreshing weekly reviews."""
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.weekly_review import WeeklyReview
from app.models.daily_checkin import DailyCheckin
from app.models.trigger_event import TriggerEvent
from app.models.experiment import Experiment


def week_bounds(ref_date: date) -> tuple[date, date]:
    """Return Monday and Sunday for the ISO week containing ref_date."""
    start = ref_date - timedelta(days=ref_date.weekday())
    return start, start + timedelta(days=6)


async def build_or_refresh_review(
    db: AsyncSession, user_id: int, week_start: date, week_end: date
) -> WeeklyReview:
    """
    Compute aggregated stats from checkins/triggers/experiments
    and upsert the WeeklyReview row. Does NOT commit — caller's responsibility.
    """
    agg = await db.execute(
        select(
            func.avg(DailyCheckin.mood).label("avg_mood"),
            func.avg(DailyCheckin.energy).label("avg_energy"),
            func.avg(DailyCheckin.anxiety).label("avg_anxiety"),
            func.count(DailyCheckin.id).label("checkins_count"),
            func.sum(
                DailyCheckin.old_script_triggered.cast(type_=None)
            ).label("triggered_days"),
            func.sum(
                DailyCheckin.old_script_resisted.cast(type_=None)
            ).label("resisted_days"),
        ).where(
            DailyCheckin.user_id == user_id,
            DailyCheckin.entry_date >= week_start,
            DailyCheckin.entry_date <= week_end,
        )
    )
    row = agg.one()

    trigger_count = (
        await db.execute(
            select(func.count(TriggerEvent.id)).where(
                TriggerEvent.user_id == user_id,
                TriggerEvent.created_at >= week_start,
                TriggerEvent.created_at <= week_end,
            )
        )
    ).scalar_one() or 0

    experiments_done = (
        await db.execute(
            select(func.count(Experiment.id)).where(
                Experiment.user_id == user_id,
                Experiment.status == "completed",
                Experiment.updated_at >= week_start,
                Experiment.updated_at <= week_end,
            )
        )
    ).scalar_one() or 0

    existing = (
        await db.execute(
            select(WeeklyReview).where(
                WeeklyReview.user_id == user_id,
                WeeklyReview.week_start == week_start,
            )
        )
    ).scalar_one_or_none()

    if existing:
        review = existing
    else:
        review = WeeklyReview(user_id=user_id, week_start=week_start, week_end=week_end)
        db.add(review)

    review.avg_mood = float(row.avg_mood) if row.avg_mood else None
    review.avg_energy = float(row.avg_energy) if row.avg_energy else None
    review.avg_anxiety = float(row.avg_anxiety) if row.avg_anxiety else None
    review.checkins_count = row.checkins_count or 0
    review.trigger_events_count = trigger_count
    review.old_script_triggered_days = int(row.triggered_days or 0)
    review.old_script_resisted_days = int(row.resisted_days or 0)
    review.experiments_completed = experiments_done

    await db.flush()
    return review
