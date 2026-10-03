import type { TestDefinition } from './scoring-v1';

export class ScoringError extends Error {}
const VALID = new Set([-2, -1, 0, 1, 2]);

export interface Contribution {
  questionId: number;
  response: number;             // raw answer, -2..+2
  weight: number;               // loading weight of this question on this axis
  signedResponse: number;       // response * sign (+1 = pole B direction, -1 = pole A direction)
  weightedContribution: number; // signedResponse * weight  (numerator term of M)
}
export interface Result {
  testVersion: string;
  axes: Record<string, number>;      // bipolar axes, 0=Pole A .. 100=Pole B
  metrics: Record<string, number>;   // independent single-pole metrics
  distanceFromStatusQuo: number;
  certainty: number;
  contributions: Record<string, Contribution[]>;
}

/** Pure function: no DB / HTTP. answers: questionId -> -2..2 */
export function calculateResult(def: TestDefinition, answers: Record<number, number>): Result {
  const total = def.questions.length;
  for (const [k, v] of Object.entries(answers)) {
    if (!def.questions.some((x) => x.id === Number(k))) throw new ScoringError(`Unknown question ${k}`);
    if (!VALID.has(v)) throw new ScoringError(`Invalid value ${v} for question ${k}`);
  }
  if (def.questions.some((x) => answers[x.id] === undefined)) throw new ScoringError(`All ${total} questions must be answered`);

  const num: Record<string, number> = {}, den: Record<string, number> = {}, contributions: Record<string, Contribution[]> = {};
  let dNum = 0, dDen = 0, nonNeutral = 0;

  for (const question of def.questions) {
    const r = answers[question.id];
    if (r !== 0) nonNeutral++;
    for (const l of question.scoring) {
      const axis = def.axes[l.axis];
      const sign = l.pole === axis.poleB ? 1 : l.pole === axis.poleA ? -1 : NaN;
      if (Number.isNaN(sign)) throw new ScoringError(`Pole ${l.pole} not on axis ${l.axis}`);
      const signedResponse = r * sign || 0;               // `|| 0` normalises -0
      const weightedContribution = signedResponse * l.weight || 0;
      num[l.axis] = (num[l.axis] ?? 0) + weightedContribution;
      den[l.axis] = (den[l.axis] ?? 0) + l.weight;
      (contributions[l.axis] ??= []).push({ questionId: question.id, response: r, weight: l.weight, signedResponse, weightedContribution });
    }
    const { weight, agreementMeans } = question.distance;
    if (weight > 0 && agreementMeans !== 'none') {
      const d = agreementMeans === 'farther' ? (r + 2) / 4 : (2 - r) / 4;
      dNum += d * weight; dDen += weight;
    }
  }
  const axes: Record<string, number> = {}, metrics: Record<string, number> = {};
  for (const name of Object.keys(num)) {
    const pct = ((num[name] / den[name] + 2) / 4) * 100;
    (def.axes[name].type === 'metric' ? metrics : axes)[name] = pct;
  }
  return {
    testVersion: def.version, axes, metrics, contributions,
    distanceFromStatusQuo: dDen ? (100 * dNum) / dDen : 0,
    certainty: (100 * nonNeutral) / total,
  };
}
