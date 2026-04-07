export interface StrikeBallResult {
  strike: number;
  ball: number;
}

/** 정답과 추측을 비교해 Strike / Ball 계산 */
export function calculateStrikeBall(answer: string, guess: string): StrikeBallResult {
  const a = answer.split('');
  const g = guess.split('');
  let strike = 0;
  const aAvail = a.map(() => true);
  const gAvail = g.map(() => true);

  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      strike++;
      aAvail[i] = false;
      gAvail[i] = false;
    }
  }

  let ball = 0;
  for (let i = 0; i < g.length; i++) {
    if (!gAvail[i]) continue;
    for (let j = 0; j < a.length; j++) {
      if (!aAvail[j]) continue;
      if (g[i] === a[j]) {
        ball++;
        aAvail[j] = false;
        break;
      }
    }
  }

  return { strike, ball };
}
