from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import date
from typing import Optional, List

from app.models import DailyCheckin


class DailyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, data: dict) -> DailyCheckin:
        entry = DailyCheckin(user_id=user_id, **data)
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def get_by_date(self, user_id: int, entry_date: date) -> Optional[DailyCheckin]:
        result = await self.db.execute(
            select(DailyCheckin).where(
                and_(DailyCheckin.user_id == user_id, DailyCheckin.entry_date == entry_date)
            )
        )
        return result.scalar_one_or_none()

    async def get_range(self, user_id: int, date_from: date, date_to: date) -> List[DailyCheckin]:
        result = await self.db.execute(
            select(DailyCheckin)
            .where(
                and_(
                    DailyCheckin.user_id == user_id,
                    DailyCheckin.entry_date >= date_from,
                    DailyCheckin.entry_date <= date_to,
                )
            )
            .order_by(DailyCheckin.entry_date)
        )
        return list(result.scalars().all())

    async def get_streak(self, user_id: int) -> int:
        """Count consecutive days ending today."""
        today = date.today()
        streak = 0
        current = today
        while True:
            row = await self.get_by_date(user_id, current)
            if row is None:
                break
            streak += 1
            current = date.fromordinal(current.toordinal() - 1)
        return streak

    async def update(self, entry: DailyCheckin, data: dict) -> DailyCheckin:
        for k, v in data.items():
            setattr(entry, k, v)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def delete(self, entry: DailyCheckin) -> None:
        await self.db.delete(entry)
        await self.db.commit()

    async def count_by_range(self, user_id: int, date_from: date, date_to: date) -> int:
        result = await self.db.execute(
            select(func.count()).where(
                and_(
                    DailyCheckin.user_id == user_id,
                    DailyCheckin.entry_date >= date_from,
                    DailyCheckin.entry_date <= date_to,
                )
            )
        )
        return result.scalar_one()
