"""AI endpoints: weekly insight generation and thought reframing via OpenRouter."""
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
_HEADERS = {
    "HTTP-Referer": "https://mylifebook.ru",
    "X-Title": "MyLifeBook",
}


class AIInsightRequest(BaseModel):
    week_start: date


class ReframeRequest(BaseModel):
    automatic_thought: str
    situation: str | None = None
    distortions: list[str] | None = None


class ReframeResponse(BaseModel):
    alternative_thought: str
    rationale: str
    questions: list[str]  # Socratic questions to consider


def _auth_headers() -> dict:
    return {**_HEADERS, "Authorization": f"Bearer {settings.openrouter_api_key}"}


async def _fetch_ai_insights(
    user: User, review: WeeklyReview, checkins: list, thoughts: list, context
) -> dict:
    """Call OpenRouter and return parsed insight dict."""
    week_end = review.week_start + timedelta(days=6)

    context_block = ""
    if context:
        context_block = (
            f"\u0421\u0442\u0430\u0440\u043e\u0435 \u0443\u0431\u0435\u0436\u0434\u0435\u043d\u0438\u0435: {context.old_core_belief or '-'}\n"
            f"\u041d\u043e\u0432\u043e\u0435 \u0443\u0431\u0435\u0436\u0434\u0435\u043d\u0438\u0435: {context.new_core_belief or '-'}\n"
            f"\u041b\u0438\u0447\u043d\u044b\u0435 \u0442\u0440\u0438\u0433\u0433\u0435\u0440\u044b: {', '.join(context.personal_triggers or [])}\n"
        )

    checkin_lines = "\n".join(
        f"- {c.entry_date}: \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 {c.mood}/10, \u0442\u0440\u0435\u0432\u043e\u0433\u0430 {c.anxiety}/10, "
        f"\u0441\u0442\u0430\u0440\u0430\u044f \u0441\u0445\u0435\u043c\u0430 \u0441\u0440\u0430\u0431\u043e\u0442\u0430\u043b\u0430: {'\u0434\u0430' if c.old_script_triggered else '\u043d\u0435\u0442'}, "
        f"\u0443\u0441\u0442\u043e\u044f\u043b: {'\u0434\u0430' if c.old_script_resisted else '\u043d\u0435\u0442'}"
        for c in checkins
    )

    thought_lines = "\n".join(
        f"- \u0421\u0438\u0442\u0443\u0430\u0446\u0438\u044f: {t.situation[:150] if t.situation else '—'}... | \u041c\u044b\u0441\u043b\u044c: {t.automatic_thought[:150] if t.automatic_thought else '—'}..."
        for t in thoughts[:5]
    )

    prompt = f"""\u0422\u044b \u2014 \u0442\u0451\u043f\u043b\u044b\u0439, \u043f\u0440\u044f\u043c\u043e\u0439 \u043f\u0441\u0438\u0445\u043e\u043b\u043e\u0433-\u043f\u043e\u043c\u043e\u0449\u043d\u0438\u043a. \u041f\u0440\u043e\u0430\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0443\u0439 \u043d\u0435\u0434\u0435\u043b\u044e \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f \u0438 \u0434\u0430\u0439 \u0447\u0435\u0441\u0442\u043d\u044b\u0439, \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u044b\u0439 \u043e\u0431\u0437\u043e\u0440 \u0431\u0435\u0437 \u0448\u0430\u0431\u043b\u043e\u043d\u043d\u044b\u0445 \u0444\u0440\u0430\u0437.

\u041d\u0435\u0434\u0435\u043b\u044f: {review.week_start} \u2014 {week_end}
\u0421\u0440\u0435\u0434\u043d\u0438\u0435 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438: \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 {review.avg_mood:.1f}/10, \u044d\u043d\u0435\u0440\u0433\u0438\u044f {review.avg_energy:.1f}/10, \u0442\u0440\u0435\u0432\u043e\u0433\u0430 {review.avg_anxiety:.1f}/10
\u0427\u0435\u043a\u0438\u043d\u044b: {review.checkins_count} \u0438\u0437 7 \u0434\u043d\u0435\u0439
\u0421\u0442\u0430\u0440\u0430\u044f \u0441\u0445\u0435\u043c\u0430 \u0441\u0440\u0430\u0431\u043e\u0442\u0430\u043b\u0430: {review.old_script_triggered_days} \u0434\u043d\u0435\u0439, \u0443\u0441\u0442\u043e\u044f\u043b: {review.old_script_resisted_days} \u0434\u043d\u0435\u0439
\u0422\u0440\u0438\u0433\u0433\u0435\u0440\u044b \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u044b: {review.trigger_events_count}

\u041a\u043e\u043d\u0442\u0435\u043a\u0441\u0442 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f:
{context_block}

\u0415\u0436\u0435\u0434\u043d\u0435\u0432\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435:
{checkin_lines}

\u0417\u0430\u043f\u0438\u0441\u0438 \u043c\u044b\u0441\u043b\u0435\u0439:
{thought_lines}

\u041e\u0442\u0432\u0435\u0442\u044c \u0441\u0442\u0440\u043e\u0433\u043e \u0432 JSON:
{{
  "insights": "3-4 \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u044f \u0447\u0435\u0441\u0442\u043d\u043e\u0433\u043e \u0440\u0430\u0437\u0431\u043e\u0440\u0430 \u043d\u0435\u0434\u0435\u043b\u0438",
  "patterns": ["\u043f\u0430\u0442\u0442\u0435\u0440\u043d 1", "\u043f\u0430\u0442\u0442\u0435\u0440\u043d 2"],
  "suggestions": ["\u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u043e\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 1", "\u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u043e\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 2", "\u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u043e\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 3"]
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
        raise HTTPException(
            status_code=404,
            detail="Weekly review not found \u2014 generate it first via GET /weekly/{week_start}",
        )

    week_end = body.week_start + timedelta(days=6)

    checkins = (
        await db.execute(
            select(DailyCheckin).where(
                DailyCheckin.user_id == user.id,
                DailyCheckin.entry_date >= body.week_start,
                DailyCheckin.entry_date <= week_end,
            )
        )
    ).scalars().all()

    thoughts = (
        await db.execute(
            select(ThoughtRecord).where(
                ThoughtRecord.user_id == user.id,
                ThoughtRecord.created_at >= body.week_start,
                ThoughtRecord.created_at <= week_end,
                ThoughtRecord.is_draft == False,  # noqa: E712 — only completed records
            ).limit(10)
        )
    ).scalars().all()

    context = (
        await db.execute(
            select(PersonalContext).where(PersonalContext.user_id == user.id)
        )
    ).scalar_one_or_none()

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
    """AI-assisted reframing of an automatic thought.
    Returns an alternative thought, brief rationale, and Socratic questions.
    """
    if not settings.openrouter_api_key:
        raise HTTPException(status_code=503, detail="AI service not configured")

    distortions_block = ""
    if body.distortions:
        distortions_block = f"\u041e\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d\u043d\u044b\u0435 \u0438\u0441\u043a\u0430\u0436\u0435\u043d\u0438\u044f: {', '.join(body.distortions)}\n"

    situation_block = ""
    if body.situation:
        situation_block = f"\u0421\u0438\u0442\u0443\u0430\u0446\u0438\u044f: {body.situation}\n"

    prompt = f"""\u0422\u044b \u2014 \u043e\u043f\u044b\u0442\u043d\u044b\u0439 CBT-\u0442\u0435\u0440\u0430\u043f\u0435\u0432\u0442. \u041f\u043e\u043c\u043e\u0433\u0438 \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0443 \u043f\u0435\u0440\u0435\u0444\u043e\u0440\u043c\u0443\u043b\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0443\u044e \u043c\u044b\u0441\u043b\u044c.
