"""Weekly review endpoints."""
from datetime import date, datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, Integer

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.daily_checkin import DailyCheckin
from app.models.trigger_event import TriggerEvent
from app.models.experiment import Experiment
from app.models.weekly_review import WeeklyReview
from app.schemas.weekly_review import WeeklyReviewOut, WeeklyReviewUpdate
from app.schemas.common import PaginatedResponse

router = APIRouter()


def _week_bounds(d: date) -> tuple[date, date]:
    """Return ISO week Monday and Sunday for the given date."""
    week_start = d - timedelta(days=d.weekday())
    week_end = week_start + timedelta(days=6)
    return week_start, week_end


def _day_bounds(d: date) -> tuple[datetime, datetime]:
    """Return timezone-aware start/end of day for DateTime comparisons."""
    start = datetime(d.year, d.month, d.day, tzinfo=timezone.utc)
    end = datetime(d.year, d.month, d.day, 23, 59, 59, 999999, tzinfo=timezone.utc)
    return start, end


def _week_dt_bounds(week_start: date, week_end: date) -> tuple[datetime, datetime]:
    """Timezone-aware DateTime bounds covering the full week."""
    start = datetime(week_start.year, week_start.month, week_start.day, tzinfo=timezone.utc)
    end = datetime(week_end.year, week_end.month, week_end.day, 23, 59, 59, 999999, tzinfo=timezone.utc)
    return start, end


async def _build_review(
    db: AsyncSession,
    user_id: int,
    week_start: date,
    week_end: date,
) -> WeeklyReview:
    """Build or refresh a WeeklyReview aggregate from raw data."""
    # DailyCheckin uses Date column — compare directly with date
    agg = await db.execute(
        select(
            func.avg(DailyCheckin.mood).label("avg_mood"),
            func.avg(DailyCheckin.energy).label("avg_energy"),
            func.avg(DailyCheckin.anxiety).label("avg_anxiety"),
            func.count(DailyCheckin.id).label("checkins_count"),
            func.sum(DailyCheckin.old_script_triggered.cast(Integer)).label("triggered_days"),
            func.sum(DailyCheckin.old_script_resisted.cast(Integer)).label("resisted_days"),
        ).where(
            DailyCheckin.user_id == user_id,
            DailyCheckin.entry_date >= week_start,
            DailyCheckin.entry_date <= week_end,
        )
    )
    row = agg.one()

    # TriggerEvent and Experiment use DateTime — use explicit tz-aware bounds
    dt_start, dt_end = _week_dt_bounds(week_start, week_end)

    trigger_count = (
        await db.execute(
            select(func.count(TriggerEvent.id)).where(
                TriggerEvent.user_id == user_id,
                TriggerEvent.created_at >= dt_start,
                TriggerEvent.created_at <= dt_end,
            )
        )
    ).scalar_one()

    experiments_done = (
        await db.execute(
            select(func.count(Experiment.id)).where(
                Experiment.user_id == user_id,
                Experiment.status == "completed",
                Experiment.updated_at >= dt_start,
                Experiment.updated_at <= dt_end,
            )
        )
    ).scalar_one()

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


@router.get("/current", response_model=WeeklyReviewOut)
async def get_current_week(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    week_start, week_end = _week_bounds(date.today())
    review = await _build_review(db, user.id, week_start, week_end)
    return review


@router.get("/", response_model=PaginatedResponse[WeeklyReviewOut])
async def list_reviews(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=52),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(WeeklyReview).where(WeeklyReview.user_id == user.id)
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
    q = q.order_by(WeeklyReview.week_start.desc()).offset((page - 1) * per_page).limit(per_page)
    items = (await db.execute(q)).scalars().all()
    return PaginatedResponse(items=items, total=total, page=page, per_page=per_page,
                             has_next=(page * per_page) < total)


@router.get("/{week_start}", response_model=WeeklyReviewOut)
async def get_week(
    week_start: date,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _, week_end = _week_bounds(week_start)
    return await _build_review(db, user.id, week_start, week_end)


@router.patch("/{week_start}", response_model=WeeklyReviewOut)
async def update_review(
    week_start: date,
    payload: WeeklyReviewUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(WeeklyReview).where(
            WeeklyReview.user_id == user.id, WeeklyReview.week_start == week_start
        )
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Weekly review not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(review, field, value)
    return review
