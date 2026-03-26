from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.user_schema import UserDetailResponse, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserDetailResponse)
def read_me(user: User = Depends(get_current_user)):
    return user


@router.put("/me", response_model=UserDetailResponse)
def update_me(
    body: UserUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = body.model_dump(exclude_unset=True)
    for key, val in data.items():
        setattr(user, key, val)
    db.commit()
    db.refresh(user)
    return user
