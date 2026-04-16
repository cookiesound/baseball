import type { AppleDifficultyInfo } from '../utils/getAppleDifficulty';

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
  /** 일반 모드: 시작 시점 보드 합 기준. 응애 모드: null */
  difficulty: AppleDifficultyInfo | null;
}

/** @deprecated 마이그레이션용 — loadAppleScores 사용 */
export interface AppleBestScoreData {
  bestScore: number;
}

export const APPLE_GRID_COLS = 17;
export const APPLE_GRID_ROWS = 10;
/** 전부 제거 시 최대 점수(격자 칸 수) */
export const APPLE_MAX_SCORE = APPLE_GRID_COLS * APPLE_GRID_ROWS;
/** 일반 모드 제한 시간(초) */
export const APPLE_GAME_DURATION_NORMAL = 120;
/** 응애모드 제한 시간(초) */
export const APPLE_GAME_DURATION_BABY = 150;

/** @deprecated APPLE_GAME_DURATION_NORMAL 사용 */
export const APPLE_GAME_DURATION = APPLE_GAME_DURATION_NORMAL;

export const APPLE_STORAGE_KEY = 'appleGameBestScore';
export const APPLE_SCORES_KEY = 'appleGameScoresV2';
