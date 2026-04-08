import { QuestionCircleOutlined, UndoOutlined } from '@ant-design/icons';
import { App, Button, Statistic, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DifficultySelector } from '../../components/DifficultySelector/DifficultySelector';
import { HelpModal } from '../../components/HelpModal/HelpModal';
import { useScoreContext } from '../../context/ScoreContext';
import type { Difficulty } from '../../types/gameTypes';
import './NumberBaseballPage.scss';

const { Paragraph, Text, Title } = Typography;

export function NumberBaseballPage() {
  const navigate = useNavigate();
  const { modal } = App.useApp();
  const { scoreData, resetScore } = useScoreContext();
  const [helpOpen, setHelpOpen] = useState(false);

  const goGame = (d: Difficulty) => {
    navigate(`/game/${d}`);
  };

  const confirmReset = () => {
    modal.confirm({
      title: '점수를 초기화할까요?',
      content: '저장된 누적 점수와 승수 기록이 모두 삭제됩니다.',
      okText: '초기화',
      cancelText: '취소',
      okButtonProps: { danger: true },
      onOk: () => {
        resetScore();
      },
    });
  };

  return (
    <div className="number-baseball-page">
      <div className="number-baseball-page__inner">
        <header className="number-baseball-page__hero">
          <Title level={1} className="number-baseball-page__title">
            Number Baseball
          </Title>
          <Paragraph className="number-baseball-page__lead">
            중복 없는 4자리 숫자를 맞추는 논리 퍼즐입니다. 난이도별 규칙과 점수가 달라요.
          </Paragraph>
        </header>

        <section className="number-baseball-page__score" aria-label="누적 점수">
          <Statistic
            className="number-baseball-page__stat"
            title={<span className="number-baseball-page__stat-title">현재 누적 점수</span>}
            value={scoreData.totalScore}
            valueStyle={{
              color: '#e599f7',
              fontWeight: 800,
              fontSize: 40,
              lineHeight: 1.1,
            }}
          />
          <div className="number-baseball-page__sub">
            <Text type="secondary">
              플레이 {scoreData.gamesPlayed}회 · 승 Easy {scoreData.easyWins} / Normal {scoreData.normalWins} / Hard{' '}
              {scoreData.hardWins}
            </Text>
          </div>
        </section>

        <div className="number-baseball-page__actions">
          <Button icon={<QuestionCircleOutlined />} size="large" onClick={() => setHelpOpen(true)}>
            도움말
          </Button>
          <Button icon={<UndoOutlined />} size="large" danger type="default" onClick={confirmReset}>
            점수 초기화
          </Button>
        </div>

        <section className="number-baseball-page__selector" aria-label="난이도 선택">
          <Title level={4} className="number-baseball-page__section-title">
            난이도 선택
          </Title>
          <DifficultySelector onSelect={goGame} />
        </section>
      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
