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

/** @deprecated 마이그레이션용 — loadAppleScores 사용 */
export interface AppleBestScoreData {
  bestScore: number;
}

export const APPLE_GRID_COLS = 17;
export const APPLE_GRID_ROWS = 10;
/** 일반 모드 제한 시간(초) */
export const APPLE_GAME_DURATION_NORMAL = 180;
/** 응애모드 제한 시간(초) — 일반 + 20 */
export const APPLE_GAME_DURATION_BABY = 200;

/** @deprecated APPLE_GAME_DURATION_NORMAL 사용 */
export const APPLE_GAME_DURATION = APPLE_GAME_DURATION_NORMAL;

export const APPLE_STORAGE_KEY = 'appleGameBestScore';
export const APPLE_SCORES_KEY = 'appleGameScoresV2';
