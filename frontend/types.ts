export enum GameScreen {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  LEADERBOARD = 'LEADERBOARD',
}

export interface PlayerScore {
  id?: number;
  name: string;
  score: number;
  date: string;
  opponentScore: number;
  winner?: 'player' | 'cpu';
  target_score?: number;
}

export interface GameSettings {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  targetScore: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface Ball {
  pos: Vector;
  vel: Vector;
  speed: number;
  radius: number;
}

export interface Paddle {
  pos: Vector;
  width: number;
  height: number;
}