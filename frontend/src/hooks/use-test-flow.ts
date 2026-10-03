'use client';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { TestFlow, type FlowState } from '@/lib/flow/test-flow';
import { createBrowserDraftStore } from '@/lib/storage';

export function useTestFlow(): { flow: TestFlow; state: FlowState } {
  const ref = useRef<TestFlow | null>(null);
  if (!ref.current) ref.current = new TestFlow({ storage: createBrowserDraftStore() });
  const flow = ref.current;
  const state = useSyncExternalStore(flow.subscribe, flow.getState, flow.getState);
  useEffect(() => { flow.init(); }, [flow]);
  return { flow, state };
}
