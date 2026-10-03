import type { Contribution } from '@/lib/types';
import type { ResultRow } from '@/lib/domain/result-view';
import { AxisIcon } from './AxisIcon';
import { BipolarAxis, MetricBar } from './BipolarAxis';
import { Explanation, type ExplanationContext } from './Explanation';
import { card } from './ui';

export interface ResultAxisCardProps {
  row: ResultRow;
  contributions: readonly Contribution[];
  ctx: ExplanationContext;
  lowLabel: string; highLabel: string;
  compact?: boolean;
}

export function ResultAxisCard({ row, contributions, ctx, lowLabel, highLabel, compact = false }: ResultAxisCardProps) {
  if (compact) {
    return (
      <article className="grid grid-cols-[2rem_1fr] gap-3 py-5" data-axis={row.name}>
        <div className="pt-1">
          <AxisIcon name={row.name} compact />
        </div>
        <div className="min-w-0">
          {row.kind === 'axis' ? (
            <>
              <BipolarAxis poleA={row.poleA} poleB={row.poleB} value={row.value} compact />
              {row.note && <p className="mt-2 text-xs leading-5 text-stone-500">{row.note}</p>}
              <Explanation contributions={contributions} target={{ kind: 'axis', poleA: row.poleA, poleB: row.poleB }} ctx={ctx} />
            </>
          ) : (
            <>
              <h3 className="text-sm font-bold leading-6 text-stone-900">{row.title}</h3>
              <p className="text-xs leading-5 text-stone-500">مورد مستقل و تک‌قطبی؛ محور دوقطبی نیست.</p>
              <MetricBar title={row.title} value={row.value} lowLabel={lowLabel} highLabel={highLabel} compact />
              <Explanation contributions={contributions} target={{ kind: 'metric' }} ctx={ctx} />
            </>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className={`${card} sm:flex sm:items-start sm:gap-5`} data-axis={row.name}>
      <AxisIcon name={row.name} />
      <div className="min-w-0 flex-1">
        {row.kind === 'axis' ? (
          <>
            <BipolarAxis poleA={row.poleA} poleB={row.poleB} value={row.value} />
            {row.note && <p className="mt-4 text-caption text-stone-600">{row.note}</p>}
            <Explanation contributions={contributions} target={{ kind: 'axis', poleA: row.poleA, poleB: row.poleB }} ctx={ctx} />
          </>
        ) : (
          <>
            <h3 className="mb-1 text-body font-bold">{row.title}</h3>
            <p className="mb-6 text-caption text-stone-600">مورد مستقل و تک‌قطبی؛ محور دوقطبی نیست.</p>
            <MetricBar title={row.title} value={row.value} lowLabel={lowLabel} highLabel={highLabel} />
            <Explanation contributions={contributions} target={{ kind: 'metric' }} ctx={ctx} />
          </>
        )}
      </div>
    </article>
  );
}
