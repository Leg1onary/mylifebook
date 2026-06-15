from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import date
from typing import Optional, List

from app.models import WeeklyReview


class WeeklyReviewRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, data: dict) -> WeeklyReview:
        entry = WeeklyReview(user_id=user_id, **data)
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def get_by_week_start(self, user_id: int, week_start: date) -> Optional[WeeklyReview]:
        result = await self.db.execute(
            select(WeeklyReview).where(
                and_(
                    WeeklyReview.user_id == user_id,
                    WeeklyReview.week_start == week_start,
                )
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int, review_id: int) -> Optional[WeeklyReview]:
        result = await self.db.execute(
            select(WeeklyReview).where(
                and_(WeeklyReview.id == review_id, WeeklyReview.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()

    async def get_list(self, user_id: int, limit: int = 12) -> List[WeeklyReview]:
        result = await self.db.execute(
            select(WeeklyReview)
            .where(WeeklyReview.user_id == user_id)
            .order_by(WeeklyReview.week_start.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def update(self, entry: WeeklyReview, data: dict) -> WeeklyReview:
        for k, v in data.items():
            setattr(entry, k, v)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def delete(self, entry: WeeklyReview) -> None:
        await self.db.delete(entry)
        await self.db.commit()
