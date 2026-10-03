import { QUESTIONS } from '../definition/scoring-v1';
import type { AnswerValue } from '../types';

/**
 * Shareable result link = the 68 answers, packed. The result page RE-COMPUTES everything from them, so a link
 * can never carry a score that the test could not have produced (there is nothing to tamper with except the
 * answers themselves). It lives in the URL *fragment* (#…), which browsers never send to any server.
 *
 * Format:  "v1." + base36( Σ (answer+2) · 5^i )   for questions 1..68 in order  (≈ 32 chars)
 */
export const CODE_PREFIX = 'v1.';
const IDS = QUESTIONS.map((q) => q.id);
const N = IDS.length;
const VALUES: readonly AnswerValue[] = [-2, -1, 0, 1, 2];
const isValue = (v: unknown): v is AnswerValue => typeof v === 'number' && (VALUES as readonly number[]).includes(v);

export function encodeAnswers(answers: Readonly<Record<number, AnswerValue>>): string {
  let acc = 0n;
  for (let i = N - 1; i >= 0; i--) {
    const v = answers[IDS[i]];
    if (!isValue(v)) throw new Error(`answer for question ${IDS[i]} is missing or invalid`);
    acc = acc * 5n + BigInt(v + 2);
  }
  return CODE_PREFIX + acc.toString(36);
}

const MAX = 5n ** BigInt(N);
/** Returns null for anything that is not a canonical code produced by encodeAnswers. */
export function decodeAnswers(code: string): Record<number, AnswerValue> | null {
  if (typeof code !== 'string' || !code.startsWith(CODE_PREFIX)) return null;
  const body = code.slice(CODE_PREFIX.length);
  if (!/^[0-9a-z]{1,40}$/.test(body)) return null;
  let acc = 0n;
  for (const ch of body) acc = acc * 36n + BigInt(parseInt(ch, 36));
  if (acc >= MAX) return null;
  const out: Record<number, AnswerValue> = {};
  for (let i = 0; i < N; i++) { out[IDS[i]] = (Number(acc % 5n) - 2) as AnswerValue; acc /= 5n; }
  return encodeAnswers(out) === code ? out : null;     // canonical form only (no leading zeros / aliases)
}

/** `location.hash` (with or without the leading '#') → answers, or null. */
export function answersFromHash(hash: string): Record<number, AnswerValue> | null {
  return decodeAnswers(hash.startsWith('#') ? hash.slice(1) : hash);
}
export const hashForAnswers = (answers: Readonly<Record<number, AnswerValue>>): string => `#${encodeAnswers(answers)}`;
