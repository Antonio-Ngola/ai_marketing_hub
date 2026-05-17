from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:admin@localhost:5432/ai_marketing_hub"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Extra settings (allow extra fields)
    class Config:
        env_file = "../.env"
        extra = "ignore"  # Isso permite campos extras no .env
    
settings = Settings()