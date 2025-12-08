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
        
        # Ensure player_name is not empty (should be handled by schema, but double-check)
        player_name = game_data.player_name.strip() if game_data.player_name else "Player 1"
        if not player_name:
            player_name = "Player 1"
        
        # Ensure name doesn't exceed database limit
        if len(player_name) > 100:
            player_name = player_name[:100]
        
        db_game = Game(
            player_name=player_name,
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

