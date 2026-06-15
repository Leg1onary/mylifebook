from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.thought_record import ThoughtRecord
from app.schemas.thought_record import ThoughtRecordCreate, ThoughtRecordUpdate, ThoughtRecordOut
from app.schemas.common import PaginatedResponse

router = APIRouter()


@router.post("/", response_model=ThoughtRecordOut, status_code=status.HTTP_201_CREATED)
async def create_thought(
    payload: ThoughtRecordCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    record = ThoughtRecord(
        user_id=user.id,
        **payload.model_dump(),
    )
    db.add(record)
    await db.flush()
    return record


@router.get("/", response_model=PaginatedResponse[ThoughtRecordOut])
async def list_thoughts(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    is_sos: bool | None = None,
    trigger_category: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(ThoughtRecord).where(ThoughtRecord.user_id == user.id)
    if is_sos is not None:
        q = q.where(ThoughtRecord.is_sos == is_sos)
    if trigger_category:
        q = q.where(ThoughtRecord.trigger_category == trigger_category)

    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
    q = q.order_by(ThoughtRecord.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    items = (await db.execute(q)).scalars().all()

    return PaginatedResponse(items=items, total=total, page=page, per_page=per_page,
                             has_next=(page * per_page) < total)


@router.get("/{record_id}", response_model=ThoughtRecordOut)
async def get_thought(
    record_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ThoughtRecord).where(ThoughtRecord.id == record_id, ThoughtRecord.user_id == user.id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.patch("/{record_id}", response_model=ThoughtRecordOut)
async def update_thought(
    record_id: int,
    payload: ThoughtRecordUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ThoughtRecord).where(ThoughtRecord.id == record_id, ThoughtRecord.user_id == user.id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_thought(
    record_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ThoughtRecord).where(ThoughtRecord.id == record_id, ThoughtRecord.user_id == user.id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    await db.delete(record)
