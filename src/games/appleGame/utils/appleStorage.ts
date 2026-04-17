import type { AppleBestScoreData } from '../types/appleGameTypes';
import { APPLE_SCORES_KEY, APPLE_STORAGE_KEY } from '../types/appleGameTypes';

/** 일반 모드 최고 점수 달성 시·직전 판 기록(난이도). 응애 모드는 난이도 필드에 별도 의미 없음 */
export interface AppleGameRecord {
  bestScore: number;
  bestDifficultyLevel: number;
  bestDifficultyStars: string;
  bestDifficultyLabel: string;
  bestBoardSum: number;
  lastScore: number;
  lastDifficultyLevel: number;
  lastDifficultyStars: string;
  lastDifficultyLabel: string;
  lastBoardSum: number;
}

/** 난이도 레벨별(0~5) 최고 점수 기록 */
export type AppleBestByLevel = [number, number, number, number, number, number];

export interface AppleScoresState {
  normalBest: number;
  babyBest: number;
  babyEverUsed: boolean;
  /** 일반 모드에서 최대점(170) 달성 횟수 */
  normal170Count: number;
  /** 응애 모드에서 최대점(170) 달성 횟수 */
  baby170Count: number;
  bestDifficultyLevel: number;
  bestDifficultyStars: string;
  bestDifficultyLabel: string;
  bestBoardSum: number;
  babyBestDifficultyStars: string;
  babyBestDifficultyLabel: string;
  /** 난이도 레벨 0~5 각각의 최고 점수 (일반 모드 한정) */
  bestByLevel: AppleBestByLevel;
  lastScore: number;
  lastDifficultyLevel: number;
  lastDifficultyStars: string;
  lastDifficultyLabel: string;
  lastBoardSum: number;
}

const createEmptyBestByLevel = (): AppleBestByLevel => [0, 0, 0, 0, 0, 0];

const defaultRecordFields = (): Pick<
  AppleScoresState,
  | 'bestDifficultyLevel'
  | 'bestDifficultyStars'
  | 'bestDifficultyLabel'
  | 'bestBoardSum'
  | 'babyBestDifficultyStars'
  | 'babyBestDifficultyLabel'
  | 'bestByLevel'
  | 'lastScore'
  | 'lastDifficultyLevel'
  | 'lastDifficultyStars'
  | 'lastDifficultyLabel'
  | 'lastBoardSum'
> => ({
  bestDifficultyLevel: 0,
  bestDifficultyStars: '☆☆☆☆☆',
  bestDifficultyLabel: '매우 쉬움',
  bestBoardSum: 0,
  babyBestDifficultyStars: '—',
  babyBestDifficultyLabel: '—',
  bestByLevel: createEmptyBestByLevel(),
  lastScore: 0,
  lastDifficultyLevel: 0,
  lastDifficultyStars: '—',
  lastDifficultyLabel: '—',
  lastBoardSum: 0,
});

const defaultScores = (): AppleScoresState => ({
  normalBest: 0,
  babyBest: 0,
  babyEverUsed: false,
  normal170Count: 0,
  baby170Count: 0,
  ...defaultRecordFields(),
});

/** best 난이도 레벨은 0~5만 허용 */
function parseBestDifficultyLevel(raw: unknown): number {
  const n =
    typeof raw === 'number' && Number.isFinite(raw) ? Math.floor(raw) : 0;
  if (n < 0) return 0;
  if (n > 5) return 5;
  return n;
}

/** 직전 판: 응애 모드는 -1, 그 외 0~5 */
function parseLastDifficultyLevel(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0;
  const n = Math.floor(raw);
  if (n === -1) return -1;
  if (n < 0) return 0;
  if (n > 5) return 5;
  return n;
}

function parseBestByLevel(raw: unknown): AppleBestByLevel {
  const out = createEmptyBestByLevel();
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i < 6; i += 1) {
    const v = raw[i];
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
      out[i] = Math.max(0, Math.floor(v));
    }
  }
  return out;
}

