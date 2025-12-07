from pydantic import BaseModel
from datetime import datetime
from typing import Literal

class GameCreate(BaseModel):
    player_name: str = "Player 1"
    player_score: int
    cpu_score: int
    target_score: int

class GameResponse(BaseModel):
    id: int
    player_name: str
    player_score: int
    cpu_score: int
    winner: Literal["player", "cpu"]
    target_score: int
    created_at: datetime
    
    class Config:
        from_attributes = True

