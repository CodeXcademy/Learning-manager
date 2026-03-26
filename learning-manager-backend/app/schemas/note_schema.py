from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.common import PaginationMeta


class NoteCreate(BaseModel):
    title: str
    content: str
    language: Optional[str] = "en"
    modality: Optional[str] = "general"
    source_type: Optional[str] = "standalone"
    source_id: Optional[UUID] = None
    source_name: Optional[str] = None
    folder_id: Optional[UUID] = None
    tags: list[str] = []


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    language: Optional[str] = None
    tags: Optional[list[str]] = None


class HighlightOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    text: str
    color: str
    start_offset: Optional[int] = None
    end_offset: Optional[int] = None
    page_number: Optional[int] = None
    timestamp: Optional[str] = None
    created_at: datetime


class NoteRevisionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    revision_number: int
    title: str
    content: str
    word_count: int
    created_at: datetime


class NoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    title: str
    content: str
    language: str = "en"
    is_rtl: bool = False
    modality: str
    source_type: str
    source_id: Optional[UUID] = None
    source_name: Optional[str] = None
    source_timestamp: Optional[str] = None
    source_page_number: Optional[int] = None
    folder_id: Optional[UUID] = None
    tags: list[str] = []
    is_favorite: bool = False
    is_pinned: bool = False
    word_count: int = 0
    reading_time: int = 0
    current_revision: int = 1
    created_at: datetime
    updated_at: datetime


class NoteDetailOut(NoteOut):
    highlights: list[HighlightOut] = []
    revisions: list[NoteRevisionOut] = []


class HighlightCreate(BaseModel):
    text: str
    color: str
    start_offset: Optional[int] = None
    end_offset: Optional[int] = None
    page_number: Optional[int] = None
    timestamp: Optional[str] = None


class NoteListResponse(BaseModel):
    data: list[NoteOut]
    pagination: PaginationMeta
