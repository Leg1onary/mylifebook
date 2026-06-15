from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import date, datetime
from typing import Optional, List

from app.models import TriggerEvent


class TriggerRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, data: dict) -> TriggerEvent:
        entry = TriggerEvent(user_id=user_id, **data)
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def get_by_id(self, user_id: int, trigger_id: int) -> Optional[TriggerEvent]:
        result = await self.db.execute(
            select(TriggerEvent).where(
                and_(TriggerEvent.id == trigger_id, TriggerEvent.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()

    async def get_list(
        self,
        user_id: int,
        limit: int = 20,
        offset: int = 0,
        category: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> List[TriggerEvent]:
        q = select(TriggerEvent).where(TriggerEvent.user_id == user_id)
        if category:
            q = q.where(TriggerEvent.category == category)
        if date_from:
            q = q.where(TriggerEvent.created_at >= datetime.combine(date_from, datetime.min.time()))
        if date_to:
            q = q.where(TriggerEvent.created_at <= datetime.combine(date_to, datetime.max.time()))
        q = q.order_by(TriggerEvent.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def category_counts(self, user_id: int, date_from: date, date_to: date) -> dict:
        result = await self.db.execute(
            select(TriggerEvent.category, func.count().label("cnt"))
            .where(
                and_(
                    TriggerEvent.user_id == user_id,
                    TriggerEvent.created_at >= datetime.combine(date_from, datetime.min.time()),
                    TriggerEvent.created_at <= datetime.combine(date_to, datetime.max.time()),
                )
            )
            .group_by(TriggerEvent.category)
        )
        return {row.category: row.cnt for row in result.all()}

    async def update(self, entry: TriggerEvent, data: dict) -> TriggerEvent:
        for k, v in data.items():
            setattr(entry, k, v)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def delete(self, entry: TriggerEvent) -> None:
        await self.db.delete(entry)
        await self.db.commit()

    async def count_by_range(self, user_id: int, date_from: date, date_to: date) -> int:
        result = await self.db.execute(
            select(func.count()).where(
                and_(
                    TriggerEvent.user_id == user_id,
                    TriggerEvent.created_at >= datetime.combine(date_from, datetime.min.time()),
                    TriggerEvent.created_at <= datetime.combine(date_to, datetime.max.time()),
                )
            )
        )
        return result.scalar_one()
