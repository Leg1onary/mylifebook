from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import date, datetime
from typing import Optional, List

from app.models import Experiment


class ExperimentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, data: dict) -> Experiment:
        entry = Experiment(user_id=user_id, **data)
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def get_by_id(self, user_id: int, exp_id: int) -> Optional[Experiment]:
        result = await self.db.execute(
            select(Experiment).where(
                and_(Experiment.id == exp_id, Experiment.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()

    async def get_active(self, user_id: int) -> List[Experiment]:
        result = await self.db.execute(
            select(Experiment)
            .where(
                and_(
                    Experiment.user_id == user_id,
                    Experiment.status.in_(["planned", "active"]),
                )
            )
            .order_by(Experiment.planned_date.asc())
        )
        return list(result.scalars().all())

    async def get_completed_in_range(
        self, user_id: int, date_from: date, date_to: date
    ) -> List[Experiment]:
        result = await self.db.execute(
            select(Experiment).where(
                and_(
                    Experiment.user_id == user_id,
                    Experiment.status == "completed",
                    Experiment.planned_date >= date_from,
                    Experiment.planned_date <= date_to,
                )
            )
        )
        return list(result.scalars().all())

    async def update(self, entry: Experiment, data: dict) -> Experiment:
        for k, v in data.items():
            setattr(entry, k, v)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def delete(self, entry: Experiment) -> None:
        await self.db.delete(entry)
        await self.db.commit()

    async def count_completed(self, user_id: int, date_from: date, date_to: date) -> int:
        result = await self.db.execute(
            select(func.count()).where(
                and_(
                    Experiment.user_id == user_id,
                    Experiment.status == "completed",
                    Experiment.planned_date >= date_from,
                    Experiment.planned_date <= date_to,
                )
            )
        )
        return result.scalar_one()

    async def get_list(
        self,
        user_id: int,
        limit: int = 20,
        offset: int = 0,
        status: Optional[str] = None,
    ) -> List[Experiment]:
        q = select(Experiment).where(Experiment.user_id == user_id)
        if status:
            q = q.where(Experiment.status == status)
        q = q.order_by(Experiment.planned_date.desc()).limit(limit).offset(offset)
        result = await self.db.execute(q)
        return list(result.scalars().all())
