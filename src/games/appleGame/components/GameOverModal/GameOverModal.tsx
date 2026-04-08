import { Button, Modal, Typography } from 'antd';
import './GameOverModal.scss';

const { Title, Text } = Typography;

interface GameOverModalProps {
  open: boolean;
  score: number;
  onRestart: () => void;
}

export function GameOverModal({ open, score, onRestart }: GameOverModalProps) {
  return (
    <Modal open={open} footer={null} closable={false} centered width={400} className="game-over-modal" maskClosable={false}>
      <div className="game-over-modal__body">
        <Title level={3} className="game-over-modal__title">
          GAME OVER
        </Title>
        <Text className="game-over-modal__score">
          Score <strong>{score}</strong>
        </Text>
        <Button type="primary" size="large" block onClick={onRestart} className="game-over-modal__btn">
          Restart
        </Button>
      </div>
    </Modal>
  );
}
