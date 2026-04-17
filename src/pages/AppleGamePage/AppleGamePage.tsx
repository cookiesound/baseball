import {
  AppstoreOutlined,
  QuestionCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { App, Button, Checkbox, Modal, Slider, Tooltip, Typography } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppleBoard } from "../../games/appleGame/components/AppleBoard/AppleBoard";
import { AppleDifficultyHud } from "../../games/appleGame/components/AppleDifficultyHud/AppleDifficultyHud";
import { AppleTrophyBadge } from "../../games/appleGame/components/AppleTrophyBadge/AppleTrophyBadge";
import { GameOverModal } from "../../games/appleGame/components/GameOverModal/GameOverModal";
import { ScoreDisplay } from "../../games/appleGame/components/ScoreDisplay/ScoreDisplay";

const APPLE_LEVEL_ROWS: Array<{ level: number; stars: string; label: string }> = [
  { level: 0, stars: "☆☆☆☆☆", label: "매우 쉬움" },
  { level: 1, stars: "★☆☆☆☆", label: "쉬움" },
  { level: 2, stars: "★★☆☆☆", label: "보통" },
  { level: 3, stars: "★★★☆☆", label: "어려움" },
  { level: 4, stars: "★★★★☆", label: "매우 어려움" },
  { level: 5, stars: "★★★★★", label: "극악" },
];
import {
  useAppleGame,
  type AppleSessionEndMeta,
} from "../../games/appleGame/hooks/useAppleGame";
import { useAppleGameAudio } from "../../games/appleGame/hooks/useAppleGameAudio";
import {
  APPLE_GAME_DURATION_BABY,
  APPLE_GAME_DURATION_NORMAL,
  APPLE_MAX_SCORE,
} from "../../games/appleGame/types/appleGameTypes";
import {
  captureElementToImageBlobs,
  copyPngToClipboard,
  downloadBlob,
} from "../../games/appleGame/utils/captureSessionImage";
import {
  clearAppleBestScore,
  loadAppleScores,
  markAppleBabyModeEverUsed,
  saveAppleScores,
  type AppleScoresState,
} from "../../games/appleGame/utils/appleStorage";
import "./AppleGamePage.scss";

const { Paragraph, Text, Title } = Typography;

const BABY_EXTRA_SEC = APPLE_GAME_DURATION_BABY - APPLE_GAME_DURATION_NORMAL;

const BABY_MODE_HELP = (
  <div className="apple-game-page__baby-tooltip">
    <p>작은 숫자(1~3)가 조금 더 자주, 큰 숫자(8~9)는 더 드물게 나옵니다.</p>
    <p>
      제한 시간이 {BABY_EXTRA_SEC}초 늘어나 총 {APPLE_GAME_DURATION_BABY}초 동안
      플레이합니다. (일반 {APPLE_GAME_DURATION_NORMAL}초)
    </p>
  </div>
);

