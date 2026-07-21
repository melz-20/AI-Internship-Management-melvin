"""
Database configuration for ProManage.

Uses SQLite by default for zero-config local development.
Swap SQLALCHEMY_DATABASE_URL for a Postgres URL in production, e.g.:
    postgresql://user:password@localhost:5432/promanage
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./promanage.db"

# check_same_thread=False is required only for SQLite when used with FastAPI's
# threaded request handling. Remove this connect_arg if you switch to Postgres.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
