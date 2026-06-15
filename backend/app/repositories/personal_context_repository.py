from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.models import PersonalContext


class PersonalContextRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user(self, user_id: int) -> Optional[PersonalContext]:
        result = await self.db.execute(
            select(PersonalContext).where(PersonalContext.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create(self, user_id: int, data: dict) -> PersonalContext:
        entry = PersonalContext(user_id=user_id, **data)
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def update(self, entry: PersonalContext, data: dict) -> PersonalContext:
        for k, v in data.items():
            setattr(entry, k, v)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def upsert(self, user_id: int, data: dict) -> PersonalContext:
        existing = await self.get_by_user(user_id)
        if existing:
            return await self.update(existing, data)
        return await self.create(user_id, data)
