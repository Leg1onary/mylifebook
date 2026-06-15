from datetime import datetime, date
from pydantic import BaseModel, Field


class DailyCheckinCreate(BaseModel):
    entry_date: date

    # Основные шкалы 1–10
    mood: int = Field(..., ge=1, le=10)
    energy: int = Field(..., ge=1, le=10)
    anxiety: int = Field(0, ge=0, le=10)
    emptiness: int = Field(0, ge=0, le=10)
    anger: int = Field(0, ge=0, le=10)
    shame: int = Field(0, ge=0, le=10)

    # Контекст дня
    sleep_hours: float | None = Field(None, ge=0, le=24)
    social_contact: int = Field(0, ge=0, le=10)
    old_script_triggered: bool = False
    old_script_resisted: bool = False

    # Свободный текст
    what_hurts: str | None = Field(None, max_length=2000)
    what_was_good: str | None = Field(None, max_length=2000)
    note: str | None = Field(None, max_length=2000)


class DailyCheckinUpdate(BaseModel):
    mood: int | None = Field(None, ge=1, le=10)
    energy: int | None = Field(None, ge=1, le=10)
    anxiety: int | None = Field(None, ge=0, le=10)
    emptiness: int | None = Field(None, ge=0, le=10)
    anger: int | None = Field(None, ge=0, le=10)
    shame: int | None = Field(None, ge=0, le=10)
    sleep_hours: float | None = Field(None, ge=0, le=24)
    social_contact: int | None = Field(None, ge=0, le=10)
    old_script_triggered: bool | None = None
    old_script_resisted: bool | None = None
    what_hurts: str | None = Field(None, max_length=2000)
    what_was_good: str | None = Field(None, max_length=2000)
    note: str | None = Field(None, max_length=2000)


class DailyCheckinOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    user_id: int
    entry_date: date
    mood: int
    energy: int
    anxiety: int
    emptiness: int
    anger: int
    shame: int
    sleep_hours: float | None
    social_contact: int
    old_script_triggered: bool
    old_script_resisted: bool
    what_hurts: str | None
    what_was_good: str | None
    note: str | None
    created_at: datetime
    updated_at: datetime
