from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import date, datetime
from typing import Optional, List

from app.models import ThoughtRecord


class ThoughtRecordRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, data: dict) -> ThoughtRecord:
        entry = ThoughtRecord(user_id=user_id, **data)
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def get_by_id(self, user_id: int, record_id: int) -> Optional[ThoughtRecord]:
        result = await self.db.execute(
            select(ThoughtRecord).where(
                and_(ThoughtRecord.id == record_id, ThoughtRecord.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()

    async def get_list(
        self,
        user_id: int,
        limit: int = 20,
        offset: int = 0,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> List[ThoughtRecord]:
        q = select(ThoughtRecord).where(ThoughtRecord.user_id == user_id)
        if date_from:
            q = q.where(ThoughtRecord.created_at >= datetime.combine(date_from, datetime.min.time()))
        if date_to:
            q = q.where(ThoughtRecord.created_at <= datetime.combine(date_to, datetime.max.time()))
        q = q.order_by(ThoughtRecord.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def update(self, entry: ThoughtRecord, data: dict) -> ThoughtRecord:
        for k, v in data.items():
            setattr(entry, k, v)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def delete(self, entry: ThoughtRecord) -> None:
        await self.db.delete(entry)
        await self.db.commit()

    async def distortion_counts(self, user_id: int, date_from: date, date_to: date) -> dict:
        records = await self.get_list(user_id, limit=1000, date_from=date_from, date_to=date_to)
        counts: dict = {}
        for r in records:
            for d in (r.distortions or []):
                counts[d] = counts.get(d, 0) + 1
        return counts

    async def count_by_range(self, user_id: int, date_from: date, date_to: date) -> int:
        result = await self.db.execute(
            select(func.count()).where(
                and_(
                    ThoughtRecord.user_id == user_id,
                    ThoughtRecord.created_at >= datetime.combine(date_from, datetime.min.time()),
                    ThoughtRecord.created_at <= datetime.combine(date_to, datetime.max.time()),
                )
            )
        )
        return result.scalar_one()
