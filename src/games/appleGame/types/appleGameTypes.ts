export interface AppleCell {
  id: string;
  value: number;
  x: number;
  y: number;
  removed: boolean;
}

export interface AppleGameState {
  grid: AppleCell[][];
  score: number;
  time: number;
  gameOver: boolean;
}

export interface AppleBestScoreData {
  bestScore: number;
}

export const APPLE_GRID_COLS = 17;
export const APPLE_GRID_ROWS = 10;
export const APPLE_GAME_DURATION = 120;
export const APPLE_STORAGE_KEY = 'appleGameBestScore';
