import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../../../utils/cn';
import type { AppleCell as AppleCellType } from '../../types/appleGameTypes';
import { useDragSelect } from '../../hooks/useDragSelect';
import { collectCellIdsInLocalPixelRect } from '../../utils/collectCellsInPixelRect';
import { calculateAppleSum } from '../../utils/calculateAppleSum';
import { AppleCell } from '../AppleCell/AppleCell';
import { DragSelection } from '../DragSelection/DragSelection';
import { TimerBar } from '../TimerBar/TimerBar';
import './AppleBoard.scss';

interface AppleBoardProps {
  grid: AppleCellType[][];
  time: number;
  sessionDuration: number;
  poppingIds: Set<string>;
  disabled: boolean;
  babyMode?: boolean;
  onSelectionComplete: (picked: AppleCellType[]) => void;
}

export function AppleBoard({
  grid,
  time,
  sessionDuration,
  poppingIds,
  disabled,
  babyMode = false,
  onSelectionComplete,
}: AppleBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [stacked, setStacked] = useState(false);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const apply = () => setStacked(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const handleDragComplete = useCallback(
    (local: { minX: number; maxX: number; minY: number; maxY: number }) => {
      const board = boardRef.current;
      if (!board) return;
      const ids = collectCellIdsInLocalPixelRect(board, local);
      const picked: AppleCellType[] = [];
      for (const row of grid) {
        for (const c of row) {
          if (ids.has(c.id) && !c.removed) picked.push(c);
        }
      }
      onSelectionComplete(picked);
    },
    [grid, onSelectionComplete],
  );

  const { overlayRect, isDragging, pointerHandlers } = useDragSelect({
    boardRef,
    disabled,
    onComplete: handleDragComplete,
  });

  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!isDragging || !board || !overlayRect) {
      setHighlightIds(new Set());
      return;
    }
    const { left, top, width, height } = overlayRect;
    const ids = collectCellIdsInLocalPixelRect(board, {
      minX: left,
      maxX: left + width,
      minY: top,
      maxY: top + height,
    });
    setHighlightIds(ids);
  }, [isDragging, overlayRect]);

  const dragSum = useMemo(() => {
    if (!babyMode || highlightIds.size === 0) return null;
    const picked: AppleCellType[] = [];
    for (const row of grid) {
      for (const c of row) {
        if (highlightIds.has(c.id) && !c.removed) picked.push(c);
      }
    }
    return calculateAppleSum(picked);
  }, [babyMode, grid, highlightIds]);

  const cells = useMemo(
    () =>
      grid.flatMap((row) =>
        row.map((cell) => (
          <AppleCell
            key={cell.id}
            cell={cell}
            highlighted={highlightIds.has(cell.id)}
            popping={poppingIds.has(cell.id)}
          />
        )),
      ),
    [grid, highlightIds, poppingIds],
  );

  const showSumHint = Boolean(babyMode && isDragging && overlayRect && dragSum !== null);

  return (
    <div className={cn('apple-game-frame', stacked && 'apple-game-frame--stack')}>
      <div
        ref={boardRef}
        className={cn('apple-game-board', isDragging && 'apple-game-board--dragging')}
        {...pointerHandlers}
      >
        {cells}
        <DragSelection rect={overlayRect} visible={isDragging} />
        {showSumHint && overlayRect ? (
          <div
            className="apple-game-board__drag-sum"
            style={{
              left: overlayRect.left + overlayRect.width / 2,
              top: overlayRect.top + overlayRect.height + 6,
            }}
          >
            합계 <span className="apple-game-board__drag-sum-num">{dragSum}</span>
          </div>
        ) : null}
      </div>
      <TimerBar time={time} duration={sessionDuration} />
    </div>
  );
}
