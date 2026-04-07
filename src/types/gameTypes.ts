export type Difficulty = 'easy' | 'normal' | 'hard';

export interface GuessRecord {
  attempt: number;
  value: string;
  strike: number;
  ball: number;
}

export interface GameState {
  answer: string;
  difficulty: Difficulty;
  attempts: GuessRecord[];
  gameOver: boolean;
  isWin: boolean;
}

export interface ScoreData {
  totalScore: number;
  easyWins: number;
  normalWins: number;
  hardWins: number;
  gamesPlayed: number;
}

export const emptyScoreData = (): ScoreData => ({
  totalScore: 0,
  easyWins: 0,
  normalWins: 0,
  hardWins: 0,
  gamesPlayed: 0,
});
