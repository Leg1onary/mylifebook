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
        raise HTTPException(
            status_code=409,
            detail=f"Check-in for {payload.entry_date} already exists. Use PATCH to update.",
        )

    checkin = DailyCheckin(user_id=user.id, **payload.model_dump())
    db.add(checkin)
    await db.flush()
    return checkin


@router.get("/", response_model=PaginatedResponse[DailyCheckinOut])
async def list_checkins(
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    # openapi-notes.md aliases: from / to / limit
    from_: date | None = Query(None, alias="from"),
    to: date | None = Query(None),
    limit: int | None = Query(None, ge=1, le=365),
    # also keep original names for backward compat
    date_from: date | None = None,
    date_to: date | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(DailyCheckin).where(DailyCheckin.user_id == user.id)
    effective_from = from_ or date_from
    effective_to = to or date_to
    if effective_from:
        q = q.where(DailyCheckin.entry_date >= effective_from)
    if effective_to:
        q = q.where(DailyCheckin.entry_date <= effective_to)

    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
    effective_limit = limit or per_page
    q = q.order_by(DailyCheckin.entry_date.desc()).offset((page - 1) * effective_limit).limit(effective_limit)
    items = (await db.execute(q)).scalars().all()

    return PaginatedResponse(
        items=items, total=total, page=page, per_page=effective_limit,
        has_next=(page * effective_limit) < total,
    )


@router.get("/date/{entry_date}", response_model=DailyCheckinOut)
async def get_checkin_by_date(
    entry_date: date,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    checkin = (await db.execute(
        select(DailyCheckin).where(
            DailyCheckin.user_id == user.id,
            DailyCheckin.entry_date == entry_date,
        )
    )).scalar_one_or_none()
    if not checkin:
        raise HTTPException(status_code=404, detail="Checkin not found")
    return checkin


@router.get("/{checkin_id}", response_model=DailyCheckinOut)
async def get_checkin(
    checkin_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    checkin = (await db.execute(
        select(DailyCheckin).where(
            DailyCheckin.id == checkin_id,
            DailyCheckin.user_id == user.id,
        )
    )).scalar_one_or_none()
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
    checkin = (await db.execute(
        select(DailyCheckin).where(
            DailyCheckin.id == checkin_id,
            DailyCheckin.user_id == user.id,
        )
    )).scalar_one_or_none()
    if not checkin:
        raise HTTPException(status_code=404, detail="Checkin not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(checkin, field, value)
    return checkin


# PUT alias for openapi-notes.md compatibility
@router.put("/{checkin_id}", response_model=DailyCheckinOut)
async def replace_checkin(
    checkin_id: int,
    payload: DailyCheckinUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """PUT alias — same behaviour as PATCH (partial update)."""
    return await update_checkin(checkin_id, payload, db, user)


@router.delete("/{checkin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_checkin(
    checkin_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    checkin = (await db.execute(
        select(DailyCheckin).where(
            DailyCheckin.id == checkin_id,
            DailyCheckin.user_id == user.id,
        )
    )).scalar_one_or_none()
    if not checkin:
        raise HTTPException(status_code=404, detail="Checkin not found")
    await db.delete(checkin)
