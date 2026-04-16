import type { AppleCell } from '../types/appleGameTypes';

/** 격자에 있는 모든 칸의 `value` 합계. 제거된 칸도 값이 유지되면 합계는 초기 보드와 동일합니다. */
export function calculateBoardSum(grid: AppleCell[][]): number {
  let sum = 0;
  for (const row of grid) {
    for (const c of row) {
      sum += c.value;
    }
  }
  return sum;
}
