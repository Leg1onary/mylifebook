"""AI weekly summary service.

Writes result to WeeklyReview.ai_insights (existing column).
Also populates ai_patterns and ai_suggestions from the parsed response.
"""
from __future__ import annotations

import json
import logging
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.daily_checkin import DailyCheckin
from app.models.personal_context import PersonalContext
from app.models.weekly_review import WeeklyReview
from app.services.ai.openrouter_client import complete
from app.services.ai.prompt_builder import build_weekly_summary_prompt

log = logging.getLogger(__name__)


async def generate_summary(
    week_start: date,
    user_id: int,
    db: AsyncSession,
) -> dict:
    """Generate and persist AI weekly summary for the given week_start.

    Creates a WeeklyReview row if one does not already exist.
    Returns the parsed AI response dict.
    """
    week_end = week_start + timedelta(days=6)

    result = await db.execute(
        select(WeeklyReview).where(
            WeeklyReview.user_id == user_id,
            WeeklyReview.week_start == week_start,
        )
    )
    review = result.scalar_one_or_none()
    if review is None:
        review = WeeklyReview(
            user_id=user_id,
            week_start=week_start,
            week_end=week_end,
        )
        db.add(review)
        await db.flush()

    ci_result = await db.execute(
        select(DailyCheckin).where(
            DailyCheckin.user_id == user_id,
            DailyCheckin.entry_date >= week_start,
            DailyCheckin.entry_date <= week_end,
        ).order_by(DailyCheckin.entry_date)
    )
    checkins = list(ci_result.scalars().all())

    ctx_result = await db.execute(
        select(PersonalContext).where(PersonalContext.user_id == user_id)
    )
    ctx = ctx_result.scalar_one_or_none()

    messages = build_weekly_summary_prompt(review, checkins, ctx)
    completion = await complete(
        messages,
        db=db,
        user_id=user_id,
        action="weekly_summary",
        max_tokens=1000,
    )

    raw = completion.text.strip()
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1].removeprefix("json").strip()
    parsed: dict = json.loads(raw)

    # Persist to existing WeeklyReview columns
    review.ai_insights = parsed.get("summary", "")
    review.ai_patterns = parsed.get("dominant_patterns", [])
    review.ai_suggestions = parsed.get("questions_for_next_week", [])
    await db.commit()
    await db.refresh(review)

    log.info(
        "Weekly summary saved for week_start=%s user_id=%s (tokens: %s+%s)",
        week_start, user_id,
        completion.prompt_tokens,
        completion.completion_tokens,
    )
    return parsed
