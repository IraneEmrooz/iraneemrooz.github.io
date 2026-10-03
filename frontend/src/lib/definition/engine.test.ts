import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateResult, ScoringError } from './engine';
import { DEFINITION_V1 as D, QUESTIONS, type TestDefinition } from './scoring-v1';

const all = (v: number): Record<number, number> => Object.fromEntries(QUESTIONS.map((x) => [x.id, v]));
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const wsum = (axis: string) => QUESTIONS.flatMap((x) => x.scoring).filter((l) => l.axis === axis).reduce((s, l) => s + l.weight, 0);

test('definition: 68 questions, section sizes 10/4/7/8/7/5/6/5/5/11', () => {
  assert.equal(QUESTIONS.length, 68);
  assert.deepEqual([1,2,3,4,5,6,7,8,9,10].map((s) => QUESTIONS.filter((x) => x.section === s).length), [10,4,7,8,7,5,6,5,5,11]);
  QUESTIONS.forEach((x, i) => assert.equal(x.id, i + 1));
});
test('definition: agreementMeans none <=> distanceWeight 0', () => {
  for (const x of QUESTIONS) assert.equal(x.distance.agreementMeans === 'none', x.distance.weight === 0, `Q${x.id}`);
});
test('1: all zeros -> 50 everywhere, certainty 0, distance 50', () => {
  const r = calculateResult(D, all(0));
  Object.values(r.axes).forEach((v) => near(v, 50));
  Object.values(r.metrics).forEach((v) => near(v, 50));
  assert.equal(r.certainty, 0); near(r.distanceFromStatusQuo, 50);
});
test('2/3: all +2 and all -2 mirror on axes; metrics 100/0; distances sum to 100', () => {
  const hi = calculateResult(D, all(2)), lo = calculateResult(D, all(-2));
  for (const k of Object.keys(hi.axes)) near(hi.axes[k] + lo.axes[k], 100);
  assert.equal(hi.metrics.democratic_choice, 100); assert.equal(lo.metrics.reza_pahlavi_transition_role, 0);
  assert.equal(hi.certainty, 100);
  near(hi.distanceFromStatusQuo + lo.distanceFromStatusQuo, 100);
});
test('4: changing only Q16 changes only rule_of_law and democracy (axes/metrics)', () => {
  const base = calculateResult(D, all(0)), a = all(0); a[16] = 2;
  const r = calculateResult(D, a);
  for (const k of Object.keys(base.axes)) if (!['rule_of_law', 'democracy'].includes(k)) near(r.axes[k], base.axes[k]);
  assert.notEqual(r.axes.rule_of_law, 50); assert.notEqual(r.axes.democracy, 50);
  Object.keys(base.metrics).forEach((k) => near(r.metrics[k], base.metrics[k]));
});
test('5: secondary weight 0.25 applied exactly (Q17)', () => {
  const a = all(0); a[17] = 2;
  const r = calculateResult(D, a);
  near(r.axes.democracy, ((2 / wsum('democracy') + 2) / 4) * 100);
  near(r.axes.rule_of_law, ((0.5 / wsum('rule_of_law') + 2) / 4) * 100);
});
test('5b: agreement with a pole-A statement lowers the axis (Q1 +2)', () => {
  const a = all(0); a[1] = 2;
  assert.ok(calculateResult(D, a).axes.individual_freedom < 50);
});
test('6: distance direction, exact values; none ignored', () => {
  const totalW = QUESTIONS.reduce((s, x) => s + x.distance.weight, 0);
  const neutral = totalW * 0.5;
  const dist = (id: number, v: number) => { const a = all(0); a[id] = v; return calculateResult(D, a).distanceFromStatusQuo; };
  near(dist(2, 2), (100 * (neutral + 0.5)) / totalW);    // farther, +2 -> d=1
  near(dist(2, -2), (100 * (neutral - 0.5)) / totalW);   // farther, -2 -> d=0
  near(dist(1, 2), (100 * (neutral - 0.5)) / totalW);    // closer, +2 -> d=0
  near(dist(1, -2), (100 * (neutral + 0.5)) / totalW);   // closer, -2 -> d=1
  near(dist(22, 2), 50);                                  // none: ignored
});
test('7: invalid response rejected', () => {
  const a = all(0); a[5] = 3;
  assert.throws(() => calculateResult(D, a), ScoringError);
});
test('8: incomplete test rejected', () => {
  const a = all(0); delete a[68];
  assert.throws(() => calculateResult(D, a), /must be answered/);
});
test('9: definition frozen; modified copy does not affect v1 results', () => {
  assert.ok(Object.isFrozen(D) && Object.isFrozen(D.questions[0]));
  const before = calculateResult(D, all(1));
  const v2 = structuredClone(D); v2.version = '2.0'; (v2.questions[15].scoring[0] as { weight: number }).weight = 5;
  assert.notDeepEqual(calculateResult(v2, all(1)).axes, before.axes);
  assert.deepEqual(calculateResult(D, all(1)), before);
  try { (D.questions[0] as { id: number }).id = 99; } catch {}
  assert.equal(D.questions[0].id, 1);
});

