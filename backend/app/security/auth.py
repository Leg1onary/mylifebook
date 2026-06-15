from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.security.passwords import verify_password


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> User | None:
    """Return User if credentials are valid, otherwise None."""
    result = await db.execute(select(User).where(User.email == email.lower()))
    user = result.scalar_one_or_none()
    if user is None:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
