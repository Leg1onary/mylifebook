from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.personal_context import PersonalContext
from app.schemas.personal_context import PersonalContextUpdate, PersonalContextOut

router = APIRouter()


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
