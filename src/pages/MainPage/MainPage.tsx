import { AppstoreOutlined, NumberOutlined } from '@ant-design/icons';
import { Card, Typography } from 'antd';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.scss';

const { Paragraph, Title } = Typography;

export function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="game-hub">
      <Title level={1} className="game-hub__title">
        SELECT GAME
      </Title>
      <Paragraph className="game-hub__lead">플레이할 게임을 선택하세요.</Paragraph>
      <div className="game-hub__cards">
        <Card
          className="game-hub__card"
          hoverable
          onClick={() => navigate('/number-baseball')}
          role="button"
          tabIndex={0}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/number-baseball');
            }
          }}
        >
          <div className="game-hub__card-inner">
            <NumberOutlined className="game-hub__icon game-hub__icon--nb" />
            <Title level={4} className="game-hub__card-title">
              Number Baseball
            </Title>
            <Paragraph type="secondary" className="game-hub__card-desc">
              숫자 야구 · 난이도별 규칙과 점수
            </Paragraph>
          </div>
        </Card>
        <Card
          className="game-hub__card"
          hoverable
          onClick={() => navigate('/apple')}
          role="button"
          tabIndex={0}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/apple');
            }
          }}
        >
          <div className="game-hub__card-inner">
            <AppstoreOutlined className="game-hub__icon game-hub__icon--apple" />
            <Title level={4} className="game-hub__card-title">
              Apple Game
            </Title>
            <Paragraph type="secondary" className="game-hub__card-desc">
              사과게임 · 합 10 드래그
            </Paragraph>
          </div>
        </Card>
      </div>
    </div>
  );
}