// ───────── Extended direction / independence / distance tests ─────────
const only = (id: number, v: number) => { const a = all(0); a[id] = v; return calculateResult(D, a); };
const base0 = calculateResult(D, all(0));
const changed = (r: ReturnType<typeof calculateResult>) => [
  ...Object.keys(r.axes).filter((k) => Math.abs(r.axes[k] - base0.axes[k]) > 1e-9),
  ...Object.keys(r.metrics).filter((k) => Math.abs(r.metrics[k] - base0.metrics[k]) > 1e-9),
].sort();

// [question, axis, pole that agreement points to]
const DIRECTIONS: [number, string, string][] = [
  [14, 'secularism', 'religious_role'],
  [19, 'rule_of_law', 'power_without_accountability'],
  [27, 'market_vs_state', 'state_intervention'],
  [28, 'limited_vs_service_state', 'limited_state'],
  [45, 'regional_role', 'limited_regional_role'],
  [46, 'regional_role', 'active_regional_role'],
  [59, 'transition_leadership', 'centralized_leadership'],
  [60, 'transition_leadership', 'collective_leadership'],
  [61, 'transition_speed', 'gradual_transition'],
  [65, 'accountability_vs_reconciliation', 'accountability_and_prosecution'],
  [66, 'future_government_form', 'constitutional_monarchy'],
  [67, 'future_government_form', 'constitutional_monarchy'],
  [68, 'future_government_form', 'constitutional_monarchy'],
];
for (const [id, axis, pole] of DIRECTIONS) {
  test(`direction: Q${id} agreement -> ${axis} / ${pole}`, () => {
    const primary = QUESTIONS[id - 1].scoring[0];
    assert.equal(primary.axis, axis); assert.equal(primary.pole, pole);
    const def = D.axes[axis];
    const poleIsB = pole === def.poleB;
    assert.ok(poleIsB || pole === def.poleA);
    const agree = only(id, 2).axes[axis], disagree = only(id, -2).axes[axis];
    if (poleIsB) { assert.ok(agree > 50 && disagree < 50); } else { assert.ok(agree < 50 && disagree > 50); }
  });
}

test('11: Q63 moves only the democratic_choice metric (plus its 0.25 democracy secondary); Q64 only reza metric', () => {
  const r63 = only(63, 2);
  assert.deepEqual(changed(r63), ['democracy', 'democratic_choice']);
  assert.equal(r63.metrics.democratic_choice, 100);
  near(r63.metrics.reza_pahlavi_transition_role, 50);
  near(r63.axes.future_government_form, 50);
  const r64 = only(64, 2);
  assert.deepEqual(changed(r64), ['reza_pahlavi_transition_role']);
  assert.equal(r64.metrics.reza_pahlavi_transition_role, 100);
  near(r64.metrics.democratic_choice, 50); near(r64.axes.future_government_form, 50);
  assert.equal(Object.keys(r64.axes).length, Object.keys(base0.axes).length);
});

test('12: for EVERY question, changing its answer changes exactly the axes/metrics it loads on', () => {
  for (const x of QUESTIONS) {
    const expected = [...new Set(x.scoring.map((l) => l.axis))].sort();
    assert.deepEqual(changed(only(x.id, 2)), expected, `Q${x.id}`);
    assert.deepEqual(changed(only(x.id, -1)), expected, `Q${x.id} (-1)`);
  }
});
test('12b: dual-axis Q6 (weights 1 and 0.5) exact values, nothing else moves', () => {
  const r = only(6, 2);
  assert.deepEqual(changed(r), ['individual_freedom', 'secularism']);
  near(r.axes.secularism, ((-(2 * 0.5) / wsum('secularism') + 2) / 4) * 100);
});

