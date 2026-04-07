import { createContext, useContext, type ReactNode } from 'react';
import { useScore } from '../hooks/useScore';

type ScoreContextValue = ReturnType<typeof useScore>;

const ScoreContext = createContext<ScoreContextValue | null>(null);

export function ScoreProvider({ children }: { children: ReactNode }) {
  const value = useScore();
  return <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>;
}

export function useScoreContext(): ScoreContextValue {
  const v = useContext(ScoreContext);
  if (!v) {
    throw new Error('useScoreContext는 ScoreProvider 안에서만 사용하세요.');
  }
  return v;
}
