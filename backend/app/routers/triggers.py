from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.trigger_event import TriggerEvent
from app.schemas.trigger_event import TriggerEventCreate, TriggerEventOut
from app.schemas.common import PaginatedResponse

router = APIRouter()


@router.post("/", response_model=TriggerEventOut, status_code=status.HTTP_201_CREATED)
async def log_trigger(
    payload: TriggerEventCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    event = TriggerEvent(user_id=user.id, **payload.model_dump())
    db.add(event)
    await db.flush()
    return event


@router.get("/", response_model=PaginatedResponse[TriggerEventOut])
async def list_triggers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(TriggerEvent).where(TriggerEvent.user_id == user.id)
    if category:
        q = q.where(TriggerEvent.category == category)

    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
    q = q.order_by(TriggerEvent.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    items = (await db.execute(q)).scalars().all()

    return PaginatedResponse(items=items, total=total, page=page, per_page=per_page,
                             has_next=(page * per_page) < total)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trigger(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(TriggerEvent).where(TriggerEvent.id == event_id, TriggerEvent.user_id == user.id)
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Trigger event not found")
    await db.delete(event)
