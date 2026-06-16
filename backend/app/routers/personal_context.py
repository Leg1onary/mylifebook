from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.personal_context import PersonalContext
from app.schemas.personal_context import PersonalContextUpdate, PersonalContextOut
from app.services.ai.profile_extractor import extract_profile
from app.config import get_settings

router = APIRouter()
settings = get_settings()


class RawTextInput(BaseModel):
    text: str


@router.get("/", response_model=PersonalContextOut)
async def get_context(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PersonalContext).where(PersonalContext.user_id == user.id)
    )
    ctx = result.scalar_one_or_none()
    if not ctx:
        raise HTTPException(status_code=404, detail="Context not found")
    return ctx


@router.patch("/", response_model=PersonalContextOut)
async def update_context(
    payload: PersonalContextUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PersonalContext).where(PersonalContext.user_id == user.id)
    )
    ctx = result.scalar_one_or_none()
    if not ctx:
        ctx = PersonalContext(user_id=user.id)
        db.add(ctx)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(ctx, field, value)
    await db.flush()
    return ctx


@router.post("/raw", response_model=PersonalContextOut)
async def upload_raw_text(
    payload: RawTextInput,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Accept freeform text (e.g. pasted therapy notes, journal entry, markdown).
    AI extracts structured fields and merges them into the user's PersonalContext.
    Existing fields are overwritten only if the AI returns a non-null value.
    """
    if not settings.openrouter_api_key:
        raise HTTPException(status_code=503, detail="AI service not configured")

    if len(payload.text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Text is too short to extract meaningful context")

    # extract_profile handles upsert internally — just return the result
    ctx = await extract_profile(
        raw_text=payload.text,
        user_id=user.id,
        db=db,
    )
    return ctx
