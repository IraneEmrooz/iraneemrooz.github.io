import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { createBrowserDraftStore, createMemoryStore, DRAFT_TTL_HOURS, parseDraft } from './storage';

const NOW = 1_800_000_000_000;
const raw = (o: unknown) => JSON.stringify(o);

describe('draft parsing', () => {
  it('none for empty / junk / wrong version / wrong shape', () => {
    for (const r of [null, '', 'x', '[]', raw({ v: 2, startedAt: NOW, answers: {} }), raw({ v: 1, answers: {} }), raw({ v: 1, startedAt: 'a', answers: {} }), raw({ v: 1, startedAt: NOW, answers: null })]) {
      assert.deepEqual(parseDraft(r, NOW), { kind: 'none' }, String(r));
    }
  });
  it('expires 24 h after the START (not after the last answer)', () => {
    const edge = DRAFT_TTL_HOURS * 3600_000;
    assert.equal(parseDraft(raw({ v: 1, startedAt: NOW - edge, answers: { 1: 2 } }), NOW).kind, 'ok');
    assert.equal(parseDraft(raw({ v: 1, startedAt: NOW - edge - 1, answers: { 1: 2 } }), NOW).kind, 'expired');
  });
  it('drops unknown question ids and invalid values, keeps the rest', () => {
    const r = parseDraft(raw({ v: 1, startedAt: NOW, answers: { 1: 2, 2: 7, 999: 1, x: 1, 3: 'a', 4: -2 } }), NOW);
    assert.equal(r.kind, 'ok');
    if (r.kind === 'ok') assert.deepEqual(r.draft.answers, { 1: 2, 4: -2 });
  });
});

describe('memory store', () => {
  it('save → load → clear, and loads copies', () => {
    const s = createMemoryStore();
    assert.deepEqual(s.load(NOW), { kind: 'none' });
    const d = { startedAt: NOW, answers: { 1: 2 as const } };
    s.save(d); d.answers[1] = 2;
    const r = s.load(NOW); assert.equal(r.kind, 'ok');
    s.clear(); assert.deepEqual(s.load(NOW), { kind: 'none' });
  });
});

describe('browser store', () => {
  const g = globalThis as unknown as { window?: unknown };
  afterEach(() => { delete g.window; });
  const fakeLs = () => { const m = new Map<string, string>(); return { m, getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); } }; };

  it('persists under one key, survives a new instance (reload), and clear removes it', () => {
    const ls = fakeLs(); g.window = { localStorage: ls };
    createBrowserDraftStore().save({ startedAt: NOW, answers: { 5: -1 } });
    assert.deepEqual([...ls.m.keys()], ['ipv.draft.v1']);
    const again = createBrowserDraftStore().load(NOW);
    assert.equal(again.kind, 'ok');
    const s = createBrowserDraftStore(); s.clear(); assert.equal(ls.m.size, 0);
  });
  it('an expired draft is removed from storage when loaded', () => {
    const ls = fakeLs(); g.window = { localStorage: ls };
    ls.m.set('ipv.draft.v1', raw({ v: 1, startedAt: NOW - 25 * 3600_000, answers: { 1: 1 } }));
    assert.equal(createBrowserDraftStore().load(NOW).kind, 'expired');
    assert.equal(ls.m.size, 0);
  });
  it('blocked storage (private mode) degrades to memory instead of throwing', () => {
    const boom = () => { throw new Error('denied'); };
    g.window = { get localStorage() { return boom(); } };
    const s = createBrowserDraftStore();
    s.save({ startedAt: NOW, answers: { 1: 1 } });
    assert.equal(s.load(NOW).kind, 'ok'); s.clear(); assert.equal(s.load(NOW).kind, 'none');
  });
  it('no window (server render) is harmless', () => {
    const s = createBrowserDraftStore(); s.save({ startedAt: NOW, answers: {} }); assert.equal(s.load(NOW).kind, 'ok');
  });
});
