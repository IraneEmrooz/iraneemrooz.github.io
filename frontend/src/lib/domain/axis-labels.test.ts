import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import { AXES } from '../definition/scoring-v1';
import { AXIS_LABELS, FUTURE_ITEMS, GENERAL_AXES, METRIC_TITLES } from './axis-labels';
import { buildResultViewModel } from './result-view';
import { makeResult } from '@/test-support/fixtures';

const SPEC = resolve(__dirname, '../../../../docs/handoff/TEST_SPEC.md');

describe('axis labels are verbatim TEST_SPEC.md', () => {
  it('every pole string equals the spec text', { skip: !existsSync(SPEC) && 'TEST_SPEC.md not found (standalone checkout)' }, () => {
    const rows = [...readFileSync(SPEC, 'utf8').matchAll(/^- `([a-z_]+)`: A\) (.+?) ↔ B\) (.+?)(?: \*\(.*\)\*)?$/gmu)];
    assert.equal(rows.length, 21);
    for (const [, name, a, b] of rows) assert.deepEqual(AXIS_LABELS[name], { poleA: a, poleB: b }, name);
    assert.deepEqual(Object.keys(AXIS_LABELS), rows.map((r) => r[1]));
  });
  it('axis ids match the built-in scoring definition', () => {
    const bipolar = Object.entries(AXES).filter(([, d]) => d.type === 'axis').map(([n]) => n);
    const metrics = Object.entries(AXES).filter(([, d]) => d.type === 'metric').map(([n]) => n);
    assert.deepEqual([...Object.keys(AXIS_LABELS)].sort(), [...bipolar].sort());
    assert.deepEqual(Object.keys(METRIC_TITLES).sort(), [...metrics].sort());
  });
  it('every axis/metric lands in exactly one place (general XOR future)', () => {
    const future = FUTURE_ITEMS.filter((i) => i.type === 'axis').map((i) => i.name);
    assert.equal(GENERAL_AXES.length + future.length, 21);
    assert.equal(GENERAL_AXES.filter((n) => future.includes(n)).length, 0);
  });
  it('view model splits future government from general axes and never adds an overall figure', () => {
    const vm = buildResultViewModel(makeResult());
    assert.equal(vm.general.length, 17);
    assert.equal(vm.future.length, 6);
    assert.deepEqual(vm.future.map((r) => r.name), FUTURE_ITEMS.map((i) => i.name));
    assert.equal(vm.future.filter((r) => r.kind === 'metric').length, 2);
    assert.deepEqual(Object.keys(vm).sort(), ['certainty', 'distanceFromStatusQuo', 'future', 'general']);
  });
});
