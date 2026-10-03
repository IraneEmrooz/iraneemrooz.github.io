import { useEffect, useRef } from 'react';
import type { AnswerValue } from '@/lib/types';
import { withBase } from '@/lib/paths';
import {
  canGoNext, canGoPrev, canSubmit, currentQuestion, currentQuestionId, isLastQuestion,
  selectProgress, selectedValue, type FlowState,
} from '@/lib/flow/test-flow';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';
import { Progress } from './Progress';
import { QuestionCard } from './QuestionCard';
import { SectionTransition } from './SectionTransition';
import { btnPrimary } from './ui';


export interface TestPageActions {
  select: (v: AnswerValue) => void;
  next: () => void;
  prev: () => void;
  submit: () => void;
  continueFromTransition: () => void;
  reload: () => void;
  start: () => void;
}

/** Pure view of FlowState (no router/network). The parent wires `actions` to a TestFlow. */
export function TestPageView({ state, actions }: { state: FlowState; actions: TestPageActions }) {
  const qid = currentQuestionId(state);
  const focusRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  // Move focus only when the screen really changes (new question / section transition) — not on
  // error→ready flips, which would pull focus off the button the person just pressed.
  const screenKey = `${qid}:${state.phase === 'transition' ? 'transition' : 'question'}`;
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    focusRef.current?.focus({ preventScroll: false });
  }, [screenKey]);

  const startNew = <button type="button" onClick={actions.start} className={btnPrimary}>شروع آزمون جدید</button>;

  switch (state.phase) {
    case 'loading':
      return <LoadingState label="در حال بارگذاری آزمون…" />;
    case 'redirect':
      return (
        <div role="status">
          <LoadingState label="در حال انتقال به نتیجه…" />
          {state.resultHash && <p className="text-center text-caption"><a className="underline" href={withBase(`/result/${state.resultHash}`)}>اگر منتقل نشدید، اینجا را بزنید.</a></p>}
        </div>
      );
    case 'error':
      return (
        <ErrorState
          message={state.error?.message ?? 'خطایی رخ داد.'}
          onRetry={actions.reload}
          actions={startNew}
        />
      );
    default:
  }

  const progress = selectProgress(state);
  const q = currentQuestion(state);
  if (!state.test || !progress || !q) return <LoadingState />;

  if (state.phase === 'transition') {
    return (
      <div className="grid gap-4">
        <Progress sectionTitle={progress.sectionTitle} sectionPercent={progress.sectionPercent} totalPercent={progress.totalPercent} />
        <div ref={focusRef} tabIndex={-1} className="outline-none">
          <SectionTransition title={progress.sectionTitle} onContinue={actions.continueFromTransition} onBack={actions.prev} canBack={canGoPrev(state)} />
        </div>
      </div>
    );
  }

  const sectionTitle = state.test.sections.find((s) => s.questions.some((x) => x.id === q.id))?.title ?? '';
  return (
    <div className="grid gap-4">
      <Progress sectionTitle={progress.sectionTitle} sectionPercent={progress.sectionPercent} totalPercent={progress.totalPercent} />
      <div ref={focusRef} tabIndex={-1} className="outline-none">
        <QuestionCard
          questionId={q.id} sectionTitle={sectionTitle} text={q.text} scale={state.test.scale}
          value={selectedValue(state)} onSelect={actions.select}
          onPrev={actions.prev} canPrev={canGoPrev(state)}
          onNext={actions.next} canNext={canGoNext(state)}
          isLast={isLastQuestion(state)} onSubmit={actions.submit} canSubmit={canSubmit(state)}
          submitError={state.error?.scope === 'submit' ? state.error : null}
        />
      </div>
    </div>
  );
}
