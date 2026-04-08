import type { AppleCell } from '../types/appleGameTypes';

function rectsIntersect(
  a: DOMRect,
  b: { left: number; top: number; right: number; bottom: number },
): boolean {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

/** 보드 로컬 좌표(px)의 드래그 사각형과 겹치는 셀 id 집합 */
export function collectCellIdsInLocalPixelRect(
  boardEl: HTMLElement,
  local: { minX: number; maxX: number; minY: number; maxY: number },
): Set<string> {
  const br = boardEl.getBoundingClientRect();
  const minLx = Math.min(local.minX, local.maxX);
  const maxLx = Math.max(local.minX, local.maxX);
  const minLy = Math.min(local.minY, local.maxY);
  const maxLy = Math.max(local.minY, local.maxY);
  const sel = {
    left: br.left + minLx,
    top: br.top + minLy,
    right: br.left + maxLx,
    bottom: br.top + maxLy,
  };
  const ids = new Set<string>();
  boardEl.querySelectorAll('.apple-cell').forEach((node) => {
    const el = node as HTMLElement;
    if (el.classList.contains('apple-cell--removed')) return;
    const cr = el.getBoundingClientRect();
    if (!rectsIntersect(cr, sel)) return;
    const x = el.dataset.gridX;
    const y = el.dataset.gridY;
    if (x === undefined || y === undefined) return;
    ids.add(`${x}-${y}`);
  });
  return ids;
}

/** id 집합에 해당하는 살아있는 AppleCell 목록 (grid 순서 유지) */
export function cellsFromIds(grid: AppleCell[][], ids: Set<string>): AppleCell[] {
  const out: AppleCell[] = [];
  for (const row of grid) {
    for (const c of row) {
      if (ids.has(c.id) && !c.removed) out.push(c);
    }
  }
  return out;
}

export function collectAppleCellsInLocalPixelRect(
  boardEl: HTMLElement,
  grid: AppleCell[][],
  local: { minX: number; maxX: number; minY: number; maxY: number },
): AppleCell[] {
  const ids = collectCellIdsInLocalPixelRect(boardEl, local);
  return cellsFromIds(grid, ids);
}
