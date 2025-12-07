import { PlayerScore } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface GameResultRequest {
  player_name?: string;
  player_score: number;
  cpu_score: number;
  target_score: number;
}

export interface GameResultResponse {
  id: number;
  player_name: string;
  player_score: number;
  cpu_score: number;
  winner: 'player' | 'cpu';
  target_score: number;
  created_at: string;
}

export const gameService = {
  /**
   * Get leaderboard (top 20 games)
   */
  async getLeaderboard(): Promise<PlayerScore[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/leaderboard`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: GameResultResponse[] = await response.json();
      
      // Convert to PlayerScore format
      return data.map((game) => ({
        id: game.id,
        name: game.player_name,
        score: game.player_score,
        opponentScore: game.cpu_score,
        date: game.created_at,
        winner: game.winner as 'player' | 'cpu',
        target_score: game.target_score,
      }));
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      // Return empty array on error to prevent app crash
      return [];
    }
  },

  /**
   * Save game result
   */
  async saveGameResult(gameData: GameResultRequest): Promise<GameResultResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to save game result:', error);
      return null;
    }
  },
};

