from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[UUID] = None
    visibility: str = "private"


class CollectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[UUID] = None
    item_count: int = 0
    visibility: str = "private"
    created_at: datetime
    updated_at: datetime


class CollectionListResponse(BaseModel):
    data: list[CollectionOut]
