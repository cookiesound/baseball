export function clientPointToGrid(
  rect: DOMRect,
  clientX: number,
  clientY: number,
  cols: number,
  rows: number,
): { x: number; y: number } | null {
  const relX = clientX - rect.left;
  const relY = clientY - rect.top;
  const cw = rect.width / cols;
  const ch = rect.height / rows;
  if (cw <= 0 || ch <= 0) return null;
  const x = Math.floor(relX / cw);
  const y = Math.floor(relY / ch);
  if (x < 0 || x >= cols || y < 0 || y >= rows) return null;
  return { x, y };
}

export function clampGridPoint(
  x: number,
  y: number,
  cols: number,
  rows: number,
): { x: number; y: number } {
  return {
    x: Math.min(cols - 1, Math.max(0, x)),
    y: Math.min(rows - 1, Math.max(0, y)),
  };
}
