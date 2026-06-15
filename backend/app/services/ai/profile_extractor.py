"""AI profile extraction service.

Accepts free-form text written by the user (e.g. copy-pasted from an external
therapy chat or self-reflection document) and uses AI to extract a structured
PersonalContext record.

Flow:
1. Receive raw_text from the router.
2. Build the extraction prompt.
3. Call openrouter_client.complete().
4. Parse the JSON response.
5. Upsert PersonalContext for the user: update if exists, create if not.
6. Return the upserted PersonalContext ORM object.

Raises:
- AIServiceError  — propagated from openrouter_client.
- json.JSONDecodeError — if the AI response is not valid JSON.
"""
from __future__ import annotations

import json
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.personal_context import PersonalContext
from app.services.ai.openrouter_client import complete
from app.services.ai.prompt_builder import build_profile_extraction_prompt

log = logging.getLogger(__name__)


async def extract_profile(
    raw_text: str,
    user_id: int,
    db: AsyncSession,
) -> PersonalContext:
    """Extract and upsert a PersonalContext from the user's raw text.

    Returns the (possibly newly created) PersonalContext ORM object.
    """
    # Build prompt and call AI
    messages = build_profile_extraction_prompt(raw_text)
    completion = await complete(
        messages,
        db=db,
        user_id=user_id,
        action="profile_extraction",
        temperature=0.3,   # low temperature: we want deterministic field extraction
        max_tokens=800,
    )

    # Parse JSON
    raw = completion.text.strip()
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1].removeprefix("json").strip()
    data: dict = json.loads(raw)

    # Upsert PersonalContext
    result = await db.execute(
        select(PersonalContext).where(PersonalContext.user_id == user_id)
    )
    ctx = result.scalar_one_or_none()

    if ctx is None:
        ctx = PersonalContext(user_id=user_id)
        db.add(ctx)

    # Map extracted fields — only overwrite non-null values from AI
    if data.get("old_core_belief"):
        ctx.old_core_belief = data["old_core_belief"]
    if data.get("new_core_belief"):
        ctx.new_core_belief = data["new_core_belief"]
    if data.get("personal_triggers"):
        ctx.personal_triggers = data["personal_triggers"]
    if data.get("strengths"):
        ctx.strengths = data["strengths"]
    if data.get("grounding_phrases"):
        ctx.grounding_phrases = data["grounding_phrases"]
    if data.get("therapy_goals"):
        ctx.therapy_goals = data["therapy_goals"]
    if data.get("ai_context_note"):
        ctx.ai_context_note = data["ai_context_note"]

    await db.commit()
    await db.refresh(ctx)

    log.info(
        "PersonalContext upserted for user_id=%s via profile extraction (tokens: %s+%s)",
        user_id,
        completion.prompt_tokens,
        completion.completion_tokens,
    )
    return ctx
