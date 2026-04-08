import { AppstoreOutlined } from '@ant-design/icons';
import { App, Button, Checkbox, Slider, Typography } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppleBoard } from '../../games/appleGame/components/AppleBoard/AppleBoard';
import { GameOverModal } from '../../games/appleGame/components/GameOverModal/GameOverModal';
import { ScoreDisplay } from '../../games/appleGame/components/ScoreDisplay/ScoreDisplay';
import { useAppleGame } from '../../games/appleGame/hooks/useAppleGame';
import { useAppleGameAudio } from '../../games/appleGame/hooks/useAppleGameAudio';
import { APPLE_GAME_DURATION } from '../../games/appleGame/types/appleGameTypes';
import { clearAppleBestScore, loadAppleBestScore, saveAppleBestScore } from '../../games/appleGame/utils/appleStorage';
import './AppleGamePage.scss';

const { Paragraph, Text, Title } = Typography;

export function AppleGamePage() {
  const { modal } = App.useApp();
  const [view, setView] = useState<'menu' | 'play'>('menu');
  const [best, setBest] = useState(0);

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
    setBest(loadAppleBestScore().bestScore);
  }, []);

  const handleSessionEnd = useCallback((finalScore: number) => {
    setBest((prev) => {
      if (finalScore > prev) {
        saveAppleBestScore({ bestScore: finalScore });
        return finalScore;
      }
      return prev;
    });
  }, []);

  const {
    grid,
    score,
    time,
    playing,
    gameOver,
    poppingIds,
    startPlay,
    restartAfterModal,
    exitToMenu,
    tryClearSelection,
  } = useAppleGame(handleSessionEnd, {
    onSuccessfulPop: playPop,
    onFailedSelection: playFail,
  });

  useEffect(() => {
    if (time === APPLE_GAME_DURATION && playing) {
      countdownPlayedRef.current = false;
    }
  }, [time, playing]);

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
    setView('play');
    startPlay();
    startBgm();
  };

  const handleRestartFromModal = () => {
    restartAfterModal();
    startBgm();
  };

  const onExitToMenu = () => {
    exitToMenu();
    setView('menu');
  };

  const confirmResetBest = () => {
    modal.confirm({
      title: '정말 최고 점수를 삭제하시겠습니까?',
      okText: 'YES',
      cancelText: '취소',
      okButtonProps: { danger: true },
      onOk: () => {
        clearAppleBestScore();
        setBest(0);
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
          <Text className="apple-game-page__best-line">BEST SCORE : {best}</Text>
          <Button type="primary" size="large" className="apple-game-page__play-btn" onClick={onPlay}>
            Play
          </Button>
          <Button size="large" danger ghost className="apple-game-page__reset-best" onClick={confirmResetBest}>
            Reset Best Score
          </Button>
        </div>
      ) : null}

      {view === 'play' && grid ? (
        <div ref={sessionRef} className="apple-game-page__session">
          <div className="apple-game-page__play-head">
            <Text strong className="apple-game-page__best-outside">
              BEST SCORE : {best}
            </Text>
          </div>
          <AppleBoard
            grid={grid}
            time={time}
            poppingIds={poppingIds}
            disabled={!playing || gameOver}
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
