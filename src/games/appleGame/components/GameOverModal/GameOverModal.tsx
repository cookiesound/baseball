import { CopyOutlined } from "@ant-design/icons";
import { Button, Modal, Tooltip, Typography } from "antd";
import { cn } from "../../../../utils/cn";
import type { AppleDifficultyInfo } from "../../utils/getAppleDifficulty";
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
  onMainMenu?: () => void;
  /** 일반 모드: 이번 판 난이도. 응애 모드: null */
  sessionDifficulty?: AppleDifficultyInfo | null;
  isBabyMode?: boolean;
  /** 최대점(170) 달성 시 초록 점수 + 트로피 */
  showPerfectTrophy?: boolean;
  trophyVariant?: AppleTrophyVariant;
  /** 해당 모드 누적 완판 횟수(배지는 2회 이상) */
  trophyAchieveCount?: number;
  onCaptureUi?: () => void;
  captureLoading?: boolean;
  /** 해당 난이도(또는 응애모드) 최고점수 갱신 여부 */
  isNewBest?: boolean;
  getContainer?: HTMLElement | (() => HTMLElement) | false;
}

export function GameOverModal({
  open,
  score,
  onRestart,
  onMainMenu,
  sessionDifficulty = null,
  isBabyMode = false,
  showPerfectTrophy = false,
  trophyVariant = "normal",
  trophyAchieveCount = 0,
  onCaptureUi,
  captureLoading = false,
  isNewBest = false,
  getContainer,
}: GameOverModalProps) {
  const showTrophy = showPerfectTrophy && trophyAchieveCount >= 1;
  const diffLevel =
    isBabyMode || !sessionDifficulty ? -1 : sessionDifficulty.level;

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      centered
      width={520}
      className="game-over-modal"
      rootClassName="game-over-modal-root"
      maskClosable={false}
      getContainer={getContainer}
    >
      <div className="game-over-modal__body">
        <Title level={3} className="game-over-modal__title">
          GAME OVER
        </Title>
        {isNewBest ? (
          <div className="game-over-modal__new-best" aria-live="polite">
            <span className="game-over-modal__new-best-text">
              최고점수 갱신!
            </span>
          </div>
        ) : null}
        <Text
          className={cn(
            "game-over-modal__score",
            showPerfectTrophy && "game-over-modal__score--max",
            isNewBest && "game-over-modal__score--new-best",
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
        <div
          className={cn(
            "game-over-modal__difficulty",
            diffLevel >= 0 && `game-over-modal__difficulty--lv-${diffLevel}`,
            isBabyMode && "game-over-modal__difficulty--baby",
          )}
        >
          {isBabyMode ? (
            <span className="game-over-modal__difficulty-text">응애모드</span>
          ) : sessionDifficulty ? (
            <span className="game-over-modal__difficulty-text">
              {sessionDifficulty.label}{" "}
              <span className="game-over-modal__difficulty-stars">
                ({sessionDifficulty.stars})
              </span>
            </span>
          ) : null}
        </div>
        <div className="game-over-modal__actions">
          <Button
            type="primary"
            size="large"
            onClick={onRestart}
            className="game-over-modal__btn"
          >
            다시 시작
          </Button>
          {onMainMenu ? (
            <Button
              size="large"
              onClick={onMainMenu}
              className="game-over-modal__btn game-over-modal__btn--secondary"
            >
              메인으로
            </Button>
          ) : null}
          {onCaptureUi ? (
            <Tooltip title="게임 화면 전체를 캡처합니다.">
              <Button
                size="large"
                icon={<CopyOutlined />}
                onClick={onCaptureUi}
                loading={captureLoading}
                className="game-over-modal__capture"
                aria-label="화면 캡처 복사"
              >
                복사하기
              </Button>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
