from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter()


class SyncBody(BaseModel):
    last_sync: Optional[datetime] = None
    changes: Optional[dict[str, Any]] = None


@router.post("")
def sync_data(_body: SyncBody, _user: User = Depends(get_current_user)):
    return {
        "synced": True,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "remote_changes": {},
    }
