"""Prompt construction for all AI tasks in MyLifeBook.

Each builder function returns a list[dict] of messages ready to pass
directly to openrouter_client.complete().

Rules (from ТЗ §10.3 and docs/prompts/):
- AI speaks in Russian, calmly and concretely.
- No motivational saccharine, no infantile tone, no therapy water.
- Responses must be structured JSON so the caller can parse them reliably.
- Personal context is always injected when available to personalise output.
- Text fields are truncated to avoid hitting token limits:
    • individual text field → max 600 chars
    • list items (evidence, distortions) → max 3 items × 300 chars each
"""
from __future__ import annotations

from app.models.personal_context import PersonalContext
from app.models.thought_record import ThoughtRecord
from app.models.daily_checkin import DailyCheckin
from app.models.weekly_review import WeeklyReview

_TRUNC = 600   # max chars per text field sent to AI
_LIST_MAX = 3  # max items from JSONB list fields


def _t(value: str | None, limit: int = _TRUNC) -> str:
    """Truncate a nullable string to `limit` chars; return empty string if None."""
    if not value:
        return ""
    return value[:limit] + ("…" if len(value) > limit else "")


def _context_block(ctx: PersonalContext | None) -> str:
    """Format personal context as a compact block for injection into prompts."""
    if ctx is None:
        return "Персональный контекст пользователя не заполнен."

    triggers = ", ".join((ctx.personal_triggers or [])[:5]) or "—"
    strengths = ", ".join((ctx.strengths or [])[:3]) or "—"
    grounding = " | ".join((ctx.grounding_phrases or [])[:3]) or "—"

    parts = [
        f"Старый закон / глубинное убеждение: {_t(ctx.old_core_belief) or '—'}",
        f"Новый закон / альтернативное убеждение: {_t(ctx.new_core_belief) or '—'}",
        f"Личные триггеры: {triggers}",
        f"Сильные стороны: {strengths}",
        f"Стоп-фразы / заземление: {grounding}",
        f"Цели терапии: {_t(ctx.therapy_goals) or '—'}",
        f"Дополнительный контекст для AI: {_t(ctx.ai_context_note) or '—'}",
    ]
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Reframing prompt
# ---------------------------------------------------------------------------

SYSTEM_REFRAME = """Ты — спокойный, прямой помощник по когнитивно-поведенческой терапии.
Твоя задача: помочь пользователю переосмыслить автоматическую мысль.

Правила:
- Говори на русском языке.
- Не употребляй мотивационных клише («всё будет хорошо», «ты молодец»).
- Будь конкретным: ссылайся на детали ситуации и записи пользователя.
- Не ставь диагнозов и не давай клинических рекомендаций.
- Отвечай строго в JSON-формате, указанном в запросе."""


def build_reframe_prompt(
    thought: ThoughtRecord,
    ctx: PersonalContext | None,
) -> list[dict[str, str]]:
    """Build messages for AI-assisted cognitive reframe of a ThoughtRecord.

    Expected AI response (JSON):
    {
      "reframe": "<3-4 sentence personalised reframe>",
      "cognitive_distortions": ["<distortion 1>", ...],
      "old_law_spotted": "<which core belief was triggered>",
      "alternative_thought": "<honest, balanced reformulation>",
      "suggested_action": "<one concrete next step>"
    }
    """
    emotions_str = ""
    if thought.emotions:
        items = thought.emotions[:_LIST_MAX]
        emotions_str = ", ".join(
            f"{e.get('name', '?')} ({e.get('intensity', '?')}/10)"
            for e in items
        )

    distortions_str = ""
    if thought.distortions:
        distortions_str = ", ".join(str(d) for d in thought.distortions[:_LIST_MAX])

    user_content = f"""Контекст пользователя:
{_context_block(ctx)}

--- Запись мысли ---
Ситуация: {_t(thought.situation)}
Автоматическая мысль: {_t(thought.automatic_thought)}
Эмоции: {emotions_str or '—'}
Искажения (выбранные пользователем): {distortions_str or '—'}
Доказательства ЗА мысль: {_t(thought.evidence_for)}
Доказательства ПРОТИВ мысли: {_t(thought.evidence_against)}
Альтернативная мысль (версия пользователя): {_t(thought.alternative_thought)}
Импульс к действию: {_t(thought.behavioral_impulse)}

Ответь строго в JSON:
{{
  "reframe": "<3-4 предложения — твой персональный разбор этой мысли>",
  "cognitive_distortions": ["<когнитивное искажение 1>", "<искажение 2>"],
  "old_law_spotted": "<какой старый закон здесь активировался>",
  "alternative_thought": "<честная, более устойчивая формулировка мысли>",
  "suggested_action": "<одно конкретное новое действие>"
}}"""

    return [
        {"role": "system", "content": SYSTEM_REFRAME},
        {"role": "user", "content": user_content},
    ]


