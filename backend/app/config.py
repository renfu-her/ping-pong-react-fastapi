import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

# Get logger (may not be configured yet, so use print as fallback)
logger = logging.getLogger(__name__)

# Get the backend directory (where .env file should be located)
# This file is in app/config.py, so go up one level to backend/
backend_dir = Path(__file__).parent.parent
env_path = backend_dir / ".env"

# Load .env file from backend directory
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)
    print(f"[CONFIG] Loaded .env file from: {env_path}", file=sys.stderr)
    try:
        logger.info(f"Loaded .env file from: {env_path}")
    except:
        pass
else:
    print(f"[CONFIG] WARNING: .env file not found at: {env_path}", file=sys.stderr)
    try:
        logger.warning(f".env file not found at: {env_path}, using environment variables or defaults")
    except:
        pass
    # Try to load from current directory as fallback
    load_dotenv(override=True)

class Settings:
    # Database settings
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "ping-pong-game")
    
    def __init__(self):
        # Log database configuration (without password) for debugging
        logger.info(f"Database configuration: host={self.DB_HOST}, port={self.DB_PORT}, user={self.DB_USER}, db={self.DB_NAME}")
    
    @property
    def DATABASE_URL(self) -> str:
        """Generate SQLAlchemy database URL"""
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
    
    # CORS settings
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

settings = Settings()

