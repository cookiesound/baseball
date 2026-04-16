export interface AppleDifficultyInfo {
  level: 0 | 1 | 2 | 3 | 4 | 5;
  stars: string;
  label: string;
  boardSum: number;
}

const LABELS: Record<AppleDifficultyInfo['level'], string> = {
  0: '매우 쉬움',
  1: '쉬움',
  2: '보통',
  3: '어려움',
  4: '매우 어려움',
  5: '극악',
};

const STARS: Record<AppleDifficultyInfo['level'], string> = {
  0: '☆☆☆☆☆',
  1: '★☆☆☆☆',
  2: '★★☆☆☆',
  3: '★★★☆☆',
  4: '★★★★☆',
  5: '★★★★★',
};

function resolveLevel(boardSum: number): AppleDifficultyInfo['level'] {
  if (boardSum <= 799) return 0;
  if (boardSum <= 819) return 1;
  if (boardSum <= 839) return 2;
  if (boardSum <= 859) return 3;
  if (boardSum <= 879) return 4;
  return 5;
}

/** 보드 숫자 총합(초기 배치 기준)으로 난이도를 산정합니다. 순수 함수입니다. */
export function getAppleDifficulty(boardSum: number): AppleDifficultyInfo {
  const level = resolveLevel(boardSum);
  return {
    level,
    stars: STARS[level],
    label: LABELS[level],
    boardSum,
  };
}
