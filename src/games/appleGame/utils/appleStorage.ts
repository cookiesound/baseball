import type { AppleBestScoreData } from '../types/appleGameTypes';
import { APPLE_STORAGE_KEY } from '../types/appleGameTypes';

export function loadAppleBestScore(): AppleBestScoreData {
  try {
    const raw = localStorage.getItem(APPLE_STORAGE_KEY);
    if (!raw) return { bestScore: 0 };
    const parsed = JSON.parse(raw) as Partial<AppleBestScoreData>;
    return {
      bestScore: typeof parsed.bestScore === 'number' && Number.isFinite(parsed.bestScore) ? parsed.bestScore : 0,
    };
  } catch {
    return { bestScore: 0 };
  }
}

export function saveAppleBestScore(data: AppleBestScoreData): void {
  localStorage.setItem(APPLE_STORAGE_KEY, JSON.stringify(data));
}

export function clearAppleBestScore(): void {
  localStorage.removeItem(APPLE_STORAGE_KEY);
}
