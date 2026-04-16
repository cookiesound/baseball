import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppleCell } from '../types/appleGameTypes';
import {
  APPLE_GAME_DURATION_BABY,
  APPLE_GAME_DURATION_NORMAL,
  APPLE_GRID_COLS,
  APPLE_GRID_ROWS,
} from '../types/appleGameTypes';
import { calculateAppleSum } from '../utils/calculateAppleSum';
import { calculateBoardSum } from '../utils/calculateBoardSum';
import { generateAppleGrid } from '../utils/generateAppleGrid';
import type { AppleDifficultyInfo } from '../utils/getAppleDifficulty';
import { getAppleDifficulty } from '../utils/getAppleDifficulty';
import { useTimer } from './useTimer';

export type AppleSessionEndMeta = {
  isBabyMode: boolean;
  difficulty: AppleDifficultyInfo | null;
  /** 판 시작 시점 격자 숫자 총합(고정 기준값) */
  boardSumAtStart: number;
};

function markCellsRemoved(grid: AppleCell[][], idSet: Set<string>): AppleCell[][] {
  return grid.map((row) => row.map((c) => (idSet.has(c.id) ? { ...c, removed: true } : c)));
}

export interface UseAppleGameOptions {
  onSuccessfulPop?: () => void;
  onFailedSelection?: () => void;
}

export function useAppleGame(
  onSessionEnd: (finalScore: number, meta: AppleSessionEndMeta) => void,
  { onSuccessfulPop, onFailedSelection }: UseAppleGameOptions = {},
) {
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [grid, setGrid] = useState<AppleCell[][] | null>(null);
  const [score, setScore] = useState(0);
  const [poppingIds, setPoppingIds] = useState<Set<string>>(new Set());
  const [sessionDuration, setSessionDuration] = useState(APPLE_GAME_DURATION_NORMAL);
  const [babyModeSession, setBabyModeSession] = useState(false);
  const [difficulty, setDifficulty] = useState<AppleDifficultyInfo | null>(null);

  const gridRef = useRef<AppleCell[][] | null>(null);
  const poppingBusyRef = useRef(false);
  const sessionBabyRef = useRef(false);
  const boardSumAtStartRef = useRef(0);
  const sessionDifficultyRef = useRef<AppleDifficultyInfo | null>(null);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  const scoreRef = useRef(0);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const onTimeUpRef = useRef(onSessionEnd);
  onTimeUpRef.current = onSessionEnd;

  const handleTimeUp = useCallback(() => {
    setPlaying(false);
    setGameOver(true);
    onTimeUpRef.current(scoreRef.current, {
      isBabyMode: sessionBabyRef.current,
      difficulty: sessionBabyRef.current ? null : sessionDifficultyRef.current,
      boardSumAtStart: boardSumAtStartRef.current,
    });
  }, []);

  const { time, reset: resetTime } = useTimer(playing, handleTimeUp);

  const startPlay = useCallback(
    (options?: { babyMode?: boolean }) => {
      if (options && typeof options.babyMode === 'boolean') {
        sessionBabyRef.current = options.babyMode;
        setBabyModeSession(options.babyMode);
      }
      const duration = sessionBabyRef.current ? APPLE_GAME_DURATION_BABY : APPLE_GAME_DURATION_NORMAL;
      setSessionDuration(duration);

      poppingBusyRef.current = false;
      const nextGrid = generateAppleGrid(APPLE_GRID_COLS, APPLE_GRID_ROWS, {
        babyFriendlyDistribution: sessionBabyRef.current,
      });
      const boardSum = calculateBoardSum(nextGrid);
      boardSumAtStartRef.current = boardSum;
      const nextDifficulty = sessionBabyRef.current ? null : getAppleDifficulty(boardSum);
      sessionDifficultyRef.current = nextDifficulty;
      setGrid(nextGrid);
      setDifficulty(nextDifficulty);
      setScore(0);
      setPoppingIds(new Set());
      setGameOver(false);
      resetTime(duration);
      setPlaying(true);
    },
    [resetTime],
  );

  const restartAfterModal = useCallback(() => {
    setGameOver(false);
    startPlay();
  }, [startPlay]);

  const exitToMenu = useCallback(() => {
    poppingBusyRef.current = false;
    setPlaying(false);
    setGameOver(false);
    setGrid(null);
    setScore(0);
    setPoppingIds(new Set());
    setBabyModeSession(false);
    setDifficulty(null);
    sessionDifficultyRef.current = null;
    boardSumAtStartRef.current = 0;
    resetTime(APPLE_GAME_DURATION_NORMAL);
  }, [resetTime]);

  const tryClearSelection = useCallback(
    (picked: AppleCell[]) => {
      const g = gridRef.current;
      if (!g || !playing || poppingBusyRef.current) return;
      if (picked.length === 0) return;
      if (calculateAppleSum(picked) !== 10) {
        onFailedSelection?.();
        return;
      }
      onSuccessfulPop?.();
      const ids = picked.map((c) => c.id);
      const idSet = new Set(ids);
      poppingBusyRef.current = true;
      setPoppingIds(idSet);
      window.setTimeout(() => {
        setGrid((prev) => (prev ? markCellsRemoved(prev, idSet) : prev));
        setScore((s) => s + ids.length);
        setPoppingIds(new Set());
        poppingBusyRef.current = false;
      }, 380);
    },
    [playing, onSuccessfulPop, onFailedSelection],
  );

  return {
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
  };
}
