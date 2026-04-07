import { useCallback, useMemo, useRef, useState } from 'react';
import type { Difficulty, GuessRecord } from '../types/gameTypes';
import { calculateStrikeBall } from '../utils/calculateStrikeBall';
import { generateAnswer } from '../utils/generateAnswer';
import { generateHints } from '../utils/generateHints';

const HARD_MAX_ATTEMPTS = 7;

function hasDuplicateDigits(value: string): boolean {
  return new Set(value.split('')).size !== value.length;
}

export interface GameCompletePayload {
  won: boolean;
  attemptCount: number;
  answer: string;
}

interface UseGameLogicOptions {
  difficulty: Difficulty;
  onGameComplete: (payload: GameCompletePayload) => void;
}

export function useGameLogic({ difficulty, onGameComplete }: UseGameLogicOptions) {
  const [answer, setAnswer] = useState(() => generateAnswer());
  const [attempts, setAttempts] = useState<GuessRecord[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const endedRef = useRef(false);
  const submittedRef = useRef<Set<string>>(new Set());

  const hints = useMemo(() => {
    if (difficulty !== 'easy') return [];
    return generateHints(attempts);
  }, [difficulty, attempts]);

  const resetGame = useCallback(() => {
    setAnswer(generateAnswer());
    setAttempts([]);
    setGameOver(false);
    setIsWin(false);
    endedRef.current = false;
    submittedRef.current = new Set();
  }, []);

  const trySubmit = useCallback(
    (raw: string): { ok: true } | { ok: false; reason: 'incomplete' | 'duplicate_input' | 'duplicate_submit' | 'locked' } => {
      if (gameOver || endedRef.current) return { ok: false, reason: 'locked' };

      if (raw.length !== 4 || !/^\d{4}$/.test(raw)) {
        return { ok: false, reason: 'incomplete' };
      }

      const strictDuplicateCheck = difficulty === 'easy' || difficulty === 'normal';
      if (strictDuplicateCheck && hasDuplicateDigits(raw)) {
        return { ok: false, reason: 'duplicate_input' };
      }

      if (strictDuplicateCheck && submittedRef.current.has(raw)) {
        return { ok: false, reason: 'duplicate_submit' };
      }

      setAttempts((prev) => {
        if (endedRef.current) return prev;

        const { strike, ball } = calculateStrikeBall(answer, raw);
        const attemptNum = prev.length + 1;
        const record: GuessRecord = {
          attempt: attemptNum,
          value: raw,
          strike,
          ball,
        };
        const next = [...prev, record];

        if (strictDuplicateCheck) {
          submittedRef.current.add(raw);
        }

        if (strike === 4) {
          endedRef.current = true;
          const payload: GameCompletePayload = { won: true, attemptCount: attemptNum, answer };
          queueMicrotask(() => {
            setGameOver(true);
            setIsWin(true);
            onGameComplete(payload);
          });
          return next;
        }

        if (difficulty === 'hard' && attemptNum >= HARD_MAX_ATTEMPTS) {
          endedRef.current = true;
          const payload: GameCompletePayload = { won: false, attemptCount: attemptNum, answer };
          queueMicrotask(() => {
            setGameOver(true);
            setIsWin(false);
            onGameComplete(payload);
          });
        }

        return next;
      });

      return { ok: true };
    },
    [answer, difficulty, gameOver, onGameComplete],
  );

  return {
    answer,
    attempts,
    gameOver,
    isWin,
    hints,
    resetGame,
    trySubmit,
  };
}
