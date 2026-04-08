import type { AppleBestScoreData } from '../types/appleGameTypes';
import { APPLE_SCORES_KEY, APPLE_STORAGE_KEY } from '../types/appleGameTypes';

export interface AppleScoresState {
  normalBest: number;
  babyBest: number;
  babyEverUsed: boolean;
  /** 일반 모드에서 최대점(170) 달성 횟수 */
  normal170Count: number;
  /** 응애 모드에서 최대점(170) 달성 횟수 */
  baby170Count: number;
}

const defaultScores = (): AppleScoresState => ({
  normalBest: 0,
  babyBest: 0,
  babyEverUsed: false,
  normal170Count: 0,
  baby170Count: 0,
});

function parseScores(raw: string): AppleScoresState | null {
  try {
    const p = JSON.parse(raw) as Partial<AppleScoresState>;
    return {
      normalBest:
        typeof p.normalBest === 'number' && Number.isFinite(p.normalBest) ? Math.max(0, p.normalBest) : 0,
      babyBest: typeof p.babyBest === 'number' && Number.isFinite(p.babyBest) ? Math.max(0, p.babyBest) : 0,
      babyEverUsed: p.babyEverUsed === true,
      normal170Count:
        typeof p.normal170Count === 'number' && Number.isFinite(p.normal170Count)
          ? Math.max(0, Math.floor(p.normal170Count))
          : 0,
      baby170Count:
        typeof p.baby170Count === 'number' && Number.isFinite(p.baby170Count)
          ? Math.max(0, Math.floor(p.baby170Count))
          : 0,
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
      const migrated: AppleScoresState = {
        normalBest: n,
        babyBest: 0,
        babyEverUsed: false,
        normal170Count: 0,
        baby170Count: 0,
      };
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

/** 일반/응애 BEST 점수만 0으로 (응애모드 사용 이력·트로피 횟수는 유지) */
export function clearAppleBestScore(): void {
  const cur = loadAppleScores();
  saveAppleScores({ ...cur, normalBest: 0, babyBest: 0 });
}
