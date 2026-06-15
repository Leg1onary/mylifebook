from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.daily_checkin import DailyCheckin
from app.schemas.daily_checkin import DailyCheckinCreate, DailyCheckinUpdate, DailyCheckinOut
from app.schemas.common import PaginatedResponse

router = APIRouter()


@router.post("/", response_model=DailyCheckinOut, status_code=status.HTTP_201_CREATED)
async def create_checkin(
    payload: DailyCheckinCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    existing = await db.execute(
        select(DailyCheckin).where(
            DailyCheckin.user_id == user.id,
            DailyCheckin.entry_date == payload.entry_date,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Checkin for this date already exists")

    checkin = DailyCheckin(user_id=user.id, **payload.model_dump())
    db.add(checkin)
    await db.flush()
    return checkin


@router.get("/", response_model=PaginatedResponse[DailyCheckinOut])
async def list_checkins(
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    date_from: date | None = None,
    date_to: date | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(DailyCheckin).where(DailyCheckin.user_id == user.id)
    if date_from:
        q = q.where(DailyCheckin.entry_date >= date_from)
    if date_to:
        q = q.where(DailyCheckin.entry_date <= date_to)

    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar_one()

    q = q.order_by(DailyCheckin.entry_date.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(q)
    items = result.scalars().all()

    return PaginatedResponse(
        items=items, total=total, page=page, per_page=per_page,
        has_next=(page * per_page) < total,
    )


@router.get("/date/{entry_date}", response_model=DailyCheckinOut)
async def get_checkin_by_date(
    entry_date: date,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DailyCheckin).where(
            DailyCheckin.user_id == user.id,
            DailyCheckin.entry_date == entry_date,
        )
    )
    checkin = result.scalar_one_or_none()
    if not checkin:
        raise HTTPException(status_code=404, detail="Checkin not found")
    return checkin


@router.patch("/{checkin_id}", response_model=DailyCheckinOut)
async def update_checkin(
    checkin_id: int,
    payload: DailyCheckinUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DailyCheckin).where(DailyCheckin.id == checkin_id, DailyCheckin.user_id == user.id)
    )
    checkin = result.scalar_one_or_none()
    if not checkin:
        raise HTTPException(status_code=404, detail="Checkin not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(checkin, field, value)
    return checkin


@router.delete("/{checkin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_checkin(
    checkin_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DailyCheckin).where(DailyCheckin.id == checkin_id, DailyCheckin.user_id == user.id)
    )
    checkin = result.scalar_one_or_none()
    if not checkin:
        raise HTTPException(status_code=404, detail="Checkin not found")
    await db.delete(checkin)
