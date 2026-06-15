"""Low-level async HTTP client for the OpenRouter API.

Responsibilities:
- Single async function `complete()` that sends a chat-completion request
  and returns the raw text response.
- Retry logic: transparent retry on 429 / 503 with exponential backoff
  (max 2 retries, 1 s / 2 s delays).
- Usage logging: writes a row to ai_logs after every call (success or error).
- Raises `AIServiceError` on non-retryable HTTP errors or JSON parse failures.

Does NOT know anything about prompts, domains, or business objects.
"""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from typing import Any

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.ai_log import AILog

log = logging.getLogger(__name__)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
_RETRY_STATUSES = {429, 503}
_MAX_RETRIES = 2
_BACKOFF_BASE = 1.0  # seconds


class AIServiceError(Exception):
    """Raised when OpenRouter call fails and cannot be retried."""


@dataclass
class CompletionResult:
    text: str
    model: str
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    cost_usd: str | None = None


async def complete(
    messages: list[dict[str, str]],
    *,
    db: AsyncSession,
    user_id: int,
    action: str,
    model: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 1000,
) -> CompletionResult:
    """Send a chat-completion request to OpenRouter and return parsed result.

    Args:
        messages:    List of {"role": ..., "content": ...} dicts.
        db:          SQLAlchemy async session for writing ai_logs.
        user_id:     ID of the current user (for audit log).
        action:      Short string label stored in ai_logs.action.
        model:       Override the model from settings (optional).
        temperature: Sampling temperature (default 0.7).
        max_tokens:  Maximum tokens in the completion (default 1000).

    Returns:
        CompletionResult with the raw text and token usage metadata.

    Raises:
        AIServiceError on failure.
    """
    settings = get_settings()
    chosen_model = model or settings.openrouter_model

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "HTTP-Referer": "https://mylifebook.ru",
        "X-Title": "MyLifeBook",
        "Content-Type": "application/json",
    }
    payload: dict[str, Any] = {
        "model": chosen_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    last_error: str | None = None

    for attempt in range(_MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(OPENROUTER_URL, json=payload, headers=headers)

            if resp.status_code in _RETRY_STATUSES and attempt < _MAX_RETRIES:
                wait = _BACKOFF_BASE * (2 ** attempt)
                log.warning(
                    "OpenRouter returned %s (attempt %d/%d), retrying in %.1fs",
                    resp.status_code, attempt + 1, _MAX_RETRIES, wait,
                )
                await asyncio.sleep(wait)
                continue

            resp.raise_for_status()

            body = resp.json()
            choice = body["choices"][0]["message"]["content"]
            usage = body.get("usage", {})

            result = CompletionResult(
                text=choice,
                model=chosen_model,
                prompt_tokens=usage.get("prompt_tokens"),
                completion_tokens=usage.get("completion_tokens"),
            )
            # Persist successful call
            await _write_log(db, user_id, action, chosen_model, result, error=None)
            return result

        except httpx.HTTPStatusError as exc:
            last_error = f"HTTP {exc.response.status_code}: {exc.response.text[:200]}"
            if exc.response.status_code not in _RETRY_STATUSES:
                break
        except (httpx.RequestError, KeyError, IndexError) as exc:
            last_error = str(exc)
            break

    # All retries exhausted or non-retryable error
    await _write_log(
        db, user_id, action, chosen_model,
        CompletionResult(text="", model=chosen_model),
        error=last_error,
    )
    raise AIServiceError(last_error or "Unknown OpenRouter error")


async def _write_log(
    db: AsyncSession,
    user_id: int,
    action: str,
    model: str,
    result: CompletionResult,
    error: str | None,
) -> None:
    """Persist an AI interaction row; never raises."""
    try:
        entry = AILog(
            user_id=user_id,
            action=action,
            model=model,
            prompt_tokens=result.prompt_tokens,
            completion_tokens=result.completion_tokens,
            cost_usd=result.cost_usd,
            error=error,
        )
        db.add(entry)
        await db.commit()
    except Exception:
        log.exception("Failed to write AI log entry — ignoring")
