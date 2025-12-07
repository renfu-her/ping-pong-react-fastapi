from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.game import Game, WinnerEnum
from app.views.game_schemas import GameCreate, GameResponse
from typing import List

class GameService:
    @staticmethod
    def create_game(db: Session, game_data: GameCreate) -> Game:
        """Create a new game record"""
        # Determine winner based on scores
        winner = WinnerEnum.PLAYER if game_data.player_score > game_data.cpu_score else WinnerEnum.CPU
        
        db_game = Game(
            player_name=game_data.player_name,
            player_score=game_data.player_score,
            cpu_score=game_data.cpu_score,
            winner=winner,
            target_score=game_data.target_score
        )
        
        db.add(db_game)
        db.commit()
        db.refresh(db_game)
        return db_game
    
    @staticmethod
    def get_leaderboard(db: Session, limit: int = 20) -> List[Game]:
        """Get top games sorted by player_score descending"""
        return db.query(Game)\
            .order_by(desc(Game.player_score))\
            .limit(limit)\
            .all()

