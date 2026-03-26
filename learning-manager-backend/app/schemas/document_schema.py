from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import PaginationMeta


class DocumentCreateJson(BaseModel):
    name: str
    type: str
    mime_type: Optional[str] = "application/octet-stream"
    collection_id: Optional[UUID] = None
    tags: list[str] = []
    description: Optional[str] = None
    language: str = "en"


class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[list[str]] = None
    collection_id: Optional[UUID] = None
    is_starred: Optional[bool] = None
    is_archived: Optional[bool] = None
    language: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    name: str
    type: str
    size: int
    mime_type: str
    collection_id: Optional[UUID] = None
    tags: list[str] = []
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    page_count: Optional[int] = None
    duration: Optional[int] = None
    language: str = "en"
    is_starred: bool = False
    is_archived: bool = False
    metadata: dict[str, Any] = Field(default_factory=dict, validation_alias="extra")
    created_at: datetime
    updated_at: datetime


class DocumentListResponse(BaseModel):
    data: list[DocumentOut]
    pagination: PaginationMeta
