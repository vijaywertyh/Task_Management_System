from app.core.security import get_password_hash

class UserService:
    def __init__(self, user_repo):
        self.user_repo = user_repo

    def create_user(self, db, payload):
        existing_user = self.user_repo.get_by_email(db, payload.email)
        if existing_user:
            raise ValueError("Email already exists")

        return self.user_repo.create(
            db=db,
            name=payload.name,
            email=payload.email,
            password_hash=get_password_hash(payload.password)
        )