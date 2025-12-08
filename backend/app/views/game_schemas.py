from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Literal

class GameCreate(BaseModel):
    player_name: str = "Player 1"
    player_score: int
    cpu_score: int
    target_score: int
    
    @field_validator('player_name')
    @classmethod
    def validate_and_clean_player_name(cls, v: str) -> str:
        """Validate and clean player name"""
        if not isinstance(v, str):
            return "Player 1"
        
        # Strip whitespace
        cleaned = v.strip()
        
        # If empty after stripping, use default
        if not cleaned:
            return "Player 1"
        
        # Limit to 100 characters (database limit)
        if len(cleaned) > 100:
            cleaned = cleaned[:100]
        
        return cleaned

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

