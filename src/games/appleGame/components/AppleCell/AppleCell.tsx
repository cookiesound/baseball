import { memo } from 'react';
import type { AppleCell as AppleCellType } from '../../types/appleGameTypes';
import { cn } from '../../../../utils/cn';
import './AppleCell.scss';

interface AppleCellProps {
  cell: AppleCellType;
  highlighted: boolean;
  popping: boolean;
}

export const AppleCell = memo(function AppleCell({ cell, highlighted, popping }: AppleCellProps) {
  if (cell.removed) {
    return <div className="apple-cell apple-cell--removed" aria-hidden />;
  }

  return (
    <div
      className={cn(
        'apple-cell',
        (cell.x + cell.y) % 2 === 1 && 'apple-cell--alt',
        highlighted && 'apple-cell--highlight',
        popping && 'apple-cell--pop',
      )}
      data-grid-x={cell.x}
      data-grid-y={cell.y}
    >
      <div className="apple-cell__fruit">
        <span className="apple-cell__emoji" aria-hidden>
          🍎
        </span>
        <span className="apple-cell__num">{cell.value}</span>
      </div>
    </div>
  );
});
