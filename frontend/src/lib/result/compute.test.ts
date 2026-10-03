import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateResult } from '../definition/engine';
import { DEFINITION_V1, QUESTIONS } from '../definition/scoring-v1';
import type { AnswerValue } from '../types';
import { computeResult, round2, topContributions } from './compute';

const all = (v: AnswerValue) => Object.fromEntries(QUESTIONS.map((q) => [q.id, v])) as Record<number, AnswerValue>;

describe('computeResult (browser-side replacement for the old backend result DTO)', () => {
  it('splits into 21 bipolar axes + 2 independent metrics, in definition order', () => {
    const r = computeResult(all(0));
    assert.equal(Object.keys(r.axes).length, 21); assert.equal(Object.keys(r.metrics).length, 2);
    assert.deepEqual(Object.keys(r.metrics).sort(), ['democratic_choice', 'reza_pahlavi_transition_role']);
    assert.deepEqual(Object.keys(r.axes), Object.entries(DEFINITION_V1.axes).filter(([, d]) => d.type === 'axis').map(([n]) => n));
    assert.equal(r.testVersion, '1.0');
  });
  it('all neutral → 50 everywhere, certainty 0, distance 50, explanation lists the neutral answers (≤4)', () => {
    const r = computeResult(all(0));
    for (const v of [...Object.values(r.axes), ...Object.values(r.metrics)]) assert.equal(v, 50);
    assert.equal(r.certainty, 0); assert.equal(r.distanceFromStatusQuo, 50);
    assert.ok(Object.values(r.explanation).every((l) => l.length > 0 && l.length <= 4 && l.every((c) => c.response === 0)));
    assert.deepEqual(r.explanation.military_political_role.map((c) => c.questionId), [49]);
    assert.deepEqual(r.explanation.defense_capability.map((c) => c.questionId), [45, 48, 50]);
  });
  it('scores equal the unrounded engine output, rounded to 2 decimals (nothing recomputed differently)', () => {
    const a: Record<number, AnswerValue> = {}; QUESTIONS.forEach((q, i) => { a[q.id] = ([2, 1, 0, -1, -2] as AnswerValue[])[(i * 7 + 3) % 5]; });
    const raw = calculateResult(DEFINITION_V1, a); const r = computeResult(a);
    for (const [k, v] of Object.entries({ ...raw.axes, ...raw.metrics })) assert.equal(({ ...r.axes, ...r.metrics })[k], round2(v), k);
    assert.equal(r.certainty, round2(raw.certainty)); assert.equal(r.distanceFromStatusQuo, round2(raw.distanceFromStatusQuo));
  });
  it('explanation: ≤4 per axis, largest |contribution| first, neutral answers only when helpful, ties by question id', () => {
    const a = all(2); a[1] = 0;
    const r = computeResult(a);
    for (const list of Object.values(r.explanation)) {
      assert.ok(list.length <= 4);
      for (let i = 1; i < list.length; i++) assert.ok(Math.abs(list[i - 1].weightedContribution) >= Math.abs(list[i].weightedContribution));
      const firstNeutral = list.findIndex((c) => c.weightedContribution === 0);
      assert.ok(firstNeutral === -1 || list.slice(firstNeutral).every((c) => c.weightedContribution === 0), 'neutral come last');
    }
    // axis with ≤4 questions: the neutral answer is listed (after the active ones); big axes hide it
    assert.deepEqual(r.explanation.individual_freedom.map((c) => c.questionId).includes(1), false);
    const mk = (id: number, w: number) => ({ questionId: id, response: 1, weight: 1, signedResponse: 1, weightedContribution: w });
    assert.deepEqual(topContributions([mk(5, 1), mk(2, 1), mk(9, 2), mk(7, 1), mk(1, 0)]).map((c) => c.questionId), [9, 2, 5, 7]);   // 5 loadings > 4, active exist → neutral hidden
    assert.deepEqual(topContributions([mk(5, 1), mk(2, 1), mk(1, 0)]).map((c) => c.questionId), [2, 5, 1]);   // ≤4 loadings → neutral last
  });
  it('refuses incomplete answers (a result is never produced from partial data)', () => {
    const a = all(1); delete a[68];
    assert.throws(() => computeResult(a));
  });
});
