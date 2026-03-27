from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas.user import UserResponse, UserCreate
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService

router = APIRouter()
user_repo = UserRepository()
user_service = UserService(user_repo)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.repositories.user_repository import UserRepository

router = APIRouter()

user_repo = UserRepository()

@router.get("/")
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    users = user_repo.get_all(db)

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        }
        for user in users
    ]


@router.post("/", response_model=UserResponse, status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    try:
        return user_service.create_user(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))