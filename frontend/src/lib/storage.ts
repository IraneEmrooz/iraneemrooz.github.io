import { QUESTIONS } from './definition/scoring-v1';
import type { AnswerValue } from './types';

/**
 * The ONLY thing persisted in the browser: an unfinished draft (answers given so far + start time), so a reload
 * or a closed tab does not lose progress. It never leaves the device (there is no server). It is deleted when
 * the test is submitted, when the person starts over, or once it is older than DRAFT_TTL_HOURS (counted from
 * the start, not from the last answer). The finished result is NOT stored: it lives only in the link.
 */
export const DRAFT_TTL_HOURS = 24;
const KEY = 'ipv.draft.v1';
const KNOWN = new Set(QUESTIONS.map((q) => q.id));
const VALID = new Set<number>([-2, -1, 0, 1, 2]);

export interface Draft { startedAt: number; answers: Record<number, AnswerValue> }
export type DraftLoad = { kind: 'none' } | { kind: 'expired' } | { kind: 'ok'; draft: Draft };
export interface DraftStore { load(now?: number): DraftLoad; save(d: Draft): void; clear(): void }

export function parseDraft(raw: string | null, now: number): DraftLoad {
  if (!raw) return { kind: 'none' };
  try {
    const o = JSON.parse(raw) as { v?: unknown; startedAt?: unknown; answers?: unknown };
    if (o?.v !== 1 || typeof o.startedAt !== 'number' || !Number.isFinite(o.startedAt) || typeof o.answers !== 'object' || o.answers === null) return { kind: 'none' };
    if (now - o.startedAt > DRAFT_TTL_HOURS * 3600_000) return { kind: 'expired' };
    const answers: Record<number, AnswerValue> = {};
    for (const [k, v] of Object.entries(o.answers as Record<string, unknown>)) {
      const id = Number(k);
      if (KNOWN.has(id) && typeof v === 'number' && VALID.has(v)) answers[id] = v as AnswerValue;   // silently drop junk
    }
    return { kind: 'ok', draft: { startedAt: o.startedAt, answers } };
  } catch { return { kind: 'none' }; }
}
const serialize = (d: Draft) => JSON.stringify({ v: 1, startedAt: d.startedAt, answers: d.answers });

export function createMemoryStore(initial: Draft | null = null): DraftStore {
  let v: Draft | null = initial;
  return {
    load: (now = Date.now()) => { const r = parseDraft(v ? serialize(v) : null, now); if (r.kind === 'expired') v = null; return r; },
    save: (d) => { v = { startedAt: d.startedAt, answers: { ...d.answers } }; },
    clear: () => { v = null; },
  };
}

/** localStorage-backed; if storage is blocked (private mode) it degrades to in-memory for this tab. */
export function createBrowserDraftStore(): DraftStore {
  let memory: Draft | null = null;
  const ls = (): Storage | null => { try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; } };
  return {
    load(now = Date.now()) {
      let raw: string | null = null;
      try { raw = ls()?.getItem(KEY) ?? null; } catch { /* ignore */ }
      const r = parseDraft(raw ?? (memory ? serialize(memory) : null), now);
      if (r.kind === 'expired') this.clear();
      return r;
    },
    save(d) { memory = { startedAt: d.startedAt, answers: { ...d.answers } }; try { ls()?.setItem(KEY, serialize(d)); } catch { /* ignore */ } },
    clear() { memory = null; try { ls()?.removeItem(KEY); } catch { /* ignore */ } },
  };
}
