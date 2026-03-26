from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import PaginationMeta


class ModuleFileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    document_id: UUID
    file_type: str
    order: int
    duration: Optional[int] = None
    size: Optional[int] = None


class CourseModuleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: Optional[str] = None
    type: str
    order: int
    duration: int = 0
    is_completed: bool = False
    files: list[ModuleFileOut] = []


class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    title: str
    description: Optional[str] = None
    thumbnail_id: Optional[UUID] = None
    collection_id: Optional[UUID] = None
    visibility: str = "private"
    tags: list[str] = []
    status: str = "draft"
    total_duration: int = 0
    completion_progress: float = 0.0
    modules: list[CourseModuleOut] = []
    metadata: dict[str, Any] = Field(default_factory=dict, validation_alias="extra")
    created_at: datetime
    updated_at: datetime


class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail_id: Optional[UUID] = None
    collection_id: Optional[UUID] = None
    visibility: str = "private"
    tags: list[str] = []
    status: str = "draft"


class CourseListResponse(BaseModel):
    data: list[CourseOut]
    pagination: PaginationMeta
