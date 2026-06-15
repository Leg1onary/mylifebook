"""AI-assisted cognitive reframing service.

Flow:
1. Load ThoughtRecord + PersonalContext for the requesting user.
2. Build the reframe prompt via prompt_builder.
3. Call openrouter_client.complete().
4. Parse the JSON response.
5. Persist the result to ThoughtRecord.ai_reframe (JSONB column).
6. Return the parsed dict to the caller (router).

The service raises:
- ValueError  — if the thought record does not belong to the user, or is not
                 found, or has no automatic_thought (nothing to reframe).
- AIServiceError — propagated from openrouter_client on HTTP/parse failures.
"""
from __future__ import annotations

import json
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.thought_record import ThoughtRecord
from app.models.personal_context import PersonalContext
from app.services.ai.openrouter_client import complete, AIServiceError
from app.services.ai.prompt_builder import build_reframe_prompt

log = logging.getLogger(__name__)

_CRISIS_PHRASES = [
    "не хочу жить", "хочу умереть", "суицид", "покончить с собой",
    "убить себя", "нет смысла жить", "жить незачем",
]

CRISIS_RESPONSE = {
    "crisis": True,
    "message": (
        "Это звучит как очень тяжёлый момент. "
        "Пожалуйста, позвони на телефон доверия: 8-800-2000-122 (бесплатно, РФ). "
        "AI-разбор сейчас недоступен — важно поговорить с живым человеком."
    ),
}


def _detect_crisis(text: str | None) -> bool:
    if not text:
        return False
    lower = text.lower()
    return any(phrase in lower for phrase in _CRISIS_PHRASES)


async def reframe(
    thought_record_id: int,
    user_id: int,
    db: AsyncSession,
) -> dict:
    """Generate and persist AI reframe for a ThoughtRecord.

    Returns a dict that is safe to return directly as the API response.
    """
    # Load thought record
    result = await db.execute(
        select(ThoughtRecord).where(
            ThoughtRecord.id == thought_record_id,
            ThoughtRecord.user_id == user_id,
        )
    )
    thought = result.scalar_one_or_none()
    if thought is None:
        raise ValueError(f"ThoughtRecord {thought_record_id} not found for user {user_id}")
    if not thought.automatic_thought:
        raise ValueError("Cannot reframe: automatic_thought is empty")

    # Crisis check — screen the key text fields before sending to AI
    texts_to_check = [
        thought.automatic_thought,
        thought.situation,
        thought.behavioral_impulse,
    ]
    if any(_detect_crisis(t) for t in texts_to_check):
        log.warning("Crisis flag detected for thought_record_id=%s", thought_record_id)
        return CRISIS_RESPONSE

    # Load personal context (may be None)
    ctx_result = await db.execute(
        select(PersonalContext).where(PersonalContext.user_id == user_id)
    )
    ctx = ctx_result.scalar_one_or_none()

    # Build prompt and call AI
    messages = build_reframe_prompt(thought, ctx)
    completion = await complete(
        messages,
        db=db,
        user_id=user_id,
        action="reframe",
        max_tokens=900,
    )

    # Parse JSON response (strip markdown code fences if present)
    raw = completion.text.strip()
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1].removeprefix("json").strip()
    parsed: dict = json.loads(raw)

    # Persist reframe result back to the thought record
    thought.ai_reframe = parsed
    await db.commit()
    await db.refresh(thought)

    log.info(
        "Reframe saved for thought_record_id=%s (tokens: %s+%s)",
        thought_record_id,
        completion.prompt_tokens,
        completion.completion_tokens,
    )
    return parsed
