import type { Difficulty } from '../types/gameTypes';

export function parseDifficulty(raw: string | undefined): Difficulty | null {
  if (raw === 'easy' || raw === 'normal' || raw === 'hard') return raw;
  return null;
}
