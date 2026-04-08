import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppleCell } from '../types/appleGameTypes';
import { APPLE_GAME_DURATION } from '../types/appleGameTypes';
import { calculateAppleSum } from '../utils/calculateAppleSum';
import { generateAppleGrid } from '../utils/generateAppleGrid';
import { useTimer } from './useTimer';

function markCellsRemoved(grid: AppleCell[][], idSet: Set<string>): AppleCell[][] {
  return grid.map((row) => row.map((c) => (idSet.has(c.id) ? { ...c, removed: true } : c)));
}

export interface UseAppleGameOptions {
  onSuccessfulPop?: () => void;
  onFailedSelection?: () => void;
}

export function useAppleGame(
  onSessionEnd: (finalScore: number) => void,
  { onSuccessfulPop, onFailedSelection }: UseAppleGameOptions = {},
) {
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [grid, setGrid] = useState<AppleCell[][] | null>(null);
  const [score, setScore] = useState(0);
  const [poppingIds, setPoppingIds] = useState<Set<string>>(new Set());

  const gridRef = useRef<AppleCell[][] | null>(null);
  const poppingBusyRef = useRef(false);
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
    onTimeUpRef.current(scoreRef.current);
  }, []);

  const { time, reset: resetTime } = useTimer(APPLE_GAME_DURATION, playing, handleTimeUp);

  const startPlay = useCallback(() => {
    poppingBusyRef.current = false;
    setGrid(generateAppleGrid());
    setScore(0);
    setPoppingIds(new Set());
    setGameOver(false);
    resetTime(APPLE_GAME_DURATION);
    setPlaying(true);
  }, [resetTime]);

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
    resetTime(APPLE_GAME_DURATION);
  }, [resetTime]);

  const tryClearSelection = useCallback((picked: AppleCell[]) => {
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
  }, [playing, onSuccessfulPop, onFailedSelection]);

  return {
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
  };
}
