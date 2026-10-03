import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { makeTest } from '@/test-support/fixtures';
import type { AnswerValue } from '@/lib/types';
import { computeProgress, firstUnansweredIndex, flattenQuestions } from './progress';

const test = makeTest();
const answer = (ids: number[]) => Object.fromEntries(ids.map((i) => [i, 1 as AnswerValue]));

describe('progress (item 3)', () => {
  it('starts at 0 / 0', () => {
    const p = computeProgress(test, {}, 1);
    assert.deepEqual([p.sectionPercent, p.totalPercent], [0, 0]);
  });
  it('section % and total % are independent: 4/10 in section 1 → 40 / 6', () => {
    const p = computeProgress(test, answer([1, 2, 3, 4]), 1);
    assert.equal(p.sectionPercent, 40);
    assert.equal(p.totalPercent, 6);          // 4/68
  });
  it('section % restarts at 0 in a new section while total keeps growing', () => {
    const p = computeProgress(test, answer([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), 2);
    assert.equal(p.sectionPercent, 0);
    assert.equal(p.totalPercent, 15);         // 10/68
    assert.equal(p.sectionTitle, 'سکولاریسم');
  });
  it('reaches 100 / 100 when everything is answered', () => {
    const all = answer(flattenQuestions(test).map((q) => q.id));
    const p = computeProgress(test, all, 10);
    assert.deepEqual([p.sectionPercent, p.totalPercent], [100, 100]);
  });
  it('flatten keeps API order; first unanswered index for resume', () => {
    const order = flattenQuestions(test);
    assert.equal(order.length, 68);
    assert.equal(order[10].section, 2);
    assert.equal(firstUnansweredIndex(order, answer([1, 2, 3])), 3);
    assert.equal(firstUnansweredIndex(order, answer(order.map((q) => q.id))), -1);
  });
});
