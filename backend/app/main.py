from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.controllers import game_controller
from app.database.migrations import run_migrations
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Ping Pong Game API",
    description="API for Ping Pong Game Leaderboard",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    """Run database migrations on application startup"""
    # Run database migrations on startup
    # If migrations fail or are not set up, fall back to create_all
    migration_success = False
    try:
        migration_success = run_migrations()
    except Exception as e:
        logger.error(f"Migration error: {str(e)}")
        migration_success = False

    # Fallback to create_all if migrations failed or not available
    if not migration_success:
        try:
            from app.database.connection import engine, Base
            logger.info("Using create_all for database tables (migrations not available)")
            Base.metadata.create_all(bind=engine)
        except Exception as e:
            logger.error(f"Failed to create database tables: {str(e)}")
            # Don't raise - let the app start anyway, database errors will be caught at runtime

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

