from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.services.game_service import GameService
from app.views.game_schemas import GameCreate, GameResponse

router = APIRouter(prefix="/api/games", tags=["games"])

@router.post("", response_model=GameResponse, status_code=201)
def create_game(game_data: GameCreate, db: Session = Depends(get_db)):
    """
    Create a new game result
    
    - **player_name**: Player name (optional, defaults to "Player 1" if empty or not provided)
    - **player_score**: Player's final score
    - **cpu_score**: CPU's final score
    - **target_score**: Target rounds for the game
    
    Player name will be automatically cleaned (trimmed, limited to 100 characters).
    """
    try:
        game = GameService.create_game(db, game_data)
        return game
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create game: {str(e)}")

@router.get("/leaderboard", response_model=List[GameResponse])
def get_leaderboard(db: Session = Depends(get_db)):
    """Get leaderboard (top 20 games sorted by player_score)"""
    try:
        games = GameService.get_leaderboard(db, limit=20)
        return games
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch leaderboard: {str(e)}")

