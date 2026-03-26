import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class LearningSession(Base):
    __tablename__ = "learning_sessions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), nullable=True)
    module_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), nullable=True)
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), nullable=True)
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    duration: Mapped[int] = mapped_column(Integer, default=0)
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes_created: Mapped[int] = mapped_column(Integer, default=0)
    highlights_created: Mapped[int] = mapped_column(Integer, default=0)
    is_focused: Mapped[bool] = mapped_column(Boolean, default=False)
    mood_before: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mood_after: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    retention_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    goal: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    extra: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    owner: Mapped["User"] = relationship(back_populates="learning_sessions")


class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)
    elapsed_time: Mapped[int] = mapped_column(Integer, default=0)
    breaks_taken: Mapped[int] = mapped_column(Integer, default=0)
    total_break_time: Mapped[int] = mapped_column(Integer, default=0)
    goal: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    interruptions: Mapped[int] = mapped_column(Integer, default=0)
    focus_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    timezone_label: Mapped[Optional[str]] = mapped_column("timezone", String(64), nullable=True)
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    owner: Mapped["User"] = relationship(back_populates="focus_sessions")
