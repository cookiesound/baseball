import { BulbOutlined } from '@ant-design/icons';
import { Card, Empty, Typography } from 'antd';
import type { KeyboardEvent } from 'react';
import './HintPanel.scss';

const { Text, Title } = Typography;

interface HintPanelProps {
  hints: string[];
  active: boolean;
  disabled?: boolean;
  onHintPick?: (value: string) => void;
}

export function HintPanel({ hints, active, disabled, onHintPick }: HintPanelProps) {
  const clickable = Boolean(active && onHintPick && !disabled);

  const handleHintKeyDown = (value: string) => (e: KeyboardEvent) => {
    if (!clickable || !onHintPick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onHintPick(value);
    }
  };

  return (
    <Card className={`hint-panel ${active ? 'hint-panel--active' : 'hint-panel--inactive'}`} bordered={false}>
      <div className="hint-panel__head">
        <BulbOutlined className="hint-panel__icon" />
        <div>
          <Title level={5} className="hint-panel__title">
            추천 숫자
          </Title>
          <Text type="secondary" className="hint-panel__sub">
            쉬움 모드 전용 · 제출할 때마다 갱신
            {active ? ' · 항목을 클릭하면 아래 입력칸에 채워집니다' : ''}
          </Text>
        </div>
      </div>

      {!active ? (
        <Empty className="hint-panel__empty" image={Empty.PRESENTED_IMAGE_SIMPLE} description="이 난이도에서는 힌트가 제공되지 않습니다." />
      ) : hints.length === 0 ? (
        <Empty className="hint-panel__empty" image={Empty.PRESENTED_IMAGE_SIMPLE} description="기록을 쌓으면 후보가 줄어듭니다." />
      ) : (
        <ul className="hint-panel__list">
          {hints.map((h) => (
            <li
              key={h}
              className={`hint-panel__item${clickable ? ' hint-panel__item--clickable' : ''}`}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={() => {
                if (clickable && onHintPick) onHintPick(h);
              }}
              onKeyDown={handleHintKeyDown(h)}
            >
              <Text className="hint-panel__digits">{h}</Text>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
