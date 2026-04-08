import type { AppleCell } from '../types/appleGameTypes';

export function getCellsInRect(
  grid: AppleCell[][],
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
): AppleCell[] {
  const out: AppleCell[] = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const row = grid[y];
      if (!row) continue;
      const c = row[x];
      if (c && !c.removed) out.push(c);
    }
  }
  return out;
}
