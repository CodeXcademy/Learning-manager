"""
Default dev user (used when DEV_AUTO_LOGIN is on).

REMOVE_DEV_AUTO_LOGIN — Delete this file and strip imports/calls (grep the tag).
"""

import logging
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.utils.security import get_password_hash

logger = logging.getLogger(__name__)


def ensure_default_dev_user(db: Session) -> Optional[User]:
    if not settings.DEV_AUTO_LOGIN:
        return None
    user = db.scalars(select(User).where(User.email == settings.DEFAULT_DEV_EMAIL)).first()
    if user:
        return user
    user = User(
        email=settings.DEFAULT_DEV_EMAIL,
        username=settings.DEFAULT_DEV_USERNAME,
        full_name=settings.DEFAULT_DEV_FULL_NAME,
        password_hash=get_password_hash(settings.DEFAULT_DEV_PASSWORD),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Created default dev user %s", settings.DEFAULT_DEV_EMAIL)
    return user
