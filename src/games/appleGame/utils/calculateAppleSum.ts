import type { AppleCell } from '../types/appleGameTypes';

export function calculateAppleSum(cells: AppleCell[]): number {
  return cells.reduce((acc, c) => acc + c.value, 0);
}
