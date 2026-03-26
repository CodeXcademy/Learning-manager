from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    username: str
    full_name: str
    created_at: datetime


class UserDetailResponse(UserResponse):
    avatar_url: Optional[str] = None
    language: str = "en"
    theme: str = "light"
    preferences: dict[str, Any] = Field(default_factory=dict)
    storage_quota: int = 0
    storage_used: int = 0
    last_login: Optional[datetime] = None
    updated_at: datetime


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    language: Optional[str] = None
    theme: Optional[str] = None
    preferences: Optional[dict[str, Any]] = None
