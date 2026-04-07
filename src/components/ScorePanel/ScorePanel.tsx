import { AimOutlined, BarChartOutlined, ExperimentOutlined } from '@ant-design/icons';
import { Card, Statistic, Tag, Typography } from 'antd';
import type { Difficulty } from '../../types/gameTypes';
import { cn } from '../../utils/cn';
import './ScorePanel.scss';

const { Text } = Typography;

const difficultyLabel: Record<Difficulty, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
};

interface ScorePanelProps {
  totalScore: number;
  difficulty: Difficulty;
  attemptCount: number;
  remainingHard: number | null;
}

export function ScorePanel({ totalScore, difficulty, attemptCount, remainingHard }: ScorePanelProps) {
  const isLow =
    difficulty === 'hard' && remainingHard !== null && remainingHard <= 2 && remainingHard >= 0;

  return (
    <Card className="score-panel" bordered={false}>
      <div className="score-panel__stats">
        <Statistic
          className="score-panel__stat score-panel__stat--total"
          title={
            <span className="score-panel__label">
              <BarChartOutlined /> 누적 점수
            </span>
          }
          value={totalScore}
          valueStyle={{ color: 'rgba(255,255,255,0.92)', fontWeight: 700 }}
        />
      </div>

      <div className="score-panel__meta">
        <div className="score-panel__row">
          <Text type="secondary" className="score-panel__muted">
            <ExperimentOutlined /> 난이도
          </Text>
          <Tag color="purple" className="score-panel__diff-tag">
            {difficultyLabel[difficulty]}
          </Tag>
        </div>

        <div className="score-panel__row">
          <Text type="secondary" className="score-panel__muted">
            <AimOutlined /> 시도 횟수
          </Text>
          <Text strong className="score-panel__value">
            {attemptCount}회
          </Text>
        </div>

        {difficulty === 'hard' && remainingHard !== null && (
          <div
            className={cn(
              'score-panel__row',
              'score-panel__row--remain',
              { 'score-panel__row--danger': remainingHard <= 2 },
              { 'score-panel__row--warn': remainingHard === 3 },
            )}
          >
            <Text type="secondary" className="score-panel__muted">
              남은 기회
            </Text>
            <Text strong className={cn('score-panel__value', { 'score-panel__pulse': isLow })}>
              {remainingHard}회
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
}
