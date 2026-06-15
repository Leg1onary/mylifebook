from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.trigger_event import TriggerEvent
from app.schemas.trigger_event import TriggerEventCreate, TriggerEventUpdate, TriggerEventOut
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
    # aliases matching openapi-notes.md: from / to / limit
    from_: date | None = Query(None, alias="from"),
    to: date | None = Query(None),
    limit: int | None = Query(None, ge=1, le=365),
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(TriggerEvent).where(TriggerEvent.user_id == user.id)
    if from_:
        q = q.where(TriggerEvent.created_at >= from_)
    if to:
        q = q.where(TriggerEvent.created_at <= to)
    if category:
        q = q.where(TriggerEvent.category == category)

    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
    effective_limit = limit or per_page
    q = q.order_by(TriggerEvent.created_at.desc()).offset((page - 1) * effective_limit).limit(effective_limit)
    items = (await db.execute(q)).scalars().all()

    return PaginatedResponse(items=items, total=total, page=page, per_page=effective_limit,
                             has_next=(page * effective_limit) < total)


@router.get("/{event_id}", response_model=TriggerEventOut)
async def get_trigger(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    event = (await db.execute(
        select(TriggerEvent).where(
            TriggerEvent.id == event_id,
            TriggerEvent.user_id == user.id,
        )
    )).scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Trigger event not found")
    return event


@router.patch("/{event_id}", response_model=TriggerEventOut)
async def update_trigger(
    event_id: int,
    payload: TriggerEventUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    event = (await db.execute(
        select(TriggerEvent).where(
            TriggerEvent.id == event_id,
            TriggerEvent.user_id == user.id,
        )
    )).scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Trigger event not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trigger(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    event = (await db.execute(
        select(TriggerEvent).where(
            TriggerEvent.id == event_id,
            TriggerEvent.user_id == user.id,
        )
    )).scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Trigger event not found")
    await db.delete(event)
