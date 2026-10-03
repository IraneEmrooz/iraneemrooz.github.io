import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { QUESTIONS } from '../definition/scoring-v1';
import type { AnswerValue } from '../types';
import { answersFromHash, decodeAnswers, encodeAnswers, hashForAnswers } from './codec';
import { computeResult } from './compute';

const all = (v: AnswerValue) => Object.fromEntries(QUESTIONS.map((q) => [q.id, v])) as Record<number, AnswerValue>;
let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed; };
const VALUES: AnswerValue[] = [-2, -1, 0, 1, 2];
const random = () => Object.fromEntries(QUESTIONS.map((q) => [q.id, VALUES[rnd() % 5]])) as Record<number, AnswerValue>;

describe('result link codec', () => {
  it('round-trips random answer sets, including the extremes', () => {
    const sets = [all(-2), all(-1), all(0), all(1), all(2), ...Array.from({ length: 300 }, random)];
    for (const a of sets) assert.deepEqual(decodeAnswers(encodeAnswers(a)), a);
  });
  it('is short (≤ 40 chars after the prefix) and URL-safe', () => {
    for (const a of [all(2), all(-2), random(), random()]) {
      const c = encodeAnswers(a);
      assert.match(c, /^v1\.[0-9a-z]{1,40}$/);
    }
  });
  it('is deterministic and different answers give different codes', () => {
    const a = random(); const b = { ...a, 1: (a[1] === 2 ? -2 : 2) as AnswerValue };
    assert.equal(encodeAnswers(a), encodeAnswers({ ...a }));
    assert.notEqual(encodeAnswers(a), encodeAnswers(b));
  });
  it('encoding refuses incomplete or invalid answers', () => {
    const a = all(1); delete a[7];
    assert.throws(() => encodeAnswers(a));
    assert.throws(() => encodeAnswers({ ...all(1), 3: 5 as unknown as AnswerValue }));
  });
  it('rejects anything that is not a canonical code (no aliases, no junk, no scores)', () => {
    const good = encodeAnswers(random());
    for (const bad of ['', 'v1.', 'v2.abc', 'abc', `${good}0`, good.toUpperCase(), good + '=', `v1.0${good.slice(3)}`, 'v1.' + 'z'.repeat(41),
      'v1.' + 'z'.repeat(40), '{"axes":{}}', 'v1.-1', 'v1. 1', 'v1.1.2']) {
      assert.equal(decodeAnswers(bad), null, bad);
    }
  });
  it('hash helpers: with or without the leading #; garbage → null', () => {
    const a = random(); const h = hashForAnswers(a);
    assert.ok(h.startsWith('#v1.'));
    assert.deepEqual(answersFromHash(h), a); assert.deepEqual(answersFromHash(h.slice(1)), a);
    assert.equal(answersFromHash(''), null); assert.equal(answersFromHash('#'), null); assert.equal(answersFromHash('#/result/x'), null);
  });
  it('a link can only ever show a score that real answers produce (result is recomputed, not carried)', () => {
    const a = random();
    const viaLink = computeResult(decodeAnswers(encodeAnswers(a))!);
    assert.deepEqual(viaLink, computeResult(a));
    // every decodable code maps to an answer set; flipping one character yields either null or a DIFFERENT valid answer set — never a hand-written score
    const c = encodeAnswers(a); const flipped = c.slice(0, -1) + (c.endsWith('a') ? 'b' : 'a');
    const d = decodeAnswers(flipped);
    if (d) assert.notDeepEqual(d, a);
  });
});