test('13: distance is independent of answers for agreementMeans=none / weight 0', () => {
  const noneIds = QUESTIONS.filter((x) => x.distance.agreementMeans === 'none').map((x) => x.id);
  assert.equal(noneIds.length, 13);
  for (const baseV of [0, 1, -2]) {
    const ref = calculateResult(D, all(baseV)).distanceFromStatusQuo;
    for (const id of noneIds) for (const v of [-2, -1, 0, 1, 2]) {
      const a = all(baseV); a[id] = v;
      near(calculateResult(D, a).distanceFromStatusQuo, ref);
    }
  }
});

// Hand-computable mini definition: Q1 farther w1, Q2 closer w1, Q3 none w0.
const mini = {
  version: 'mini', axes: { a: { poleA: 'A', poleB: 'B', type: 'axis' } },
  questions: [1, 2, 3].map((id) => ({ id, section: 1, scoring: [{ axis: 'a', pole: 'B', weight: 1 }],
    distance: id === 1 ? { weight: 1, agreementMeans: 'farther' } : id === 2 ? { weight: 1, agreementMeans: 'closer' } : { weight: 0, agreementMeans: 'none' } })),
} as unknown as TestDefinition;
const md = (a: number, b: number, c: number) => calculateResult(mini, { 1: a, 2: b, 3: c }).distanceFromStatusQuo;
test('14a: farther — +2 / 0 / -2 (other questions neutral)', () => {
  near(md(2, 0, 0), 75); near(md(0, 0, 0), 50); near(md(-2, 0, 0), 25);
});
test('14b: closer — +2 / 0 / -2 (other questions neutral)', () => {
  near(md(0, 2, 0), 25); near(md(0, 0, 0), 50); near(md(0, -2, 0), 75);
});
test('14c: none — answer never matters', () => {
  near(md(0, 0, 2), 50); near(md(0, 0, -2), 50); near(md(2, -2, 1), 100);
});
test('14d: real definition — Q2 farther and Q1 closer at +2/0/-2', () => {
  const totalW = QUESTIONS.reduce((s, x) => s + x.distance.weight, 0);
  const at = (id: number, v: number) => only(id, v).distanceFromStatusQuo;
  const step = 100 * 0.5 / totalW;
  near(at(2, 2), 50 + step); near(at(2, 0), 50); near(at(2, -2), 50 - step);
  near(at(1, 2), 50 - step); near(at(1, 0), 50); near(at(1, -2), 50 + step);
});

// ───────── Contribution shape (explanatory output only) ─────────
test('contributions: signedResponse / weightedContribution fields (Q17 +2 and Q1 -1)', () => {
  const a = all(0); a[17] = 2; a[1] = -1;
  const c = calculateResult(D, a).contributions;
  assert.deepEqual(c.democracy.find((x) => x.questionId === 17), { questionId: 17, response: 2, weight: 1, signedResponse: 2, weightedContribution: 2 });
  assert.deepEqual(c.rule_of_law.find((x) => x.questionId === 17), { questionId: 17, response: 2, weight: 0.25, signedResponse: 2, weightedContribution: 0.5 });
  // Q1 loads on pole A (government_restriction): sign -1, so response -1 => signedResponse +1
  assert.deepEqual(c.individual_freedom.find((x) => x.questionId === 1), { questionId: 1, response: -1, weight: 1, signedResponse: 1, weightedContribution: 1 });
  for (const list of Object.values(c)) for (const x of list) {
    assert.ok(!Object.is(x.signedResponse, -0) && !Object.is(x.weightedContribution, -0));
    assert.equal(x.weightedContribution, x.signedResponse * x.weight);
  }
});
test('contributions reproduce the published scores exactly (scoring logic unchanged)', () => {
  const vals = [-2, -1, 0, 1, 2];
  const a = Object.fromEntries(QUESTIONS.map((x) => [x.id, vals[(x.id * 7 + 3) % 5]]));
  const r = calculateResult(D, a);
  for (const [k, list] of Object.entries(r.contributions)) {
    const M = list.reduce((s, x) => s + x.weightedContribution, 0) / list.reduce((s, x) => s + x.weight, 0);
    near(((M + 2) / 4) * 100, k in r.axes ? r.axes[k] : r.metrics[k]);
  }
});
