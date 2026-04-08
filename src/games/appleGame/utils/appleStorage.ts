import type { AppleBestScoreData } from '../types/appleGameTypes';
import { APPLE_SCORES_KEY, APPLE_STORAGE_KEY } from '../types/appleGameTypes';

export interface AppleScoresState {
  normalBest: number;
  babyBest: number;
  babyEverUsed: boolean;
}

const defaultScores = (): AppleScoresState => ({
  normalBest: 0,
  babyBest: 0,
  babyEverUsed: false,
});

function parseScores(raw: string): AppleScoresState | null {
  try {
    const p = JSON.parse(raw) as Partial<AppleScoresState>;
    return {
      normalBest:
        typeof p.normalBest === 'number' && Number.isFinite(p.normalBest) ? Math.max(0, p.normalBest) : 0,
      babyBest: typeof p.babyBest === 'number' && Number.isFinite(p.babyBest) ? Math.max(0, p.babyBest) : 0,
      babyEverUsed: p.babyEverUsed === true,
    };
  } catch {
    return null;
  }
}

/** 레거시 { bestScore } → V2로 이전 */
export function loadAppleScores(): AppleScoresState {
  try {
    const v2 = localStorage.getItem(APPLE_SCORES_KEY);
    if (v2) {
      const s = parseScores(v2);
      if (s) return s;
    }
    const legacy = localStorage.getItem(APPLE_STORAGE_KEY);
    if (legacy) {
      const p = JSON.parse(legacy) as AppleBestScoreData & Partial<{ bestScore: number }>;
      const n = typeof p.bestScore === 'number' && Number.isFinite(p.bestScore) ? p.bestScore : 0;
      const migrated = { normalBest: n, babyBest: 0, babyEverUsed: false };
      saveAppleScores(migrated);
      localStorage.removeItem(APPLE_STORAGE_KEY);
      return migrated;
    }
  } catch {
    /* ignore */
  }
  return defaultScores();
}

export function saveAppleScores(data: AppleScoresState): void {
  localStorage.setItem(APPLE_SCORES_KEY, JSON.stringify(data));
}

export function markAppleBabyModeEverUsed(): void {
  const cur = loadAppleScores();
  if (cur.babyEverUsed) return;
  saveAppleScores({ ...cur, babyEverUsed: true });
}

export function clearAppleScoresAll(): void {
  localStorage.removeItem(APPLE_SCORES_KEY);
  localStorage.removeItem(APPLE_STORAGE_KEY);
}

/* --- 레거시 API (필요 시) --- */

export function loadAppleBestScore(): AppleBestScoreData {
  return { bestScore: loadAppleScores().normalBest };
}

export function saveAppleBestScore(data: AppleBestScoreData): void {
  const cur = loadAppleScores();
  saveAppleScores({ ...cur, normalBest: data.bestScore });
}

/** 일반/응애 BEST 점수만 0으로 (응애모드 사용 이력 표시 여부는 유지) */
export function clearAppleBestScore(): void {
  const cur = loadAppleScores();
  saveAppleScores({ ...cur, normalBest: 0, babyBest: 0 });
}
