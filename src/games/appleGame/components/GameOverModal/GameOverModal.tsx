import { Button, Modal, Typography } from "antd";
import "./GameOverModal.scss";

const { Title, Text } = Typography;

interface GameOverModalProps {
  open: boolean;
  score: number;
  onRestart: () => void;
  /** 모달을 붙일 DOM (사과 게임 영역 등). 없으면 document.body */
  getContainer?: HTMLElement | (() => HTMLElement) | false;
}

export function GameOverModal({
  open,
  score,
  onRestart,
  getContainer,
}: GameOverModalProps) {
  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      centered
      width={400}
      className="game-over-modal"
      rootClassName="game-over-modal-root"
      maskClosable={false}
      getContainer={getContainer}
    >
      <div className="game-over-modal__body">
        <Title level={3} className="game-over-modal__title">
          GAME OVER
        </Title>
        <Text className="game-over-modal__score">
          <strong>{score}</strong>
        </Text>
        <Button
          type="primary"
          size="large"
          block
          onClick={onRestart}
          className="game-over-modal__btn"
        >
          Restart
        </Button>
      </div>
    </Modal>
  );
}
