import { computeResult } from '../result/compute';
import { hashForAnswers } from '../result/codec';
import { ANSWER_VALUES, type AnswerValue, type TestDefinition } from '../types';
import { PUBLIC_TEST } from '../definition/public-test';
import { computeProgress, firstUnansweredIndex, flattenQuestions, type Answers, type OrderedQuestion, type Progress } from '../domain/progress';
import type { DraftStore } from '../storage';

export type Phase = 'loading' | 'ready' | 'transition' | 'redirect' | 'error';

export interface FlowState {
  phase: Phase;
  test: TestDefinition | null;
  order: OrderedQuestion[];
  startedAt: number | null;
  answers: Answers;
  currentIndex: number;
  transitionTo: number | null;
  /** '#v1.…' — set when the test was submitted; the page navigates to /result#… */
  resultHash: string | null;
  /** Set when a previous draft was dropped because it was older than 24 hours. */
  notice: string | null;
  error: { message: string; scope: 'load' | 'submit' } | null;
}

export const INITIAL_STATE: FlowState = {
  phase: 'loading', test: null, order: [], startedAt: null, answers: {}, currentIndex: 0,
  transitionTo: null, resultHash: null, notice: null, error: null,
};

export interface FlowDeps { storage: DraftStore; test?: TestDefinition; now?: () => number }

// ── selectors (pure) ──
export const currentQuestionId = (s: FlowState): number | null => s.order[s.currentIndex]?.id ?? null;
export const currentQuestion = (s: FlowState) => {
  const id = currentQuestionId(s);
  return id === null ? null : s.test?.sections.flatMap((x) => x.questions).find((q) => q.id === id) ?? null;
};
export const currentSectionNumber = (s: FlowState): number => s.order[s.currentIndex]?.section ?? s.test?.sections[0]?.number ?? 0;
export const selectProgress = (s: FlowState): Progress | null =>
  s.test ? computeProgress(s.test, s.answers, s.phase === 'transition' && s.transitionTo !== null ? s.transitionTo : currentSectionNumber(s)) : null;
export const selectedValue = (s: FlowState): AnswerValue | null => {
  const id = currentQuestionId(s);
  return id === null ? null : s.answers[id] ?? null;
};
export const isLastQuestion = (s: FlowState): boolean => s.currentIndex === s.order.length - 1;
export const answeredCount = (s: FlowState): number => Object.keys(s.answers).length;
const isCurrentAnswered = (s: FlowState): boolean => { const id = currentQuestionId(s); return id !== null && s.answers[id] !== undefined; };
export const canGoNext = (s: FlowState): boolean => s.phase === 'ready' && !isLastQuestion(s) && isCurrentAnswered(s);
export const canGoPrev = (s: FlowState): boolean => (s.phase === 'ready' || s.phase === 'transition') && s.currentIndex > 0;
export const canSubmit = (s: FlowState): boolean =>
  s.phase === 'ready' && isLastQuestion(s) && isCurrentAnswered(s) && s.order.length > 0 && answeredCount(s) === s.order.length;

const SCALE_SET = new Set<number>(ANSWER_VALUES);

/** Framework-agnostic store for the /test page. Everything is local and synchronous; nothing is sent anywhere. */
export class TestFlow {
  private state: FlowState = INITIAL_STATE;
  private listeners = new Set<() => void>();
  private started = false;
  private readonly test: TestDefinition;
  private readonly now: () => number;

  constructor(private readonly deps: FlowDeps) { this.test = deps.test ?? PUBLIC_TEST; this.now = deps.now ?? Date.now; }

  getState = (): FlowState => this.state;
  subscribe = (l: () => void): (() => void) => { this.listeners.add(l); return () => { this.listeners.delete(l); }; };
  private set(p: Partial<FlowState>): void { this.state = { ...this.state, ...p }; this.listeners.forEach((l) => l()); }

  /** Idempotent (safe under React StrictMode double effects). */
  init(): void { if (!this.started) { this.started = true; this.load(); } }
  reload(): void { this.load(); }

  /** Drop any draft and begin an empty test. */
  start(): void { this.deps.storage.clear(); this.started = true; this.load(); }

  private load(): void {
    const order = flattenQuestions(this.test);
    const known = new Set(order.map((q) => q.id));
    const r = this.deps.storage.load(this.now());
    const answers: Record<number, AnswerValue> = {};
    let startedAt = this.now();
    if (r.kind === 'ok') {
      startedAt = r.draft.startedAt;
      for (const [k, v] of Object.entries(r.draft.answers)) if (known.has(Number(k)) && SCALE_SET.has(v)) answers[Number(k)] = v;
    }
    const idx = firstUnansweredIndex(order, answers);
    this.set({
      ...INITIAL_STATE, phase: 'ready', test: this.test, order, startedAt, answers,
      currentIndex: idx === -1 ? Math.max(0, order.length - 1) : idx,
      notice: r.kind === 'expired' ? 'پاسخ‌های نیمه‌کارهٔ قبلی بیش از ۲۴ ساعت پیش شروع شده بودند و پاک شدند.' : null,
    });
  }

  // ── answering ──
  select(value: AnswerValue): void {
    const s = this.state; const q = currentQuestionId(s);
    if (s.phase !== 'ready' || q === null || s.startedAt === null || !SCALE_SET.has(value)) return;
    if (s.answers[q] === value) return;
    const answers = { ...s.answers, [q]: value };
    this.deps.storage.save({ startedAt: s.startedAt, answers });
    this.set({ answers, error: null });
  }

  // ── navigation ──
  next(): void {
    const s = this.state;
    if (!canGoNext(s)) return;
    const from = s.order[s.currentIndex], to = s.order[s.currentIndex + 1];
    this.set({
      currentIndex: s.currentIndex + 1, error: null,
      ...(from.section !== to.section ? { phase: 'transition' as const, transitionTo: to.section } : {}),
    });
  }
  prev(): void {
    const s = this.state;
    if (!canGoPrev(s)) return;
    this.set({ phase: 'ready', currentIndex: s.currentIndex - 1, error: null, transitionTo: null });
  }
  continueFromTransition(): void {
    if (this.state.phase === 'transition') this.set({ phase: 'ready', transitionTo: null });
  }

  // ── submit ──
  /** Validates by actually scoring (throws on anything incomplete/invalid), clears the draft, hands over the link hash. */
  submit(): void {
    const s = this.state;
    if (!canSubmit(s)) return;
    try {
      computeResult(s.answers);
      const hash = hashForAnswers(s.answers);
      this.deps.storage.clear();
      this.set({ phase: 'redirect', resultHash: hash, error: null });
    } catch {
      this.set({ error: { message: 'نتیجه ساخته نشد. پاسخ‌ها کامل یا معتبر نبودند؛ دوباره بررسی کنید.', scope: 'submit' } });
    }
  }
}
