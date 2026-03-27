from app.core.security import verify_password, create_access_token


class AuthService:
    def __init__(self, user_repo):
        self.user_repo = user_repo

    def login(self, db, email: str, password: str):
        user = self.user_repo.get_by_email(db, email)

        if not user or not verify_password(password, user.hashed_password):
            return None

        token = create_access_token({"sub": str(user.id)})

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }