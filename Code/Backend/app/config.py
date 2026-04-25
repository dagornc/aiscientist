"""Application configuration loaded from environment variables.

Uses pydantic-settings for strict validation and python-dotenv for
loading .env files. All secrets are loaded dynamically — never hardcoded.
"""

from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent


class Settings(BaseSettings):
    """Global application settings."""

    model_config = SettingsConfigDict(
        env_file=str(_PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── LLM ──────────────────────────────────────────────
    llm_provider: Literal["openrouter", "openai", "anthropic", "deepseek", "gemini"] = "openrouter"
    llm_model: str = "google/gemini-2.0-flash-exp:free"
    llm_temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    llm_max_tokens: int = Field(default=4096, ge=1)

    openrouter_api_key: str = ""
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    deepseek_api_key: str = ""
    gemini_api_key: str = ""

    # ── Literature Search ─────────────────────────────────
    s2_api_key: str = ""
    openalex_mail_address: str = ""
    literature_engine: Literal["semantic_scholar", "openalex"] = "semantic_scholar"

    # ── Application ───────────────────────────────────────
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    app_debug: bool = False
    app_log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"

    # ── Sandbox ───────────────────────────────────────────
    sandbox_enabled: bool = False
    sandbox_timeout: int = Field(default=300, ge=30)

    # ── Database ──────────────────────────────────────────
    database_url: str = "sqlite:///./autosearch.db"

    @property
    def project_root(self) -> Path:
        """Return the project root directory."""
        return _PROJECT_ROOT


settings = Settings()
