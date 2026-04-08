import { CopyOutlined } from "@ant-design/icons";
import { Button, Modal, Tooltip, Typography } from "antd";
import { cn } from "../../../../utils/cn";
import {
  AppleTrophyBadge,
  type AppleTrophyVariant,
} from "../AppleTrophyBadge/AppleTrophyBadge";
import "./GameOverModal.scss";

const { Title, Text } = Typography;

interface GameOverModalProps {
  open: boolean;
  score: number;
  onRestart: () => void;
  /** 최대점(170) 달성 시 초록 점수 + 트로피 */
  showPerfectTrophy?: boolean;
  trophyVariant?: AppleTrophyVariant;
  /** 해당 모드 누적 완판 횟수(배지는 2회 이상) */
  trophyAchieveCount?: number;
  onCaptureUi?: () => void;
  captureLoading?: boolean;
  getContainer?: HTMLElement | (() => HTMLElement) | false;
}

export function GameOverModal({
  open,
  score,
  onRestart,
  showPerfectTrophy = false,
  trophyVariant = "normal",
  trophyAchieveCount = 0,
  onCaptureUi,
  captureLoading = false,
  getContainer,
}: GameOverModalProps) {
  const showTrophy = showPerfectTrophy && trophyAchieveCount >= 1;

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
        <Text
          className={cn(
            "game-over-modal__score",
            showPerfectTrophy && "game-over-modal__score--max",
          )}
        >
          <span className="game-over-modal__score-row">
            <strong>{score}</strong>
            {showTrophy ? (
              <AppleTrophyBadge
                variant={trophyVariant}
                count={trophyAchieveCount}
                context="modal"
              />
            ) : null}
          </span>
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
