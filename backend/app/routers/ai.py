"""AI endpoints — weekly insight generation via OpenRouter."""
import json
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx

from app.deps import get_db, get_current_user
from app.config import get_settings
from app.models.user import User
from app.models.weekly_review import WeeklyReview
from app.models.daily_checkin import DailyCheckin
from app.models.thought_record import ThoughtRecord
from app.models.personal_context import PersonalContext
from app.schemas.weekly_review import WeeklyReviewOut

router = APIRouter()
settings = get_settings()

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


class AIInsightRequest(BaseModel):
    week_start: date


async def _fetch_ai_insights(
    user: User, review: WeeklyReview, checkins: list, thoughts: list, context
) -> dict:
    """Call OpenRouter and return parsed insight dict."""
    week_end = review.week_start + timedelta(days=6)

    context_block = ""
    if context:
        context_block = (
            f"Старое убеждение: {context.old_core_belief or '-'}\n"
            f"Новое убеждение: {context.new_core_belief or '-'}\n"
            f"Личные триггеры: {', '.join(context.personal_triggers or [])}\n"
        )

    checkin_lines = "\n".join(
        f"- {c.entry_date}: настроение {c.mood}/10, тревога {c.anxiety}/10, "
        f"старая схема сработала: {'да' if c.old_script_triggered else 'нет'}, "
        f"устоял: {'да' if c.old_script_resisted else 'нет'}"
        for c in checkins
    )

    thought_lines = "\n".join(
        f"- Ситуация: {t.situation[:150]}... | Мысль: {t.automatic_thought[:150]}..."
        for t in thoughts[:5]
    )

    prompt = f"""Ты — тёплый, прямой психолог-помощник. Проанализируй неделю пользователя и дай честный, конкретный обзор без шаблонных фраз.

Неделя: {review.week_start} — {week_end}
Средние показатели: настроение {review.avg_mood:.1f}/10, энергия {review.avg_energy:.1f}/10, тревога {review.avg_anxiety:.1f}/10
Чекины: {review.checkins_count} из 7 дней
Старая схема сработала: {review.old_script_triggered_days} дней, устоял: {review.old_script_resisted_days} дней
Триггеры зафиксированы: {review.trigger_events_count}

Контекст пользователя:
{context_block}

Ежедневные данные:
{checkin_lines}

Записи мыслей:
{thought_lines}

Ответь строго в JSON:
{{
  "insights": "3-4 предложения честного разбора недели",
  "patterns": ["паттерн 1", "паттерн 2"],
  "suggestions": ["конкретное действие 1", "конкретное действие 2", "конкретное действие 3"]
}}"""

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "HTTP-Referer": "https://mylifebook.ru",
        "X-Title": "MyLifeBook",
    }
    payload = {
        "model": settings.openrouter_model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 800,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(OPENROUTER_URL, json=payload, headers=headers)
        resp.raise_for_status()

    raw = resp.json()["choices"][0]["message"]["content"]
    # Extract JSON block if wrapped in markdown code fences
    if "```" in raw:
        raw = raw.split("```")[1].removeprefix("json").strip()
    return json.loads(raw)


@router.post("/weekly-insights", response_model=WeeklyReviewOut)
async def generate_weekly_insights(
    body: AIInsightRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not settings.openrouter_api_key:
        raise HTTPException(status_code=503, detail="AI service not configured")

    review_result = await db.execute(
        select(WeeklyReview).where(
            WeeklyReview.user_id == user.id,
            WeeklyReview.week_start == body.week_start,
        )
    )
    review = review_result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Weekly review not found — generate it first via GET /weekly/{week_start}")

    week_end = body.week_start + timedelta(days=6)

    checkins_result = await db.execute(
        select(DailyCheckin).where(
            DailyCheckin.user_id == user.id,
            DailyCheckin.entry_date >= body.week_start,
            DailyCheckin.entry_date <= week_end,
        )
    )
    checkins = checkins_result.scalars().all()

    thoughts_result = await db.execute(
        select(ThoughtRecord).where(
            ThoughtRecord.user_id == user.id,
            ThoughtRecord.created_at >= body.week_start,
            ThoughtRecord.created_at <= week_end,
        ).limit(10)
    )
    thoughts = thoughts_result.scalars().all()

    context_result = await db.execute(
        select(PersonalContext).where(PersonalContext.user_id == user.id)
    )
    context = context_result.scalar_one_or_none()

    try:
        result = await _fetch_ai_insights(user, review, checkins, thoughts, context)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI generation failed: {str(e)}")

    from datetime import datetime, timezone
    review.ai_insights = result.get("insights")
    review.ai_patterns = [{"pattern": p} for p in result.get("patterns", [])]
    review.ai_suggestions = result.get("suggestions", [])
    review.ai_generated_at = datetime.now(timezone.utc)

    await db.flush()
    return review
