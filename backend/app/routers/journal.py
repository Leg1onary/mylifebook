"""Free Journal endpoints — unstructured daily notes."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.journal_entry import JournalEntry
from app.schemas.journal_entry import JournalEntryCreate, JournalEntryUpdate, JournalEntryOut
from app.schemas.common import PaginatedResponse

router = APIRouter()


@router.post("/", response_model=JournalEntryOut, status_code=status.HTTP_201_CREATED)
async def create_entry(
    payload: JournalEntryCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Allow only one entry per day
    existing = (await db.execute(
        select(JournalEntry).where(
            JournalEntry.user_id == user.id,
            JournalEntry.entry_date == payload.entry_date,
        )
    )).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Journal entry for this date already exists. Use PATCH to update.",
        )
    entry = JournalEntry(user_id=user.id, **payload.model_dump())
    db.add(entry)
    await db.flush()
    return entry


@router.get("/", response_model=PaginatedResponse[JournalEntryOut])
async def list_entries(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    since: date | None = None,
    until: date | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(JournalEntry).where(JournalEntry.user_id == user.id)
    if since:
        q = q.where(JournalEntry.entry_date >= since)
    if until:
        q = q.where(JournalEntry.entry_date <= until)

    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
    q = q.order_by(JournalEntry.entry_date.desc()).offset((page - 1) * per_page).limit(per_page)
    items = (await db.execute(q)).scalars().all()
    return PaginatedResponse(items=items, total=total, page=page, per_page=per_page,
                             has_next=(page * per_page) < total)


@router.get("/{entry_id}", response_model=JournalEntryOut)
async def get_entry(
    entry_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    entry = (await db.execute(
        select(JournalEntry).where(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == user.id,
        )
    )).scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry


@router.patch("/{entry_id}", response_model=JournalEntryOut)
async def update_entry(
    entry_id: int,
    payload: JournalEntryUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    entry = (await db.execute(
        select(JournalEntry).where(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == user.id,
        )
    )).scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(
    entry_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    entry = (await db.execute(
        select(JournalEntry).where(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == user.id,
        )
    )).scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    await db.delete(entry)
