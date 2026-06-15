from datetime import datetime, timezone
from sqlalchemy import DateTime, event, func, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Shared declarative base with auto-managed timestamps.

    created_at: set once on INSERT via server default.
    updated_at: maintained by a PostgreSQL trigger (see alembic migration).
                Also explicitly set in Python before flush so it's accurate
                within the same transaction before commit.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        # server_onupdate handled by DB trigger; Python side updated manually
        nullable=False,
    )


def touch_updated_at(mapper, connection, target):
    """SQLAlchemy event hook: set updated_at before every UPDATE flush."""
    target.updated_at = datetime.now(timezone.utc)


event.listen(Base, "before_update", touch_updated_at, propagate=True)
