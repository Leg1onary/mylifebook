"""OpenRouter API client for AI-powered weekly insights."""
import json
from datetime import timedelta

import httpx

from app.config import get_settings
from app.models.weekly_review import WeeklyReview
from app.models.daily_checkin import DailyCheckin
from app.models.thought_record import ThoughtRecord
from app.models.personal_context import PersonalContext
from app.models.user import User

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def _build_prompt(
    user: User,
    review: WeeklyReview,
    checkins: list[DailyCheckin],
    thoughts: list[ThoughtRecord],
    context: PersonalContext | None,
) -> str:
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
        f"старая схема: {'да' if c.old_script_triggered else 'нет'}, "
        f"устоял: {'да' if c.old_script_resisted else 'нет'}"
        for c in checkins
    )

    thought_lines = "\n".join(
        f"- Ситуация: {t.situation[:150]}... | Мысль: {t.automatic_thought[:150]}..."
        for t in thoughts[:5]
    )

    return f"""Ты — тёплый, прямой психолог-помощник. Проанализируй неделю пользователя и дай честный, конкретный обзор без шаблонных фраз.

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


async def generate_weekly_insights(
    user: User,
    review: WeeklyReview,
    checkins: list[DailyCheckin],
    thoughts: list[ThoughtRecord],
    context: PersonalContext | None,
) -> dict:
    """Call OpenRouter and return parsed {insights, patterns, suggestions}."""
    settings = get_settings()
    prompt = _build_prompt(user, review, checkins, thoughts, context)

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

    raw: str = resp.json()["choices"][0]["message"]["content"]
    if "```" in raw:
        raw = raw.split("```")[1].removeprefix("json").strip()
    return json.loads(raw)
