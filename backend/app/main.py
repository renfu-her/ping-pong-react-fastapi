from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.controllers import game_controller
from app.database.connection import engine, Base

# Create database tables
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

