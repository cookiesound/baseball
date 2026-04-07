import { ArrowLeftOutlined } from '@ant-design/icons';
import { App, Button, Tag, Typography } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { GameBoard } from '../../components/GameBoard/GameBoard';
import { GuessHistory } from '../../components/GuessHistory/GuessHistory';
import { InferencePanel } from '../../components/InferencePanel/InferencePanel';
import { HintPanel } from '../../components/HintPanel/HintPanel';
import { NumberInput } from '../../components/NumberInput/NumberInput';
import { ResultModal } from '../../components/ResultModal/ResultModal';
import { ScorePanel } from '../../components/ScorePanel/ScorePanel';
import { useScoreContext } from '../../context/ScoreContext';
import type { GameCompletePayload } from '../../hooks/useGameLogic';
import { useGameLogic } from '../../hooks/useGameLogic';
import type { Difficulty } from '../../types/gameTypes';
import { calculateScore } from '../../utils/calculateScore';
import { inferConfirmedAndExcluded } from '../../utils/generateHints';
import { parseDifficulty } from '../../utils/parseDifficulty';
import './GamePage.scss';

const { Title } = Typography;

const difficultyLabel: Record<Difficulty, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
};

function GamePageInner({ difficulty }: { difficulty: Difficulty }) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { scoreData, applyGameResult } = useScoreContext();

  const [value, setValue] = useState('');
  const [aux, setAux] = useState('');
  const [resultOpen, setResultOpen] = useState(false);
  const [resultInfo, setResultInfo] = useState<{
    isWin: boolean;
    answer: string;
    attemptCount: number;
    gained: number;
  } | null>(null);

  const onGameComplete = useCallback(
    (payload: GameCompletePayload) => {
      applyGameResult(difficulty, payload.attemptCount, payload.won);
      const gained = calculateScore(difficulty, payload.attemptCount, payload.won);
      setResultInfo({
        isWin: payload.won,
        answer: payload.answer,
        attemptCount: payload.attemptCount,
        gained,
      });
      setResultOpen(true);
    },
    [applyGameResult, difficulty],
  );

  const { attempts, gameOver, hints, resetGame, trySubmit } = useGameLogic({
    difficulty,
    onGameComplete,
  });

  const attemptCount = attempts.length;
  const remainingHard = difficulty === 'hard' ? Math.max(0, 7 - attemptCount) : null;

  const { confirmed: inferredConfirmed, excluded: inferredExcluded } = useMemo(
    () => inferConfirmedAndExcluded(attempts),
    [attempts],
  );

  const showInference = difficulty === 'easy' || difficulty === 'normal';

  const submit = useCallback(() => {
    if (gameOver) return;

    if (value.length !== 4) {
      message.warning('숫자 4자리를 모두 입력하세요.');
      setAux('');
      return;
    }

    const res = trySubmit(value);
    if (!res.ok) {
      if (res.reason === 'duplicate_input') {
        message.warning('같은 숫자가 중복됩니다.');
        setAux('중복 숫자는 제출할 수 없습니다.');
      } else if (res.reason === 'duplicate_submit') {
        message.warning('이미 제출한 조합입니다.');
        setAux('이미 제출한 숫자입니다.');
      } else if (res.reason === 'locked') {
        setAux('');
      } else {
        setAux('');
      }
      return;
    }

    setValue('');
    setAux('');
  }, [gameOver, message, trySubmit, value]);

  const handleNewGame = useCallback(() => {
    resetGame();
    setResultOpen(false);
    setResultInfo(null);
    setValue('');
    setAux('');
  }, [resetGame]);

  const difficultyBadge = useMemo(
    () => <Tag color="purple">{difficultyLabel[difficulty]}</Tag>,
    [difficulty],
  );

  return (
    <div className="game-page">
      <GameBoard
        headerExtra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            메인으로
          </Button>
        }
        difficultyBadge={difficultyBadge}
        left={
          <div className="game-page__history-wrap">
            <Title level={4} className="game-page__panel-title">
              입력 기록
            </Title>
            <GuessHistory attempts={attempts} />
          </div>
        }
        right={
          <>
            <ScorePanel
              totalScore={scoreData.totalScore}
              difficulty={difficulty}
              attemptCount={attemptCount}
              remainingHard={remainingHard}
            />
            {showInference ? (
              <InferencePanel
                confirmed={inferredConfirmed}
                excluded={inferredExcluded}
                emptyHistory={attempts.length === 0}
              />
            ) : null}
            <HintPanel
              hints={hints}
              active={difficulty === 'easy'}
              disabled={gameOver}
              onHintPick={
                difficulty === 'easy'
                  ? (v) => {
                      setValue(v);
                      setAux('');
                    }
                  : undefined
              }
            />
          </>
        }
        footer={
          <NumberInput
            value={value}
            onChange={(v) => {
              setValue(v);
              if (aux) setAux('');
            }}
            onSubmit={submit}
            disabled={gameOver}
            auxiliaryText={difficulty === 'hard' ? '' : aux}
          />
        }
      />

      {resultInfo ? (
        <ResultModal
          open={resultOpen}
          isWin={resultInfo.isWin}
          answer={resultInfo.answer}
          attemptCount={resultInfo.attemptCount}
          gainedScore={resultInfo.gained}
          onNewGame={handleNewGame}
          onMain={() => navigate('/')}
        />
      ) : null}
    </div>
  );
}

export function GamePage() {
  const { difficulty: raw } = useParams();
  const difficulty = parseDifficulty(raw);

  if (!difficulty) {
    return <Navigate to="/" replace />;
  }

  return <GamePageInner difficulty={difficulty} />;
}
