import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)


class Settings:
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "SwissHacks"
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",     # Frontend local development
        "http://127.0.0.1:3000",     # Frontend local development alternative
        "http://frontend:3000",      # Frontend Docker service
        "http://localhost:8000",     # Backend local development
        "http://127.0.0.1:8000",     # Backend local development alternative
        "http://backend:8000",       # Backend Docker service
        "*",                         # For development only - allow all origins
    ]


settings = Settings()