function parseScores(raw: string): AppleScoresState | null {
  try {
    const p = JSON.parse(raw) as Partial<AppleScoresState>;
    const base = defaultRecordFields();
    const babyBest =
      typeof p.babyBest === 'number' && Number.isFinite(p.babyBest)
        ? Math.max(0, p.babyBest)
        : 0;
    const normalBest =
      typeof p.normalBest === 'number' && Number.isFinite(p.normalBest)
        ? Math.max(0, p.normalBest)
        : 0;
    const bestDifficultyLevel = parseBestDifficultyLevel(p.bestDifficultyLevel);
    const bestByLevel = parseBestByLevel(p.bestByLevel);
    // 기존에 저장된 normalBest를 레벨별 랭킹에 backfill (해당 레벨 기록보다 크거나, 레벨별 최대값보다 큰 경우에 반영)
    if (normalBest > 0) {
      const currentAtLevel = bestByLevel[bestDifficultyLevel] ?? 0;
      const maxInBestByLevel = Math.max(...bestByLevel);
      if (normalBest > currentAtLevel || normalBest > maxInBestByLevel) {
        bestByLevel[bestDifficultyLevel] = Math.max(currentAtLevel, normalBest);
      }
    }
    return {
      normalBest,
      babyBest,
      babyEverUsed: p.babyEverUsed === true || babyBest > 0,
      normal170Count:
        typeof p.normal170Count === 'number' && Number.isFinite(p.normal170Count)
          ? Math.max(0, Math.floor(p.normal170Count))
          : 0,
      baby170Count:
        typeof p.baby170Count === 'number' && Number.isFinite(p.baby170Count)
          ? Math.max(0, Math.floor(p.baby170Count))
          : 0,
      bestDifficultyLevel,
      bestDifficultyStars: typeof p.bestDifficultyStars === 'string' ? p.bestDifficultyStars : base.bestDifficultyStars,
      bestDifficultyLabel: typeof p.bestDifficultyLabel === 'string' ? p.bestDifficultyLabel : base.bestDifficultyLabel,
      bestBoardSum: typeof p.bestBoardSum === 'number' && Number.isFinite(p.bestBoardSum) ? Math.max(0, p.bestBoardSum) : 0,
      babyBestDifficultyStars:
        typeof p.babyBestDifficultyStars === 'string' ? p.babyBestDifficultyStars : base.babyBestDifficultyStars,
      babyBestDifficultyLabel:
        typeof p.babyBestDifficultyLabel === 'string' ? p.babyBestDifficultyLabel : base.babyBestDifficultyLabel,
      bestByLevel,
      lastScore: typeof p.lastScore === 'number' && Number.isFinite(p.lastScore) ? Math.max(0, p.lastScore) : 0,
      lastDifficultyLevel: parseLastDifficultyLevel(p.lastDifficultyLevel),
      lastDifficultyStars: typeof p.lastDifficultyStars === 'string' ? p.lastDifficultyStars : base.lastDifficultyStars,
      lastDifficultyLabel: typeof p.lastDifficultyLabel === 'string' ? p.lastDifficultyLabel : base.lastDifficultyLabel,
      lastBoardSum: typeof p.lastBoardSum === 'number' && Number.isFinite(p.lastBoardSum) ? Math.max(0, p.lastBoardSum) : 0,
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
      if (s) {
        // parseScores가 backfill한 결과를 즉시 영속화 (다음 로드부터는 그대로 사용)
        try {
          const reparsed = JSON.parse(v2) as Partial<AppleScoresState>;
          const storedBestByLevel = Array.isArray(reparsed.bestByLevel) ? reparsed.bestByLevel : [];
          const changed =
            storedBestByLevel.length !== 6 ||
            s.bestByLevel.some((v, i) => v !== storedBestByLevel[i]);
          if (changed) saveAppleScores(s);
        } catch {
          /* ignore */
        }
        return s;
      }
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
        ...defaultRecordFields(),
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

/** 일반/응애 BEST 점수·난이도 기록 초기화 (응애모드 사용 이력·트로피 횟수는 유지) */
export function clearAppleBestScore(): void {
  const cur = loadAppleScores();
  saveAppleScores({
    ...cur,
    normalBest: 0,
    babyBest: 0,
    ...defaultRecordFields(),
  });
}
