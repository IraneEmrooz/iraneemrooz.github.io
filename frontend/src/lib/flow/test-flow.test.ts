import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PUBLIC_TEST } from '../definition/public-test';
import { answersFromHash } from '../result/codec';
import { computeResult } from '../result/compute';
import { createMemoryStore } from '../storage';
import type { AnswerValue } from '../types';
import { answeredCount, canGoNext, canGoPrev, canSubmit, currentQuestionId, isLastQuestion, selectProgress, selectedValue, TestFlow } from './test-flow';

const NOW = 1_800_000_000_000;
const make = (store = createMemoryStore()) => { const f = new TestFlow({ storage: store, now: () => NOW }); f.init(); return { f, store }; };
const answerAll = (f: TestFlow, v: (i: number) => AnswerValue = () => 1, upTo = 68) => {
  for (let i = 0; i < upTo; i++) { f.select(v(i)); if (i < 67) { f.next(); if (f.getState().phase === 'transition') f.continueFromTransition(); } }
};

describe('start / resume', () => {
  it('no draft → ready at question 1 with nothing answered; init is idempotent', () => {
    const { f } = make(); f.init(); f.init();
    const s = f.getState();
    assert.equal(s.phase, 'ready'); assert.equal(currentQuestionId(s), 1); assert.equal(answeredCount(s), 0); assert.equal(s.test, PUBLIC_TEST);
    assert.equal(s.notice, null);
  });
  it('resumes at the first unanswered question from a saved draft', () => {
    const { store } = make();
    store.save({ startedAt: NOW, answers: { 1: 2, 2: 1, 3: 0 } });
    const { f } = make(store);
    assert.equal(currentQuestionId(f.getState()), 4); assert.equal(answeredCount(f.getState()), 3);
  });
  it('a fully answered draft opens on the last question', () => {
    const { store } = make();
    store.save({ startedAt: NOW, answers: Object.fromEntries(Array.from({ length: 68 }, (_, i) => [i + 1, 1 as AnswerValue])) });
    const { f } = make(store);
    assert.ok(isLastQuestion(f.getState())); assert.ok(canSubmit(f.getState()));
  });
  it('a draft older than 24 h is dropped with a notice', () => {
    const { store } = make();
    store.save({ startedAt: NOW - 25 * 3600_000, answers: { 1: 2 } });
    const { f } = make(store);
    assert.equal(answeredCount(f.getState()), 0); assert.match(f.getState().notice ?? '', /۲۴ ساعت/);
    assert.equal(store.load(NOW).kind, 'none');
  });
  it('start() throws away the draft and begins empty', () => {
    const { f, store } = make(); f.select(2);
    assert.equal(store.load(NOW).kind, 'ok');
    f.start();
    assert.equal(answeredCount(f.getState()), 0); assert.equal(store.load(NOW).kind, 'none');
  });
});

describe('answering + navigation', () => {
  it('select stores the answer immediately and persists the draft; same value twice is a no-op', () => {
    const { f, store } = make();
    f.select(-1);
    assert.equal(selectedValue(f.getState()), -1);
    const d = store.load(NOW); assert.ok(d.kind === 'ok' && d.draft.answers[1] === -1 && d.draft.startedAt === NOW);
    let notified = 0; f.subscribe(() => { notified++; }); f.select(-1); assert.equal(notified, 0);
  });
  it('rejects values outside the scale', () => {
    const { f } = make(); f.select(3 as unknown as AnswerValue); assert.equal(answeredCount(f.getState()), 0);
  });
  it('next only after the current question is answered; prev keeps answers', () => {
    const { f } = make();
    assert.equal(canGoNext(f.getState()), false); f.next(); assert.equal(currentQuestionId(f.getState()), 1);
    f.select(1); assert.ok(canGoNext(f.getState())); f.next(); assert.equal(currentQuestionId(f.getState()), 2);
    assert.ok(canGoPrev(f.getState())); f.prev(); assert.equal(selectedValue(f.getState()), 1);
    f.select(2); assert.equal(selectedValue(f.getState()), 2);          // answers can be changed
  });
  it('crossing a section boundary shows the transition screen first; progress reports the NEW section at 0%', () => {
    const { f } = make();
    answerAll(f, () => 1, 9); f.select(1);        // q10 answered (last of section 1)
    f.next();
    const s = f.getState(); assert.equal(s.phase, 'transition'); assert.equal(s.transitionTo, 2);
    const p = selectProgress(s)!; assert.equal(p.sectionNumber, 2); assert.equal(p.sectionPercent, 0); assert.equal(p.totalPercent, 15);
    f.continueFromTransition(); assert.equal(f.getState().phase, 'ready'); assert.equal(currentQuestionId(f.getState()), 11);
  });
  it('prev from the transition screen goes back to the last question of the previous section', () => {
    const { f } = make();
    for (let i = 0; i < 10; i++) { f.select(1); f.next(); }
    assert.equal(f.getState().phase, 'transition'); f.prev();
    assert.equal(f.getState().phase, 'ready'); assert.equal(currentQuestionId(f.getState()), 10);
  });
});

describe('submit', () => {
  it('is blocked until all 68 are answered', () => {
    const { f } = make(); answerAll(f, () => 1, 67);     // q1..q67 answered, cursor now on q68
    assert.ok(isLastQuestion(f.getState())); assert.equal(canSubmit(f.getState()), false);
    f.submit(); assert.equal(f.getState().phase, 'ready'); assert.equal(f.getState().resultHash, null);
  });
  it('hands over a hash that decodes to exactly the answers, clears the draft, and gives the same result as scoring directly', () => {
    const { f, store } = make();
    const vals: AnswerValue[] = [2, 1, 0, -1, -2];
    answerAll(f, (i) => vals[(i * 3 + 1) % 5]);
    assert.ok(canSubmit(f.getState()));
    const answers = { ...f.getState().answers };
    f.submit();
    const s = f.getState();
    assert.equal(s.phase, 'redirect'); assert.ok(s.resultHash?.startsWith('#v1.'));
    assert.deepEqual(answersFromHash(s.resultHash!), answers);
    assert.deepEqual(computeResult(answersFromHash(s.resultHash!)!), computeResult(answers));
    assert.equal(store.load(NOW).kind, 'none');       // nothing left in the browser
  });
  it('double submit does nothing more', () => {
    const { f } = make(); answerAll(f); f.submit(); const h = f.getState().resultHash; f.submit();
    assert.equal(f.getState().resultHash, h); assert.equal(f.getState().phase, 'redirect');
  });
});
