'use client';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTestFlow } from '@/hooks/use-test-flow';
import { TestPageView, type TestPageActions } from './TestPageView';

export function TestClient() {
  const router = useRouter();
  const { flow, state } = useTestFlow();
  const actions = useMemo<TestPageActions>(() => ({
    select: (v) => flow.select(v),
    next: () => flow.next(), prev: () => flow.prev(),
    submit: () => flow.submit(),
    continueFromTransition: () => flow.continueFromTransition(),
    reload: () => flow.reload(),
    start: () => flow.start(),
  }), [flow]);

  useEffect(() => { if (state.phase === 'redirect' && state.resultHash) router.replace(`/result/${state.resultHash}`); }, [state.phase, state.resultHash, router]);

  return <TestPageView state={state} actions={actions} />;
}
