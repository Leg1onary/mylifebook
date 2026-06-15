"""AI weekly summary service.

Flow:
1. Load or create WeeklyReview for the given week_start.
2. Load DailyCheckins for the week.
3. Load PersonalContext.
4. Build the weekly summary prompt.
5. Call openrouter_client.complete().
6. Parse JSON response.
7. Persist ai_summary_text to WeeklyReview.
8. Return parsed dict.

Note: the legacy `openrouter.py` (generate_weekly_insights) remains in place
for backward compatibility. This service is the canonical implementation going
forward and adds full logging + PersonalContext awareness.
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
    """Generate and persist AI weekly summary.

    Creates a WeeklyReview row if one does not already exist for the given
    week_start. Returns the parsed AI response dict.
    """
    week_end = week_start + timedelta(days=6)

    # Load or create WeeklyReview
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
        await db.flush()  # assigns PK without full commit

    # Load checkins for the week
    ci_result = await db.execute(
        select(DailyCheckin).where(
            DailyCheckin.user_id == user_id,
            DailyCheckin.entry_date >= week_start,
            DailyCheckin.entry_date <= week_end,
        ).order_by(DailyCheckin.entry_date)
    )
    checkins = list(ci_result.scalars().all())

    # Load personal context
    ctx_result = await db.execute(
        select(PersonalContext).where(PersonalContext.user_id == user_id)
    )
    ctx = ctx_result.scalar_one_or_none()

    # Build prompt and call AI
    messages = build_weekly_summary_prompt(review, checkins, ctx)
    completion = await complete(
        messages,
        db=db,
        user_id=user_id,
        action="weekly_summary",
        max_tokens=1000,
    )

    # Parse JSON response
    raw = completion.text.strip()
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1].removeprefix("json").strip()
    parsed: dict = json.loads(raw)

    # Persist summary text to WeeklyReview
    review.ai_summary_text = parsed.get("summary", "")
    await db.commit()
    await db.refresh(review)

    log.info(
        "Weekly summary saved for week_start=%s user_id=%s (tokens: %s+%s)",
        week_start, user_id,
        completion.prompt_tokens,
        completion.completion_tokens,
    )
    return parsed