# ---------------------------------------------------------------------------
# Weekly summary prompt
# ---------------------------------------------------------------------------

SYSTEM_WEEKLY = """Ты — спокойный, прямой аналитик-помощник.
Твоя задача: проанализировать неделю пользователя и дать честный, конкретный обзор.

Правила:
- Говори на русском языке.
- Не употребляй пустых мотивационных фраз.
- Опирайся на конкретные данные из записей.
- Не ставь диагнозов.
- Отвечай строго в JSON-формате, указанном в запросе."""


def build_weekly_summary_prompt(
    review: WeeklyReview,
    checkins: list[DailyCheckin],
    ctx: PersonalContext | None,
) -> list[dict[str, str]]:
    """Build messages for AI weekly summary.

    Expected AI response (JSON):
    {
      "summary": "<3-4 sentence honest overview of the week>",
      "dominant_patterns": ["<pattern 1>", "<pattern 2>"],
      "progress_signs": ["<sign 1>", ...],
      "questions_for_next_week": ["<question 1>", "<question 2>", "<question 3>"]
    }
    """
    checkin_lines = "\n".join(
        f"  {c.entry_date}: настроение {c.mood}/10, тревога {c.anxiety}/10, "
        f"стыд {c.shame}/10, одиночество {c.loneliness}/10"
        for c in checkins[:7]
    ) or "  нет данных"

    user_content = f"""Контекст пользователя:
{_context_block(ctx)}

--- Данные недели ({review.week_start}) ---
Среднее настроение: {review.avg_mood:.1f}/10
Средняя энергия: {review.avg_energy:.1f}/10
Средняя тревога: {review.avg_anxiety:.1f}/10
Средний стыд: {review.avg_shame:.1f}/10
Чекинов за неделю: {review.checkins_count}/7
Старая схема сработала: {review.old_script_triggered_days} дн.
Устоял перед старой схемой: {review.old_script_resisted_days} дн.
Зафиксировано триггеров: {review.trigger_events_count}

Ежедневные показатели:
{checkin_lines}

Ответь строго в JSON:
{{
  "summary": "<3-4 предложения честного разбора недели>",
  "dominant_patterns": ["<повторяющийся паттерн 1>", "<паттерн 2>"],
  "progress_signs": ["<признак прогресса 1>", "<признак 2>"],
  "questions_for_next_week": ["<вопрос 1>", "<вопрос 2>", "<вопрос 3>"]
}}"""

    return [
        {"role": "system", "content": SYSTEM_WEEKLY},
        {"role": "user", "content": user_content},
    ]


# ---------------------------------------------------------------------------
# Profile extraction prompt
# ---------------------------------------------------------------------------

SYSTEM_EXTRACT = """Ты — аналитик, который извлекает психологический профиль из текста.
Отвечай строго в JSON-формате, указанном в запросе. Не добавляй пояснений вне JSON."""


def build_profile_extraction_prompt(raw_text: str) -> list[dict[str, str]]:
    """Build messages to extract structured PersonalContext from free text.

    Expected AI response (JSON):
    {
      "old_core_belief": "<string or null>",
      "new_core_belief": "<string or null>",
      "personal_triggers": ["<trigger 1>", ...],
      "strengths": ["<strength 1>", ...],
      "grounding_phrases": ["<phrase 1>", ...],
      "therapy_goals": "<string or null>",
      "ai_context_note": "<any extra notes for AI>"
    }
    """
    truncated = raw_text[:3000] + ("…" if len(raw_text) > 3000 else "")

    user_content = f"""Извлеки структурированный психологический профиль из следующего текста.
Если информация по какому-то полю отсутствует — верни null для строк и [] для списков.

Текст:
{truncated}

Ответь строго в JSON:
{{
  "old_core_belief": "<глубинное старое убеждение или null>",
  "new_core_belief": "<альтернативное новое убеждение или null>",
  "personal_triggers": ["<триггер 1>", "<триггер 2>"],
  "strengths": ["<сильная сторона 1>", "<сильная сторона 2>"],
  "grounding_phrases": ["<стоп-фраза 1>", "<стоп-фраза 2>"],
  "therapy_goals": "<цели работы над собой или null>",
  "ai_context_note": "<дополнительные заметки для AI или null>"
}}"""

    return [
        {"role": "system", "content": SYSTEM_EXTRACT},
        {"role": "user", "content": user_content},
    ]
