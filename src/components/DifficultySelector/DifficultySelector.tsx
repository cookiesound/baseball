import { BulbOutlined, FireOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Typography } from 'antd';
import type { KeyboardEvent, ReactNode } from 'react';
import type { Difficulty } from '../../types/gameTypes';
import './DifficultySelector.scss';

const { Text, Title } = Typography;

const items: {
  key: Difficulty;
  title: string;
  blurb: string;
  icon: ReactNode;
}[] = [
  {
    key: 'easy',
    title: '쉬움',
    blurb: '힌트·중복 방지, 가장 낮은 점수',
    icon: <BulbOutlined className="diff-icon diff-icon--easy" />,
  },
  {
    key: 'normal',
    title: '보통',
    blurb: '힌트 없음, 균형 점수',
    icon: <ThunderboltOutlined className="diff-icon diff-icon--normal" />,
  },
  {
    key: 'hard',
    title: '어려움',
    blurb: '7회 제한, 제약 없음, 고득점 · 실패 시 -100',
    icon: <FireOutlined className="diff-icon diff-icon--hard" />,
  },
];

interface DifficultySelectorProps {
  onSelect: (d: Difficulty) => void;
}

export function DifficultySelector({ onSelect }: DifficultySelectorProps) {
  return (
    <div className="difficulty-selector">
      {items.map((item) => (
        <Card
          key={item.key}
          className="difficulty-selector__card"
          hoverable
          role="button"
          tabIndex={0}
          onClick={() => onSelect(item.key)}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(item.key);
            }
          }}
        >
          <div className="difficulty-selector__card-inner">
            {item.icon}
            <Title level={4} className="difficulty-selector__title">
              {item.title}
            </Title>
            <Text type="secondary" className="difficulty-selector__blurb">
              {item.blurb}
            </Text>
          </div>
        </Card>
      ))}
    </div>
  );
}