export function AppleGamePage() {
  const { modal, message } = App.useApp();
  const [view, setView] = useState<"menu" | "play">("menu");
  const [scores, setScores] = useState<AppleScoresState>(() =>
    loadAppleScores(),
  );
  const [babyModeQueued, setBabyModeQueued] = useState(false);
  const [captureLoading, setCaptureLoading] = useState(false);
  const [bestByLevelOpen, setBestByLevelOpen] = useState(false);
  const [sessionIsNewBest, setSessionIsNewBest] = useState(false);

  const {
    muted,
    setMuted,
    volume,
    setVolume,
    playPop,
    playFail,
    playCountdown,
    playGameOver,
    startBgm,
    stopBgm,
  } = useAppleGameAudio();

  const countdownPlayedRef = useRef(false);
  const gameOverSfxPlayedRef = useRef(false);
  const sessionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScores(loadAppleScores());
  }, []);

  const handleSessionEnd = useCallback(
    (finalScore: number, meta: AppleSessionEndMeta) => {
      setScores((prev) => {
        let newBest = false;
        if (meta.isBabyMode) {
          newBest = finalScore > (prev.babyBest ?? 0);
        } else if (meta.difficulty) {
          const lv = meta.difficulty.level;
          const prevAtLv = prev.bestByLevel?.[lv] ?? 0;
          newBest = finalScore > prevAtLv;
        }
        setSessionIsNewBest(newBest);
        const next = { ...prev };
        if (meta.isBabyMode) next.babyEverUsed = true;
        next.lastScore = finalScore;
        if (meta.isBabyMode) {
          next.lastDifficultyLevel = -1;
          next.lastDifficultyStars = "—";
          next.lastDifficultyLabel = "응애모드";
          next.lastBoardSum = 0;
        } else if (meta.difficulty) {
          next.lastDifficultyLevel = meta.difficulty.level;
          next.lastDifficultyStars = meta.difficulty.stars;
          next.lastDifficultyLabel = meta.difficulty.label;
          next.lastBoardSum = meta.boardSumAtStart;
        }
        if (meta.isBabyMode) {
          if (finalScore > next.babyBest) {
            next.babyBest = finalScore;
            next.babyBestDifficultyStars = "BABY";
            next.babyBestDifficultyLabel = "응애모드";
          }
          if (finalScore >= APPLE_MAX_SCORE)
            next.baby170Count = (next.baby170Count ?? 0) + 1;
        } else {
          if (finalScore > next.normalBest) {
            next.normalBest = finalScore;
            if (meta.difficulty) {
              next.bestDifficultyLevel = meta.difficulty.level;
              next.bestDifficultyStars = meta.difficulty.stars;
              next.bestDifficultyLabel = meta.difficulty.label;
              next.bestBoardSum = meta.boardSumAtStart;
            }
          }
          if (meta.difficulty) {
            const lv = meta.difficulty.level;
            const prevLv = next.bestByLevel?.[lv] ?? 0;
            if (finalScore > prevLv) {
              const updated = [...(next.bestByLevel ?? [0, 0, 0, 0, 0, 0])] as typeof next.bestByLevel;
              updated[lv] = finalScore;
              next.bestByLevel = updated;
            }
          }
          if (finalScore >= APPLE_MAX_SCORE)
            next.normal170Count = (next.normal170Count ?? 0) + 1;
        }
        saveAppleScores(next);
        return next;
      });
    },
    [],
  );

  const {
    grid,
    score,
    time,
    playing,
    gameOver,
    poppingIds,
    sessionDuration,
    babyModeSession,
    difficulty,
    startPlay,
    restartAfterModal,
    exitToMenu,
    tryClearSelection,
  } = useAppleGame(handleSessionEnd, {
    onSuccessfulPop: playPop,
    onFailedSelection: playFail,
  });

  useEffect(() => {
    if (time === sessionDuration && playing) {
      countdownPlayedRef.current = false;
    }
  }, [time, playing, sessionDuration]);

  useEffect(() => {
    if (!playing || time !== 10 || countdownPlayedRef.current) return;
    countdownPlayedRef.current = true;
    playCountdown();
  }, [time, playing, playCountdown]);

  useEffect(() => {
    if (view !== "play" || !playing || gameOver) {
      stopBgm();
    }
  }, [view, playing, gameOver, stopBgm]);

  useEffect(() => {
    if (!gameOver) {
      gameOverSfxPlayedRef.current = false;
      return;
    }
    if (gameOverSfxPlayedRef.current) return;
    gameOverSfxPlayedRef.current = true;
    stopBgm();
    playGameOver();
  }, [gameOver, stopBgm, playGameOver]);

  const onPlay = () => {
    if (babyModeQueued) {
      markAppleBabyModeEverUsed();
      setScores(loadAppleScores());
    }
    setSessionIsNewBest(false);
    setView("play");
    startPlay({ babyMode: babyModeQueued });
    startBgm();
  };

  const handleRestartFromModal = () => {
    setSessionIsNewBest(false);
    restartAfterModal();
    startBgm();
  };

  const handleMainMenuFromModal = () => {
    setSessionIsNewBest(false);
    exitToMenu();
    setView("menu");
    setScores(loadAppleScores());
  };

  const handleCaptureGameUi = useCallback(async () => {
    const el = sessionRef.current;
    if (!el) {
      message.warning("캡처할 영역을 찾을 수 없습니다");
      return;
    }
    setCaptureLoading(true);
    try {
      const { png, jpeg } = await captureElementToImageBlobs(el);
      if (!png) {
        message.error("이미지를 만들 수 없습니다");
        return;
      }
      const copied = await copyPngToClipboard(png);
      if (copied) {
        message.success("클립보드에 이미지를 복사했습니다");
      } else if (jpeg) {
        downloadBlob(jpeg, `apple-game-${Date.now()}.jpg`);
        message.info("클립보드 복사에 실패해 JPG 파일로 저장했습니다");
      } else {
        downloadBlob(png, `apple-game-${Date.now()}.png`);
        message.info("클립보드 복사에 실패해 PNG 파일로 저장했습니다");
      }
    } catch {
      message.error("캡처 중 오류가 발생했습니다");
    } finally {
      setCaptureLoading(false);
    }
  }, [message]);

  const onExitToMenu = () => {
    exitToMenu();
    setView("menu");
    setScores(loadAppleScores());
  };

  const bestByLevelRows = useMemo(
    () =>
      APPLE_LEVEL_ROWS.map((row) => ({
        ...row,
        key: `lv-${row.level}`,
        score: scores.bestByLevel?.[row.level] ?? 0,
      })),
    [scores.bestByLevel],
  );

  const confirmResetBest = () => {
    modal.confirm({
      title: "정말 기록을 초기화하시겠습니까?",
      content:
        "일반/응애 BEST 점수, 난이도·직전 판 기록이 모두 삭제됩니다. (트로피 횟수는 유지됩니다)",
      okText: "YES",
      cancelText: "취소",
      okButtonProps: { danger: true },
      onOk: () => {
        clearAppleBestScore();
        setScores(loadAppleScores());
      },
    });
  };

  return (
    <div className="apple-game-page">
      {view === "menu" ? (
        <div className="apple-game-page__menu">
          <div className="apple-game-page__title-row">
            <Title level={1} className="apple-game-page__menu-title">
              🍎 사과게임
            </Title>
            <div
              className="apple-game-page__menu-trophies"
              aria-hidden={scores.normal170Count < 1 && scores.baby170Count < 1}
            >
              {scores.normal170Count >= 1 ? (
                <AppleTrophyBadge
                  variant="normal"
                  count={scores.normal170Count}
                />
              ) : null}
              {scores.baby170Count >= 1 ? (
                <AppleTrophyBadge variant="baby" count={scores.baby170Count} />
              ) : null}
            </div>
          </div>
          <Paragraph className="apple-game-page__menu-sub">
            Apple Sum Game · 드래그로 합 10 만들기
          </Paragraph>
          <div className="apple-game-page__best-cards">
            <div className="apple-game-page__best-card apple-game-page__best-card--normal">
              <Text className="apple-game-page__best-card-title">일반 모드 BEST</Text>
              <Text className="apple-game-page__best-card-score">{scores.normalBest}</Text>
              {scores.normalBest > 0 ? (
                <Text className="apple-game-page__best-card-difficulty">
                  {scores.bestDifficultyStars} ({scores.bestDifficultyLabel})
                </Text>
              ) : (
                <Text className="apple-game-page__best-card-difficulty apple-game-page__best-card-difficulty--empty">
                  기록 없음
                </Text>
              )}
            </div>
            {scores.babyBest > 0 ? (
              <div className="apple-game-page__best-card apple-game-page__best-card--baby">
                <Text className="apple-game-page__best-card-title">응애 모드 BEST</Text>
                <Text className="apple-game-page__best-card-score">{scores.babyBest}</Text>
                <Text className="apple-game-page__best-card-difficulty">
                  {scores.babyBestDifficultyStars && scores.babyBestDifficultyStars !== "—"
                    ? scores.babyBestDifficultyStars
                    : "BABY"}{" "}
                  (
                  {scores.babyBestDifficultyLabel && scores.babyBestDifficultyLabel !== "—"
                    ? scores.babyBestDifficultyLabel
                    : "응애모드"}
                  )
                </Text>
              </div>
            ) : null}
            <Tooltip title="난이도별 BEST 점수 전체보기">
              <Button
                type="default"
                size="large"
                shape="circle"
                icon={<TrophyOutlined />}
                className="apple-game-page__best-leaderboard-btn"
                aria-label="난이도별 BEST 점수 전체보기"
                onClick={() => setBestByLevelOpen(true)}
              />
            </Tooltip>
          </div>
          <div className="apple-game-page__play-row">
            <Button
              type="primary"
              size="large"
              className="apple-game-page__play-btn"
              onClick={onPlay}
            >
              Play
            </Button>
            <Checkbox
              className="apple-game-page__baby-check"
              checked={babyModeQueued}
              onChange={(e) => setBabyModeQueued(e.target.checked)}
            >
              응애모드
            </Checkbox>
            <Tooltip
              title={BABY_MODE_HELP}
              placement="bottom"
              overlayClassName="apple-game-page__baby-help-overlay"
            >
              <QuestionCircleOutlined className="apple-game-page__baby-help-icon" />
            </Tooltip>
          </div>
          <Button
            size="large"
            danger
            ghost
            className="apple-game-page__reset-best"
            onClick={confirmResetBest}
          >
            Reset Best Score
          </Button>
        </div>
      ) : null}

      {view === "play" && grid ? (
        <div ref={sessionRef} className="apple-game-page__session">
          <div className="apple-game-page__play-head">
            <div className="apple-game-page__best-head-inline">
              <div className="apple-game-page__best-pill apple-game-page__best-pill--normal">
                <Text className="apple-game-page__best-pill-mode">일반</Text>
                <Text strong className="apple-game-page__best-pill-score">
                  BEST {scores.normalBest}
                </Text>
                {scores.normalBest > 0 ? (
                  <Text className="apple-game-page__best-pill-difficulty">
                    {scores.bestDifficultyStars} ({scores.bestDifficultyLabel})
                  </Text>
                ) : null}
              </div>
              {scores.babyBest > 0 ? (
                <div className="apple-game-page__best-pill apple-game-page__best-pill--baby">
                  <Text className="apple-game-page__best-pill-mode">응애</Text>
                  <Text strong className="apple-game-page__best-pill-score">
                    BEST {scores.babyBest}
                  </Text>
                  <Text className="apple-game-page__best-pill-difficulty">
                    {scores.babyBestDifficultyStars && scores.babyBestDifficultyStars !== "—"
                      ? scores.babyBestDifficultyStars
                      : "BABY"}{" "}
                    (
                    {scores.babyBestDifficultyLabel && scores.babyBestDifficultyLabel !== "—"
                      ? scores.babyBestDifficultyLabel
                      : "응애모드"}
                    )
                  </Text>
                </div>
              ) : null}
            </div>
          </div>
          <div className="apple-game-page__difficulty-top-left">
            <AppleDifficultyHud
              difficulty={difficulty}
              babyMode={babyModeSession}
            />
          </div>
          <AppleBoard
            grid={grid}
            time={time}
            sessionDuration={sessionDuration}
            poppingIds={poppingIds}
            disabled={!playing || gameOver}
            babyMode={babyModeSession}
            onSelectionComplete={tryClearSelection}
          />
          <div className="apple-game-page__hud-row">
            <Button
              size="small"
              className="apple-game-page__reset-game"
              onClick={onExitToMenu}
            >
              RESET
            </Button>
            <div className="apple-game-page__hud-stats">
              <ScoreDisplay score={score} time={time} />
            </div>
            <div className="apple-game-page__hud-volume">
              <Checkbox
                className="apple-game-page__sound-check"
                checked={!muted}
                onChange={(e) => setMuted(!e.target.checked)}
              >
                소리
              </Checkbox>
              <Slider
                className="apple-game-page__volume-slider"
                min={0}
                max={100}
                disabled={muted}
                tooltip={{ formatter: (v) => `${v}%` }}
                value={Math.round(volume * 100)}
                onChange={(v) => setVolume(v / 100)}
              />
            </div>
          </div>
          <div className="apple-game-page__hint">
            <Text type="secondary">
              <AppstoreOutlined /> 사각형으로 드래그 · 포함된 숫자 합이 10이면
              사과가 사라지고 점수가 오릅니다.
              {babyModeSession ? (
                <>
                  응애모드: 1~3이 더 자주·8~9는 덜 나오며,{" "}
                  {APPLE_GAME_DURATION_BABY}초 플레이입니다.
                </>
              ) : null}
            </Text>
          </div>
        </div>
      ) : null}

      <Modal
        open={bestByLevelOpen}
        onCancel={() => setBestByLevelOpen(false)}
        footer={null}
        centered
        width={460}
        title="난이도별 BEST 점수 전체보기"
        className="apple-best-by-level-modal"
        rootClassName="apple-best-by-level-modal-root"
      >
        <div className="apple-best-by-level-list">
          {bestByLevelRows.map((row) => (
            <div
              key={row.key}
              className={`apple-best-by-level-row apple-best-by-level-row--lv-${row.level}`}
            >
              <span className="apple-best-by-level-row__stars">{row.stars}</span>
              <span className="apple-best-by-level-row__label">{row.label}</span>
              <span
                className={`apple-best-by-level-row__score${
                  row.score > 0 ? "" : " apple-best-by-level-row__score--empty"
                }`}
              >
                {row.score > 0 ? row.score : "-"}
              </span>
            </div>
          ))}
          <div className="apple-best-by-level-row apple-best-by-level-row--baby">
            <span className="apple-best-by-level-row__stars">BABY</span>
            <span className="apple-best-by-level-row__label">응애모드</span>
            <span
              className={`apple-best-by-level-row__score${
                scores.babyBest > 0 ? "" : " apple-best-by-level-row__score--empty"
              }`}
            >
              {scores.babyBest > 0 ? scores.babyBest : "-"}
            </span>
          </div>
        </div>
      </Modal>

      <GameOverModal
        open={gameOver}
        score={score}
        onRestart={handleRestartFromModal}
        onMainMenu={handleMainMenuFromModal}
        sessionDifficulty={difficulty}
        isBabyMode={babyModeSession}
        showPerfectTrophy={score >= APPLE_MAX_SCORE}
        trophyVariant={babyModeSession ? "baby" : "normal"}
        trophyAchieveCount={
          babyModeSession ? scores.baby170Count : scores.normal170Count
        }
        onCaptureUi={handleCaptureGameUi}
        captureLoading={captureLoading}
        isNewBest={sessionIsNewBest}
        getContainer={() => sessionRef.current ?? document.body}
      />
    </div>
  );
}
