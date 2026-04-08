import { AppstoreOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { App, Button, Checkbox, Slider, Tooltip, Typography } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppleBoard } from '../../games/appleGame/components/AppleBoard/AppleBoard';
import { GameOverModal } from '../../games/appleGame/components/GameOverModal/GameOverModal';
import { ScoreDisplay } from '../../games/appleGame/components/ScoreDisplay/ScoreDisplay';
import { useAppleGame } from '../../games/appleGame/hooks/useAppleGame';
import { useAppleGameAudio } from '../../games/appleGame/hooks/useAppleGameAudio';
import {
  clearAppleBestScore,
  loadAppleScores,
  markAppleBabyModeEverUsed,
  saveAppleScores,
  type AppleScoresState,
} from '../../games/appleGame/utils/appleStorage';
import './AppleGamePage.scss';

const { Paragraph, Text, Title } = Typography;

const BABY_MODE_HELP = (
  <div className="apple-game-page__baby-tooltip">
    <p>응애모드로 시작하면 드래그한 영역 안 사과 숫자의 합이 표시됩니다.</p>
    <p>제한 시간이 20초 늘어나 총 200초 동안 플레이합니다.</p>
  </div>
);

export function AppleGamePage() {
  const { modal } = App.useApp();
  const [view, setView] = useState<'menu' | 'play'>('menu');
  const [scores, setScores] = useState<AppleScoresState>(() => loadAppleScores());
  const [babyModeQueued, setBabyModeQueued] = useState(false);

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

  const handleSessionEnd = useCallback((finalScore: number, meta: { isBabyMode: boolean }) => {
    setScores((prev) => {
      const next = { ...prev };
      if (meta.isBabyMode) {
        if (finalScore > next.babyBest) next.babyBest = finalScore;
      } else {
        if (finalScore > next.normalBest) next.normalBest = finalScore;
      }
      saveAppleScores(next);
      return next;
    });
  }, []);

  const {
    grid,
    score,
    time,
    playing,
    gameOver,
    poppingIds,
    sessionDuration,
    babyModeSession,
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
    if (view !== 'play' || !playing || gameOver) {
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
    setView('play');
    startPlay({ babyMode: babyModeQueued });
    startBgm();
  };

  const handleRestartFromModal = () => {
    restartAfterModal();
    startBgm();
  };

  const onExitToMenu = () => {
    exitToMenu();
    setView('menu');
    setScores(loadAppleScores());
  };

  const confirmResetBest = () => {
    modal.confirm({
      title: '정말 최고 점수를 삭제하시겠습니까?',
      content: '일반 모드와 응애모드 BEST 점수가 모두 0으로 초기화됩니다.',
      okText: 'YES',
      cancelText: '취소',
      okButtonProps: { danger: true },
      onOk: () => {
        clearAppleBestScore();
        setScores(loadAppleScores());
      },
    });
  };

  return (
    <div className="apple-game-page">
      {view === 'menu' ? (
        <div className="apple-game-page__menu">
          <Title level={1} className="apple-game-page__menu-title">
            🍎 사과게임
          </Title>
          <Paragraph className="apple-game-page__menu-sub">Apple Sum Game · 드래그로 합 10 만들기</Paragraph>
          <div className="apple-game-page__best-block">
            <Text className="apple-game-page__best-line">BEST (일반) : {scores.normalBest}</Text>
            {scores.babyEverUsed ? (
              <Text className="apple-game-page__best-line apple-game-page__best-line--baby">
                BEST (응애모드) : {scores.babyBest}
              </Text>
            ) : null}
          </div>
          <div className="apple-game-page__play-row">
            <Button type="primary" size="large" className="apple-game-page__play-btn" onClick={onPlay}>
              Play
            </Button>
            <Checkbox
              className="apple-game-page__baby-check"
              checked={babyModeQueued}
              onChange={(e) => setBabyModeQueued(e.target.checked)}
            >
              응애모드
            </Checkbox>
            <Tooltip title={BABY_MODE_HELP} placement="bottom" overlayClassName="apple-game-page__baby-help-overlay">
              <QuestionCircleOutlined className="apple-game-page__baby-help-icon" />
            </Tooltip>
          </div>
          <Button size="large" danger ghost className="apple-game-page__reset-best" onClick={confirmResetBest}>
            Reset Best Score
          </Button>
        </div>
      ) : null}

      {view === 'play' && grid ? (
        <div ref={sessionRef} className="apple-game-page__session">
          <div className="apple-game-page__play-head">
            <div className="apple-game-page__best-head">
              <Text strong className="apple-game-page__best-outside">
                BEST (일반) : {scores.normalBest}
              </Text>
              {scores.babyEverUsed ? (
                <Text strong className="apple-game-page__best-outside apple-game-page__best-outside--baby">
                  BEST (응애) : {scores.babyBest}
                </Text>
              ) : null}
            </div>
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
            <Button size="small" className="apple-game-page__reset-game" onClick={onExitToMenu}>
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
              <AppstoreOutlined /> 사각형으로 드래그 · 포함된 숫자 합이 10이면 사과가 사라지고 점수가 오릅니다.
              {babyModeSession ? <> 응애모드: 드래그 중 합계가 표시되고 200초 플레이입니다.</> : null}
            </Text>
          </div>
        </div>
      ) : null}

      <GameOverModal
        open={gameOver}
        score={score}
        onRestart={handleRestartFromModal}
        getContainer={() => sessionRef.current ?? document.body}
      />
    </div>
  );
}
