import { HomeOutlined, ReloadOutlined, TrophyOutlined } from '@ant-design/icons';
import { Button, Modal, Space, Typography } from 'antd';
import './ResultModal.scss';

const { Paragraph, Text, Title } = Typography;

interface ResultModalProps {
  open: boolean;
  isWin: boolean;
  answer: string;
  attemptCount: number;
  gainedScore: number;
  onNewGame: () => void;
  onMain: () => void;
}

export function ResultModal({
  open,
  isWin,
  answer,
  attemptCount,
  gainedScore,
  onNewGame,
  onMain,
}: ResultModalProps) {
  return (
    <Modal
      open={open}
      closable={false}
      maskClosable={false}
      footer={null}
      width={480}
      className="result-modal"
      centered
    >
      <div className="result-modal__body">
        {isWin ? <TrophyOutlined className="result-modal__icon result-modal__icon--win" /> : null}

        <Title level={4} className="result-modal__headline">
          {isWin ? '정답입니다!' : '게임 오버'}
        </Title>

        <Paragraph className="result-modal__answer">
          정답:{' '}
          <Text className="result-modal__answer-digits" copyable>
            {answer}
          </Text>
        </Paragraph>

        <Paragraph type="secondary">시도 횟수: {attemptCount}회</Paragraph>

        <Paragraph className="result-modal__scoreline">
          획득 점수:{' '}
          <Text strong type={gainedScore < 0 ? 'danger' : 'success'}>
            {gainedScore > 0 ? `+${gainedScore}` : gainedScore}점
          </Text>
        </Paragraph>

        <Space className="result-modal__actions" direction="vertical" size={12} style={{ width: '100%' }}>
          <Button type="primary" icon={<ReloadOutlined />} block size="large" onClick={onNewGame}>
            새 게임
          </Button>
          <Button icon={<HomeOutlined />} block size="large" onClick={onMain}>
            메인으로
          </Button>
        </Space>
      </div>
    </Modal>
  );
}
