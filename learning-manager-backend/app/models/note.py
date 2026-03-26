import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Index, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.highlight import TextHighlight
    from app.models.note_folder import NoteFolder
    from app.models.note_revision import NoteRevision
    from app.models.user import User


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Note(Base):
    __tablename__ = "notes"
    __table_args__ = (
        Index("ix_note_user_modality", "user_id", "modality"),
        Index("ix_note_folder", "folder_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="en")
    is_rtl: Mapped[bool] = mapped_column(Boolean, default=False)
    modality: Mapped[str] = mapped_column(String(50), nullable=False, default="general")
    source_type: Mapped[str] = mapped_column(String(50), nullable=False, default="standalone")
    source_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), nullable=True)
    source_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source_timestamp: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    source_page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    folder_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("note_folders.id"), nullable=True
    )
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    word_count: Mapped[int] = mapped_column(Integer, default=0)
    reading_time: Mapped[int] = mapped_column(Integer, default=0)
    current_revision: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    owner: Mapped["User"] = relationship(back_populates="notes")
    folder: Mapped[Optional["NoteFolder"]] = relationship(back_populates="notes")
    highlights: Mapped[list["TextHighlight"]] = relationship(
        back_populates="note", cascade="all, delete-orphan"
    )
    revisions: Mapped[list["NoteRevision"]] = relationship(
        back_populates="note", cascade="all, delete-orphan", order_by="NoteRevision.revision_number"
    )
