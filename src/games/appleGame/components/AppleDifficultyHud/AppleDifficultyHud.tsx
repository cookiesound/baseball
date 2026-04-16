import { cn } from '../../../../utils/cn';
import type { AppleDifficultyInfo } from '../../utils/getAppleDifficulty';
import './AppleDifficultyHud.scss';

interface AppleDifficultyHudProps {
  difficulty: AppleDifficultyInfo | null;
  babyMode?: boolean;
}

export function AppleDifficultyHud({ difficulty, babyMode }: AppleDifficultyHudProps) {
  if (babyMode) {
    return (
      <div className="apple-difficulty-hud apple-difficulty-hud--baby" aria-live="polite">
        <span className="apple-difficulty-hud__label">현재 난이도:</span>
        <span className="apple-difficulty-hud__value">응애모드</span>
      </div>
    );
  }
  if (!difficulty) return null;
  return (
    <div
      className={cn(
        'apple-difficulty-hud',
        `apple-difficulty-hud--lv-${difficulty.level}`,
      )}
      aria-live="polite"
    >
      <span className="apple-difficulty-hud__label">현재 난이도:</span>
      <span className="apple-difficulty-hud__value">
        {difficulty.label}{' '}
        <span className="apple-difficulty-hud__stars">({difficulty.stars})</span>
      </span>
    </div>
  );
}
