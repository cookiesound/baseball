import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

export interface LocalPixelRect {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface PixelPoint {
  x: number;
  y: number;
}

interface UseDragSelectOptions {
  boardRef: RefObject<HTMLElement | null>;
  disabled: boolean;
  /** 드래그 종료 시 보드 기준 로컬 픽셀 사각형 */
  onComplete: (rect: LocalPixelRect) => void;
  /** 너무 작은 클릭은 무시 (px) */
  minDragSize?: number;
}

export interface DragOverlayRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function useDragSelect({
  boardRef,
  disabled,
  onComplete,
  minDragSize = 4,
}: UseDragSelectOptions) {
  const [drag, setDrag] = useState<{ start: PixelPoint; end: PixelPoint } | null>(null);
  const pendingEndRef = useRef<PixelPoint | null>(null);
  const rafRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const flushRaf = useCallback(() => {
    rafRef.current = null;
    const p = pendingEndRef.current;
    if (!p) return;
    setDrag((d) => (d ? { ...d, end: p } : d));
  }, []);

  const scheduleEnd = useCallback(
    (p: PixelPoint) => {
      pendingEndRef.current = p;
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(flushRaf);
    },
    [flushRaf],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const toLocalPixel = useCallback((clientX: number, clientY: number): PixelPoint | null => {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    let x = clientX - rect.left;
    let y = clientY - rect.top;
    x = Math.min(rect.width, Math.max(0, x));
    y = Math.min(rect.height, Math.max(0, y));
    return { x, y };
  }, [boardRef]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (disabled || e.button !== 0) return;
      const p = toLocalPixel(e.clientX, e.clientY);
      if (!p) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      pendingEndRef.current = p;
      setDrag({ start: p, end: p });
    },
    [disabled, toLocalPixel],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!drag) return;
      const p = toLocalPixel(e.clientX, e.clientY);
      if (p) scheduleEnd(p);
    },
    [drag, scheduleEnd, toLocalPixel],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!drag) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      const p = toLocalPixel(e.clientX, e.clientY) ?? drag.end;
      const minX = Math.min(drag.start.x, p.x);
      const maxX = Math.max(drag.start.x, p.x);
      const minY = Math.min(drag.start.y, p.y);
      const maxY = Math.max(drag.start.y, p.y);
      const w = maxX - minX;
      const h = maxY - minY;
      setDrag(null);
      pendingEndRef.current = null;
      if (w < minDragSize && h < minDragSize) return;
      onCompleteRef.current({ minX, maxX, minY, maxY });
    },
    [drag, minDragSize, toLocalPixel],
  );

  const onPointerCancel = useCallback(() => {
    setDrag(null);
    pendingEndRef.current = null;
  }, []);

  const overlayRect: DragOverlayRect | null = useMemo(() => {
    if (!drag) return null;
    const left = Math.min(drag.start.x, drag.end.x);
    const top = Math.min(drag.start.y, drag.end.y);
    const width = Math.abs(drag.end.x - drag.start.x);
    const height = Math.abs(drag.end.y - drag.start.y);
    return { left, top, width, height };
  }, [drag]);

  return {
    overlayRect,
    isDragging: drag !== null,
    pointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
  };
}
