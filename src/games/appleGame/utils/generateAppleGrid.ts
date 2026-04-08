import type { AppleCell } from '../types/appleGameTypes';
import { APPLE_GRID_COLS, APPLE_GRID_ROWS } from '../types/appleGameTypes';

export function generateAppleGrid(
  cols: number = APPLE_GRID_COLS,
  rows: number = APPLE_GRID_ROWS,
): AppleCell[][] {
  const grid: AppleCell[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: AppleCell[] = [];
    for (let x = 0; x < cols; x++) {
      row.push({
        id: `${x}-${y}`,
        value: Math.floor(Math.random() * 9) + 1,
        x,
        y,
        removed: false,
      });
    }
    grid.push(row);
  }
  return grid;
}
