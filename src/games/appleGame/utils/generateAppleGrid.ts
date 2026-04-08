import type { AppleCell } from '../types/appleGameTypes';
import { APPLE_GRID_COLS, APPLE_GRID_ROWS } from '../types/appleGameTypes';

const BABY_VALUE_WEIGHTS: ReadonlyArray<{ v: number; w: number }> = [
  { v: 1, w: 15 },
  { v: 2, w: 15 },
  { v: 3, w: 15 },
  { v: 4, w: 7 },
  { v: 5, w: 7 },
  { v: 6, w: 6 },
  { v: 7, w: 6 },
  { v: 8, w: 2 },
  { v: 9, w: 2 },
];

const BABY_WEIGHT_TOTAL = BABY_VALUE_WEIGHTS.reduce((s, x) => s + x.w, 0);

function randomValueBabyFriendly(): number {
  let r = Math.random() * BABY_WEIGHT_TOTAL;
  for (const { v, w } of BABY_VALUE_WEIGHTS) {
    r -= w;
    if (r <= 0) return v;
  }
  return 9;
}

export interface GenerateAppleGridOptions {
  /** true면 1~3은 자주, 8~9는 드물게 등장 */
  babyFriendlyDistribution?: boolean;
}

export function generateAppleGrid(
  cols: number = APPLE_GRID_COLS,
  rows: number = APPLE_GRID_ROWS,
  opts?: GenerateAppleGridOptions,
): AppleCell[][] {
  const baby = opts?.babyFriendlyDistribution === true;
  const grid: AppleCell[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: AppleCell[] = [];
    for (let x = 0; x < cols; x++) {
      row.push({
        id: `${x}-${y}`,
        value: baby ? randomValueBabyFriendly() : Math.floor(Math.random() * 9) + 1,
        x,
        y,
        removed: false,
      });
    }
    grid.push(row);
  }
  return grid;
}
