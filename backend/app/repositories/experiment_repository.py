from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import date, datetime
from typing import Optional, List

from app.models import BehavioralExperiment


class ExperimentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, data: dict) -> BehavioralExperiment:
        entry = BehavioralExperiment(user_id=user_id, **data)
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def get_by_id(self, user_id: int, exp_id: int) -> Optional[BehavioralExperiment]:
        result = await self.db.execute(
            select(BehavioralExperiment).where(
                and_(BehavioralExperiment.id == exp_id, BehavioralExperiment.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()

    async def get_active(self, user_id: int) -> List[BehavioralExperiment]:
        result = await self.db.execute(
            select(BehavioralExperiment)
            .where(
                and_(
                    BehavioralExperiment.user_id == user_id,
                    BehavioralExperiment.status == "active",
                )
            )
            .order_by(BehavioralExperiment.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_completed_in_range(
        self, user_id: int, date_from: date, date_to: date
    ) -> List[BehavioralExperiment]:
        result = await self.db.execute(
            select(BehavioralExperiment).where(
                and_(
                    BehavioralExperiment.user_id == user_id,
                    BehavioralExperiment.status == "completed",
                    BehavioralExperiment.completed_at >= datetime.combine(date_from, datetime.min.time()),
                    BehavioralExperiment.completed_at <= datetime.combine(date_to, datetime.max.time()),
                )
            )
        )
        return list(result.scalars().all())

    async def update(self, entry: BehavioralExperiment, data: dict) -> BehavioralExperiment:
        for k, v in data.items():
            setattr(entry, k, v)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def delete(self, entry: BehavioralExperiment) -> None:
        await self.db.delete(entry)
        await self.db.commit()

    async def count_completed(self, user_id: int, date_from: date, date_to: date) -> int:
        result = await self.db.execute(
            select(func.count()).where(
                and_(
                    BehavioralExperiment.user_id == user_id,
                    BehavioralExperiment.status == "completed",
                    BehavioralExperiment.completed_at >= datetime.combine(date_from, datetime.min.time()),
                    BehavioralExperiment.completed_at <= datetime.combine(date_to, datetime.max.time()),
                )
            )
        )
        return result.scalar_one()
