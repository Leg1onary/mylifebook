"""AI endpoints.

Existing (unchanged behaviour):
  POST /weekly-insights   — inline prompt, returns WeeklyReviewOut
  POST /reframe           — inline prompt, returns ReframeResponse (quick thought reframe)

New (use service layer):
  POST /reframe/{thought_record_id}  — full reframe of a saved ThoughtRecord
  POST /weekly-summary               — weekly summary via weekly_summary_service
  POST /extract-profile              — extract PersonalContext from raw text
"""
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
from app.services.ai.reframing_service import reframe as svc_reframe, AIServiceError
from app.services.ai.weekly_summary_service import generate_summary as svc_weekly_summary
from app.services.ai.profile_extractor import extract_profile as svc_extract_profile

router = APIRouter()
settings = get_settings()

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
_HEADERS = {
    "HTTP-Referer": "https://mylifebook.ru",
    "X-Title": "MyLifeBook",
}


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class AIInsightRequest(BaseModel):
    week_start: date


class ReframeRequest(BaseModel):
    automatic_thought: str
    situation: str | None = None
    distortions: list[str] | None = None


class ReframeResponse(BaseModel):
    alternative_thought: str
    rationale: str
    questions: list[str]


class WeeklySummaryRequest(BaseModel):
    week_start: date


class ExtractProfileRequest(BaseModel):
    raw_text: str


class PersonalContextOut(BaseModel):
    id: int
    old_core_belief: str | None
    new_core_belief: str | None
    personal_triggers: list | None
    strengths: list | None
    grounding_phrases: list | None
    therapy_goals: str | None
    ai_context_note: str | None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Helpers (legacy inline approach — kept for backward compat)
# ---------------------------------------------------------------------------

def _auth_headers() -> dict:
    return {**_HEADERS, "Authorization": f"Bearer {settings.openrouter_api_key}"}


async def _fetch_ai_insights(
    user: User, review: WeeklyReview, checkins: list, thoughts: list, context
) -> dict:
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
        f"- Ситуация: {t.situation[:150] if t.situation else '—'}... | Мысль: {t.automatic_thought[:150] if t.automatic_thought else '—'}..."
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
    payload = {
        "model": settings.openrouter_model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 800,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(OPENROUTER_URL, json=payload, headers=_auth_headers())
        resp.raise_for_status()
    raw = resp.json()["choices"][0]["message"]["content"]
    if "```" in raw:
        raw = raw.split("```")[1].removeprefix("json").strip()
    return json.loads(raw)


# ---------------------------------------------------------------------------
# Legacy endpoints (unchanged)
# ---------------------------------------------------------------------------

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
    checkins = (await db.execute(
        select(DailyCheckin).where(
            DailyCheckin.user_id == user.id,
            DailyCheckin.entry_date >= body.week_start,
            DailyCheckin.entry_date <= week_end,
        )
    )).scalars().all()
    thoughts = (await db.execute(
        select(ThoughtRecord).where(
            ThoughtRecord.user_id == user.id,
            ThoughtRecord.created_at >= body.week_start,
            ThoughtRecord.created_at <= week_end,
            ThoughtRecord.is_draft == False,  # noqa: E712
        ).limit(10)
    )).scalars().all()
    context = (await db.execute(
        select(PersonalContext).where(PersonalContext.user_id == user.id)
    )).scalar_one_or_none()
    result = await _fetch_ai_insights(user, review, checkins, thoughts, context)
    review.ai_insights = result.get("insights")
    review.ai_suggestions = result.get("suggestions", [])
    review.ai_patterns = result.get("patterns", [])
    await db.flush()
    return review


@router.post("/reframe", response_model=ReframeResponse)
async def reframe_thought(
    body: ReframeRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Quick inline reframe — does NOT require a saved ThoughtRecord."""
    if not settings.openrouter_api_key:
        raise HTTPException(status_code=503, detail="AI service not configured")
    distortions_block = ""
    if body.distortions:
        distortions_block = f"Определённые искажения: {', '.join(body.distortions)}\n"
    situation_block = ""
    if body.situation:
        situation_block = f"Ситуация: {body.situation}\n"
    prompt = f"""Ты — опытный CBT-терапевт. Помоги человеку переформулировать автоматическую мысль.
Будь прямым и тёплым. Не используй шаблонные аффирмации. Отвечай на русском.

{situation_block}Автоматическая мысль: "{body.automatic_thought}"
{distortions_block}
Ответь строго в JSON:
{{
  "alternative_thought": "альтернативная формулировка той же ситуации",
  "rationale": "1-2 предложения: почему эта мысль более точная",
  "questions": ["сократовский вопрос 1", "сократовский вопрос 2", "сократовский вопрос 3"]
}}"""
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            OPENROUTER_URL,
            json={
                "model": settings.openrouter_model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.6,
                "max_tokens": 400,
            },
            headers=_auth_headers(),
        )
        resp.raise_for_status()
    raw = resp.json()["choices"][0]["message"]["content"]
    if "```" in raw:
        raw = raw.split("```")[1].removeprefix("json").strip()
    data = json.loads(raw)
    return ReframeResponse(
        alternative_thought=data["alternative_thought"],
        rationale=data["rationale"],
        questions=data.get("questions", []),
    )


# ---------------------------------------------------------------------------
# New endpoints — service layer
# ---------------------------------------------------------------------------

@router.post("/reframe/{thought_record_id}")
async def reframe_thought_record(
    thought_record_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Full AI reframe of a saved ThoughtRecord. Persists result to ai_reframe.

    Returns the reframe dict (may include crisis flag if crisis detected).
    """
    if not settings.openrouter_api_key:
        raise HTTPException(status_code=503, detail="AI service not configured")
    try:
        return await svc_reframe(thought_record_id, user.id, db)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=f"AI error: {exc}")


@router.post("/weekly-summary")
async def weekly_summary(
    body: WeeklySummaryRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Generate AI weekly summary via service layer.

    Creates WeeklyReview if absent. Persists summary to ai_insights / ai_patterns.
    Returns parsed AI response dict.
    """
    if not settings.openrouter_api_key:
        raise HTTPException(status_code=503, detail="AI service not configured")
    try:
        return await svc_weekly_summary(body.week_start, user.id, db)
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=f"AI error: {exc}")


@router.post("/extract-profile", response_model=PersonalContextOut)
async def extract_profile(
    body: ExtractProfileRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Extract structured PersonalContext from free-form text.

    Upserts PersonalContext for the user — only overwrites non-null AI fields.
    Returns the updated PersonalContext.
    """
    if not settings.openrouter_api_key:
        raise HTTPException(status_code=503, detail="AI service not configured")
    if not body.raw_text.strip():
        raise HTTPException(status_code=422, detail="raw_text cannot be empty")
    try:
        ctx = await svc_extract_profile(body.raw_text, user.id, db)
        return ctx
    except (json.JSONDecodeError, KeyError) as exc:
        raise HTTPException(status_code=502, detail=f"AI returned invalid JSON: {exc}")
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=f"AI error: {exc}")
