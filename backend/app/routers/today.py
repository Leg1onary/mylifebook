"""Aggregated endpoint — returns everything needed for the Today screen in one call."""
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.daily_checkin import DailyCheckin
from app.models.weekly_review import WeeklyReview
from app.models.experiment import Experiment
from app.models.personal_context import PersonalContext
from app.schemas.daily_checkin import DailyCheckinOut
from app.schemas.weekly_review import WeeklyReviewOut
from app.schemas.experiment import ExperimentOut
from app.schemas.personal_context import PersonalContextOut

router = APIRouter()

_STREAK_LOOKBACK = 365  # days to look back for streak calculation


class TodayResponse(BaseModel):
    today_date: date
    checkin: DailyCheckinOut | None
    current_week: WeeklyReviewOut | None
    active_experiments: list[ExperimentOut]
    context: PersonalContextOut | None
    streak_days: int


def _calculate_streak(dates: set[date], today: date) -> int:
    """Count consecutive days ending on today from a set of checkin dates."""
    streak = 0
    check = today
    while check in dates:
        streak += 1
        check -= timedelta(days=1)
    return streak


@router.get("/", response_model=TodayResponse)
async def get_today(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    today = date.today()

    # Today's checkin
    checkin_result = await db.execute(
        select(DailyCheckin).where(
            DailyCheckin.user_id == user.id,
            DailyCheckin.entry_date == today,
        )
    )
    checkin = checkin_result.scalar_one_or_none()

    # Current week review
    week_start = today - timedelta(days=today.weekday())
    review_result = await db.execute(
        select(WeeklyReview).where(
            WeeklyReview.user_id == user.id,
            WeeklyReview.week_start == week_start,
        )
    )
    review = review_result.scalar_one_or_none()

    # Active experiments
    exp_result = await db.execute(
        select(Experiment).where(
            Experiment.user_id == user.id,
            Experiment.status.in_(["planned", "in_progress"]),
        ).limit(5)
    )
    experiments = exp_result.scalars().all()

    # Personal context
    ctx_result = await db.execute(
        select(PersonalContext).where(PersonalContext.user_id == user.id)
    )
    context = ctx_result.scalar_one_or_none()

    # Streak: single query for last N days, then count in Python
    lookback_start = today - timedelta(days=_STREAK_LOOKBACK)
    dates_result = await db.execute(
        select(DailyCheckin.entry_date).where(
            DailyCheckin.user_id == user.id,
            DailyCheckin.entry_date >= lookback_start,
            DailyCheckin.entry_date <= today,
        )
    )
    checkin_dates: set[date] = {row[0] for row in dates_result.all()}
    streak = _calculate_streak(checkin_dates, today)

    return TodayResponse(
        today_date=today,
        checkin=checkin,
        current_week=review,
        active_experiments=list(experiments),
        context=context,
        streak_days=streak,
    )
