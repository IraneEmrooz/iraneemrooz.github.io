import { calculateResult, type Contribution as EngineContribution } from '../definition/engine';
import { DEFINITION_V1 } from '../definition/scoring-v1';
import type { AnswerValue, Contribution, ResultData } from '../types';

const TOP_N = 4;
export const round2 = (x: number) => Math.round(x * 100) / 100;

/**
 * Largest-|contribution| first (ties by question id). Neutral answers (contribution 0) are listed AFTER the
 * non-neutral ones, but only when they help the reader: the axis has at most `n` questions in total (so everything
 * can be shown), or nothing else explains the score (e.g. every answer was neutral → 50%).
 */
export function topContributions(list: EngineContribution[], n = TOP_N): EngineContribution[] {
  const byId = (a: EngineContribution, b: EngineContribution) => a.questionId - b.questionId;
  const active = list.filter((c) => c.weightedContribution !== 0)
    .sort((a, b) => Math.abs(b.weightedContribution) - Math.abs(a.weightedContribution) || byId(a, b));
  const neutral = list.filter((c) => c.weightedContribution === 0).sort(byId);
  const showNeutral = list.length <= n || active.length === 0;
  return [...active, ...(showNeutral ? neutral : [])].slice(0, n);
}

/**
 * Score a COMPLETE set of answers (all 68). Throws ScoringError if answers are missing/invalid.
 * Same output shape the old backend returned (rounded to 2 decimals, top-4 explanation per axis).
 */
export function computeResult(answers: Readonly<Record<number, AnswerValue>>): ResultData {
  const calc = calculateResult(DEFINITION_V1, answers as Record<number, number>);
  const axes: Record<string, number> = {}, metrics: Record<string, number> = {}, explanation: Record<string, Contribution[]> = {};
  const scores = { ...calc.axes, ...calc.metrics };
  for (const [name, def] of Object.entries(DEFINITION_V1.axes)) {   // definition order ⇒ stable output
    if (scores[name] === undefined) continue;
    (def.type === 'metric' ? metrics : axes)[name] = round2(scores[name]);
    explanation[name] = topContributions(calc.contributions[name] ?? []) as Contribution[];
  }
  return {
    testVersion: calc.testVersion, certainty: round2(calc.certainty),
    distanceFromStatusQuo: round2(calc.distanceFromStatusQuo), axes, metrics, explanation,
  };
}
