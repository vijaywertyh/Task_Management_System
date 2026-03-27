# app/seed.py
from app.core.database import Base, engine

def seed():
    # Only create tables, no manual users
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

if __name__ == "__main__":
    seed()