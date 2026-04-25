"""Database setup — SQLite with SQLAlchemy async-ready.

Provides session management and base model class.
"""

from __future__ import annotations

import logging
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

logger = logging.getLogger(__name__)

_engine = create_engine(
    settings.database_url,
    echo=settings.app_debug,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


class Base(DeclarativeBase):
    """SQLAlchemy declarative base."""
    pass


def get_session() -> Session:
    """Get a database session.

    Yields:
        A SQLAlchemy ``Session``.
    """
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def init_db() -> None:
    """Initialize the database and create tables."""
    Base.metadata.create_all(bind=_engine)
    logger.info("Database initialized at %s", settings.database_url)