\u0411\u0443\u0434\u044c \u043f\u0440\u044f\u043c\u044b\u043c \u0438 \u0442\u0451\u043f\u043b\u044b\u043c. \u041d\u0435 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439 \u0448\u0430\u0431\u043b\u043e\u043d\u043d\u044b\u0435 \u0430\u0444\u0444\u0438\u0440\u043c\u0430\u0446\u0438\u0438. \u041e\u0442\u0432\u0435\u0447\u0430\u0439 \u043d\u0430 \u0440\u0443\u0441\u0441\u043a\u043e\u043c.

{situation_block}\u0410\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u043c\u044b\u0441\u043b\u044c: \"{body.automatic_thought}\"
{distortions_block}
\u041e\u0442\u0432\u0435\u0442\u044c \u0441\u0442\u0440\u043e\u0433\u043e \u0432 JSON:
{{
  "alternative_thought": "\u0430\u043b\u044c\u0442\u0435\u0440\u043d\u0430\u0442\u0438\u0432\u043d\u0430\u044f \u0444\u043e\u0440\u043c\u0443\u043b\u0438\u0440\u043e\u0432\u043a\u0430 \u0442\u043e\u0439 \u0436\u0435 \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u0438",
  "rationale": "1-2 \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u044f: \u043f\u043e\u0447\u0435\u043c\u0443 \u044d\u0442\u0430 \u043c\u044b\u0441\u043b\u044c \u0431\u043e\u043b\u0435\u0435 \u0442\u043e\u0447\u043d\u0430\u044f",
  "questions": ["\u0441\u043e\u043a\u0440\u0430\u0442\u043e\u0432\u0441\u043a\u0438\u0439 \u0432\u043e\u043f\u0440\u043e\u0441 1", "\u0441\u043e\u043a\u0440\u0430\u0442\u043e\u0432\u0441\u043a\u0438\u0439 \u0432\u043e\u043f\u0440\u043e\u0441 2", "\u0441\u043e\u043a\u0440\u0430\u0442\u043e\u0432\u0441\u043a\u0438\u0439 \u0432\u043e\u043f\u0440\u043e\u0441 3"]
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
