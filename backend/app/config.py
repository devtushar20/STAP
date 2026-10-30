from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "STAP Recruitment Platform API"
    ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"
    PORT: int = 8000

    # JWT Authentication
    SECRET_KEY: str = "stap-super-secret-jwt-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    DATABASE_URL: str = "sqlite:///./stap.db"

    # ChromaDB
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_data"

    # LLM Settings
    LLM_PROVIDER: str = "mock"  # "mock", "openai", "anthropic", "gemini"
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-4o-mini"

    # Rate Limiting
    RATE_LIMIT_LOGIN: str = "10/minute"
    RATE_LIMIT_DEMO: str = "5/minute"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

