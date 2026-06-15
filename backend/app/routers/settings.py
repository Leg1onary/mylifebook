"""User notification / app settings endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.user_settings import UserSettings

router = APIRouter()


class SettingsOut(BaseModel):
    model_config = {"from_attributes": True}

    daily_reminder_enabled: bool
    daily_reminder_time: str  # "HH:MM"
    weekly_review_day: int    # 0=Mon … 6=Sun
    push_token: str | None
    theme: str
    language: str


class SettingsUpdate(BaseModel):
    daily_reminder_enabled: bool | None = None
    daily_reminder_time: str | None = Field(None, pattern=r"^\d{2}:\d{2}$")
    weekly_review_day: int | None = Field(None, ge=0, le=6)
    push_token: str | None = None
    theme: str | None = Field(None, pattern=r"^(light|dark|system)$")
    language: str | None = Field(None, max_length=10)


@router.get("/", response_model=SettingsOut)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(UserSettings).where(UserSettings.user_id == user.id)
    )
    s = result.scalar_one_or_none()
    if not s:
        s = UserSettings(user_id=user.id)
        db.add(s)
        await db.flush()
    return s


@router.patch("/", response_model=SettingsOut)
async def update_settings(
    payload: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(UserSettings).where(UserSettings.user_id == user.id)
    )
    s = result.scalar_one_or_none()
    if not s:
        s = UserSettings(user_id=user.id)
        db.add(s)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(s, field, value)
    await db.flush()
    return s
