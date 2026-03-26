import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import JSON, Boolean, DateTime, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.collection import Collection
    from app.models.course import Course
    from app.models.document import Document
    from app.models.note import Note
    from app.models.note_folder import NoteFolder
    from app.models.session import FocusSession, LearningSession


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="en")
    theme: Mapped[str] = mapped_column(String(20), default="light")
    preferences: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    storage_quota: Mapped[int] = mapped_column(Integer, default=5368709120)
    storage_used: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    documents: Mapped[list["Document"]] = relationship(back_populates="owner")
    collections: Mapped[list["Collection"]] = relationship(back_populates="owner")
    notes: Mapped[list["Note"]] = relationship(back_populates="owner")
    note_folders: Mapped[list["NoteFolder"]] = relationship(back_populates="owner")
    courses: Mapped[list["Course"]] = relationship(back_populates="owner")
    learning_sessions: Mapped[list["LearningSession"]] = relationship(back_populates="owner")
    focus_sessions: Mapped[list["FocusSession"]] = relationship(back_populates="owner")
