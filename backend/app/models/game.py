from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from app.database.connection import Base
import enum

class WinnerEnum(str, enum.Enum):
    PLAYER = "player"
    CPU = "cpu"

class Game(Base):
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    player_name = Column(String(100), default="Player 1", nullable=False)
    player_score = Column(Integer, nullable=False)
    cpu_score = Column(Integer, nullable=False)
    winner = Column(SQLEnum(WinnerEnum), nullable=False)
    target_score = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

