import { useCallback, useEffect, useState } from 'react';
import type { Difficulty, ScoreData } from '../types/gameTypes';
import { emptyScoreData } from '../types/gameTypes';
import { calculateScore } from '../utils/calculateScore';
import { clearStoredScore, loadScore, saveScore } from '../utils/storage';

export function useScore() {
  const [scoreData, setScoreData] = useState<ScoreData>(() => emptyScoreData());

  useEffect(() => {
    setScoreData(loadScore());
  }, []);

  const applyGameResult = useCallback(
    (difficulty: Difficulty, attemptCount: number, won: boolean) => {
      setScoreData((prev: ScoreData) => {
        const delta = calculateScore(difficulty, attemptCount, won);
        const next: ScoreData = {
          ...prev,
          totalScore: prev.totalScore + delta,
          gamesPlayed: prev.gamesPlayed + 1,
          easyWins: prev.easyWins + (won && difficulty === 'easy' ? 1 : 0),
          normalWins: prev.normalWins + (won && difficulty === 'normal' ? 1 : 0),
          hardWins: prev.hardWins + (won && difficulty === 'hard' ? 1 : 0),
        };
        saveScore(next);
        return next;
      });
    },
    [],
  );

  const resetScore = useCallback(() => {
    clearStoredScore();
    const next = emptyScoreData();
    setScoreData(next);
  }, []);

  return { scoreData, applyGameResult, resetScore };
}
