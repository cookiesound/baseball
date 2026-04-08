import type { DragOverlayRect } from '../../hooks/useDragSelect';
import './DragSelection.scss';

interface DragSelectionProps {
  rect: DragOverlayRect | null;
  visible: boolean;
}

export function DragSelection({ rect, visible }: DragSelectionProps) {
  if (!visible || !rect) return null;
  const { left, top, width, height } = rect;

  return (
    <div
      className="drag-rect"
      style={{
        left,
        top,
        width,
        height,
      }}
    />
  );
}
