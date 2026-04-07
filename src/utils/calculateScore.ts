import type { Difficulty } from '../types/gameTypes';

/**
 * 난이도·시도 횟수·승패에 따른 이번 판 점수 (하드 패배 시 -100)
 */
export function calculateScore(
  difficulty: Difficulty,
  attemptCount: number,
  won: boolean,
): number {
  if (difficulty === 'hard' && !won) return -100;
  if (!won) return 0;

  const n = attemptCount;

  if (difficulty === 'easy') {
    if (n <= 1) return 50;
    if (n === 2) return 40;
    if (n === 3) return 30;
    if (n === 4) return 20;
    if (n === 5) return 10;
    return 5;
  }

  if (difficulty === 'normal') {
    if (n <= 1) return 100;
    if (n === 2) return 80;
    if (n === 3) return 60;
    if (n === 4) return 40;
    if (n === 5) return 20;
    return 10;
  }

  if (n <= 1) return 300;
  if (n === 2) return 250;
  if (n === 3) return 200;
  if (n === 4) return 150;
  if (n === 5) return 100;
  if (n === 6) return 50;
  return 30;
}
