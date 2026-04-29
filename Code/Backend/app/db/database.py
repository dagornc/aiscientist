"""Database configuration using SQLAlchemy."""

from __future__ import annotations

from contextlib import contextmanager
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

engine = create_engine(
    settings.database_url,
    echo=False,  # Set to True for SQL debugging
    pool_pre_ping=True,
    connect_args={"check_same_thread": False}  # Required for SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator:
    """Dependency generator for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize the database tables."""
    from app.db import models  # Import models to register them with Base
    Base.metadata.create_all(bind=engine)