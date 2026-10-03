import type { ResultData } from '../types';
import { AXIS_LABELS, AXIS_NOTES, FUTURE_ITEMS, GENERAL_AXES, METRIC_TITLES } from './axis-labels';

export interface AxisRow { kind: 'axis'; name: string; poleA: string; poleB: string; value: number; note?: string }
export interface MetricRow { kind: 'metric'; name: string; title: string; value: number }
export type ResultRow = AxisRow | MetricRow;

export interface ResultViewModel {
  general: AxisRow[];
  future: ResultRow[];
  certainty: number;
  distanceFromStatusQuo: number;
}

const axisRow = (name: string, value: number): AxisRow | null => {
  const l = AXIS_LABELS[name];
  return l ? { kind: 'axis', name, poleA: l.poleA, poleB: l.poleB, value, ...(AXIS_NOTES[name] && { note: AXIS_NOTES[name] }) } : null;
};

/** Pure re-arrangement of backend numbers. No computation, no aggregation, no overall score. */
export function buildResultViewModel(r: ResultData): ResultViewModel {
  const general = GENERAL_AXES.flatMap((n) => (typeof r.axes[n] === 'number' ? [axisRow(n, r.axes[n])].filter((x): x is AxisRow => !!x) : []));
  const future: ResultRow[] = [];
  for (const item of FUTURE_ITEMS) {
    if (item.type === 'axis' && typeof r.axes[item.name] === 'number') {
      const row = axisRow(item.name, r.axes[item.name]); if (row) future.push(row);
    } else if (item.type === 'metric' && typeof r.metrics[item.name] === 'number' && METRIC_TITLES[item.name]) {
      future.push({ kind: 'metric', name: item.name, title: METRIC_TITLES[item.name], value: r.metrics[item.name] });
    }
  }
  return { general, future, certainty: r.certainty, distanceFromStatusQuo: r.distanceFromStatusQuo };
}
