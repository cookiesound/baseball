import { CopyOutlined } from "@ant-design/icons";
import { Button, Modal, Tooltip, Typography } from "antd";
import "./GameOverModal.scss";

const { Title, Text } = Typography;

interface GameOverModalProps {
  open: boolean;
  score: number;
  onRestart: () => void;
  /** 게임 세션 UI(모달 포함) 캡처: 복사·다운로드 처리는 호출부 */
  onCaptureUi?: () => void;
  captureLoading?: boolean;
  /** 모달을 붙일 DOM (사과 게임 영역 등). 없으면 document.body */
  getContainer?: HTMLElement | (() => HTMLElement) | false;
}

export function GameOverModal({
  open,
  score,
  onRestart,
  onCaptureUi,
  captureLoading = false,
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
        <div className="game-over-modal__actions">
          <Button
            type="primary"
            size="large"
            onClick={onRestart}
            className="game-over-modal__btn"
          >
            Restart
          </Button>
          {onCaptureUi ? (
            <Tooltip title="게임 화면 전체를 캡처합니다.">
              <Button
                size="large"
                icon={<CopyOutlined />}
                onClick={onCaptureUi}
                loading={captureLoading}
                className="game-over-modal__capture"
                aria-label="화면 캡처 복사"
              />
            </Tooltip>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
