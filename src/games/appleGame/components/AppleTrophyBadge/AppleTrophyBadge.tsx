import { CrownOutlined, TrophyOutlined } from '@ant-design/icons';
import { cn } from '../../../../utils/cn';
import './AppleTrophyBadge.scss';

export type AppleTrophyVariant = 'normal' | 'baby';

interface AppleTrophyBadgeProps {
  variant: AppleTrophyVariant;
  /** 해당 모드 170점 달성 누적 횟수 */
  count: number;
  /** 메인 타이틀 옆 / 게임오버 모달 등 크기·스타일 */
  context?: 'menu' | 'modal';
}

export function AppleTrophyBadge({ variant, count, context = 'menu' }: AppleTrophyBadgeProps) {
  const showCount = count >= 2;
  const Icon = variant === 'normal' ? TrophyOutlined : CrownOutlined;

  return (
    <span
      className={cn(
        'apple-trophy-badge',
        `apple-trophy-badge--${variant}`,
        `apple-trophy-badge--ctx-${context}`,
      )}
      title={`최대 점수 달성 ${count}회`}
      aria-label={`트로피 달성 ${count}회`}
    >
      <Icon className="apple-trophy-badge__icon" />
      {showCount ? <span className="apple-trophy-badge__count">{count}</span> : null}
    </span>
  );
}
