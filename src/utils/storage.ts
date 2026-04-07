import { emptyScoreData, type ScoreData } from '../types/gameTypes';

const STORAGE_KEY = 'numberBaseballScore';

export function loadScore(): ScoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyScoreData();
    const parsed = JSON.parse(raw) as Partial<ScoreData>;
    const base = emptyScoreData();
    return {
      totalScore: typeof parsed.totalScore === 'number' ? parsed.totalScore : base.totalScore,
      easyWins: typeof parsed.easyWins === 'number' ? parsed.easyWins : base.easyWins,
      normalWins: typeof parsed.normalWins === 'number' ? parsed.normalWins : base.normalWins,
      hardWins: typeof parsed.hardWins === 'number' ? parsed.hardWins : base.hardWins,
      gamesPlayed: typeof parsed.gamesPlayed === 'number' ? parsed.gamesPlayed : base.gamesPlayed,
    };
  } catch {
    return emptyScoreData();
  }
}

export function saveScore(data: ScoreData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearStoredScore(): void {
  localStorage.removeItem(STORAGE_KEY);
}
