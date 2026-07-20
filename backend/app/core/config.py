from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    app_name: str = "AURA Learn API"
    debug: bool = False

    firebase_project_id: str = "auralearn-d0548"
    firebase_client_email: Optional[str] = None
    firebase_private_key: Optional[str] = None

    gemini_api_key: Optional[str] = None

    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    stripe_price_monthly: str = "price_monthly"
    stripe_price_yearly: str = "price_yearly"

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/auralearn"
    redis_url: str = "redis://localhost:6379"

    backend_cors_origins: list[str] = ["http://localhost:3000", "https://auralearn.com", "https://www.auralearn.com"]

    class Config:
        env_file = "../../.env.local"
        case_sensitive = False

settings = Settings()
