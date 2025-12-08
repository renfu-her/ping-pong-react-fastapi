from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.controllers import game_controller
from app.database.migrations import run_migrations
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Run database migrations on startup
try:
    run_migrations()
except Exception as e:
    logger.error(f"Migration failed: {str(e)}")
    # Fallback to create_all if migrations fail (for development)
    from app.database.connection import engine, Base
    logger.warning("Falling back to create_all for database tables")
    Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Ping Pong Game API",
    description="API for Ping Pong Game Leaderboard",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(game_controller.router)

@app.get("/")
def root():
    return {"message": "Ping Pong Game API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

