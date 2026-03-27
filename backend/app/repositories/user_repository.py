from sqlalchemy.orm import Session
from app.models.user import User


class UserRepository:
    def get_by_email(self, db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    def get_by_id(self, db: Session, user_id: int):
        return db.query(User).filter(User.id == user_id).first()

    def get_all(self, db: Session):
        return db.query(User).all()

    def create(self, db: Session, name: str, email: str, password_hash: str):
        user = User(name=name, email=email, password_hash=password_hash)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user