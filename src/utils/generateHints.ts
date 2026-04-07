import type { GuessRecord } from '../types/gameTypes';
import { calculateStrikeBall } from './calculateStrikeBall';

function buildAllCandidates(): string[] {
  const out: string[] = [];
  for (let a = 0; a <= 9; a++) {
    for (let b = 0; b <= 9; b++) {
      if (b === a) continue;
      for (let c = 0; c <= 9; c++) {
        if (c === a || c === b) continue;
        for (let d = 0; d <= 9; d++) {
          if (d === a || d === b || d === c) continue;
          out.push(`${a}${b}${c}${d}`);
        }
      }
    }
  }
  return out;
}

const ALL_CANDIDATES = buildAllCandidates();

function matchesHistory(candidate: string, attempts: GuessRecord[]): boolean {
  for (const g of attempts) {
    const { strike, ball } = calculateStrikeBall(candidate, g.value);
    if (strike !== g.strike || ball !== g.ball) return false;
  }
  return true;
}

/** 기록과 모순 없는 정답 후보 전체 */
export function getValidCandidates(attempts: GuessRecord[]): string[] {
  return ALL_CANDIDATES.filter((c) => matchesHistory(c, attempts));
}

/** 쉬움 모드: 기록과 모순 없는 후보 중 최대 3개 */
export function generateHints(attempts: GuessRecord[]): string[] {
  return getValidCandidates(attempts).slice(0, 3);
}

export interface InferredDigits {
  /** 모든 유효 후보에 공통으로 포함 → 정답에 반드시 포함 */
  confirmed: string[];
  /** 어떤 유효 후보에도 등장하지 않음 → 정답에서 반드시 제외 */
  excluded: string[];
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function sortDigitStrings(xs: string[]): string[] {
  return [...xs].sort((a, b) => Number(a) - Number(b));
}

/**
 * 입력 기록(S/B)과 일치하는 후보 집합을 기준으로,
 * 논리적으로 반드시 포함/반드시 제외인 숫자(자리 무관)를 계산합니다.
 */
export function inferConfirmedAndExcluded(attempts: GuessRecord[]): InferredDigits {
  if (attempts.length === 0) {
    return { confirmed: [], excluded: [] };
  }

  const candidates = getValidCandidates(attempts);
  if (candidates.length === 0) {
    return { confirmed: [], excluded: [] };
  }

  const inSome = new Set<string>();
  let inEvery = new Set<string>(candidates[0]!.split(''));

  for (const cand of candidates) {
    const ds = new Set(cand.split(''));
    for (const d of ds) {
      inSome.add(d);
    }
    inEvery = new Set([...inEvery].filter((d): d is string => ds.has(d)));
  }

  const confirmed = sortDigitStrings([...inEvery]);

  const excluded: string[] = [];
  for (const d of DIGITS) {
    if (!inSome.has(d)) excluded.push(d);
  }

  return { confirmed, excluded };
}
