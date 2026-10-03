import type { Contribution } from '@/lib/types';
import type { AxisRow } from '@/lib/domain/result-view';
import type { ExplanationContext } from './Explanation';
import { ResultAxisCard } from './ResultAxisCard';

const CATEGORIES: readonly { title: string; tone: string; names: readonly string[] }[] = [
  {
    title: 'حقوق و جامعه',
    tone: 'bg-teal-50/80 border-teal-100',
    names: ['individual_freedom', 'citizen_equality', 'secularism', 'assimilation_vs_pluralism'],
  },
  {
    title: 'حکومت و اقتصاد',
    tone: 'bg-sky-50/80 border-sky-100',
    names: ['democracy', 'rule_of_law', 'decentralization', 'market_vs_state', 'limited_vs_service_state'],
  },
  {
    title: 'هویت و مهاجرت',
    tone: 'bg-violet-50/80 border-violet-100',
    names: ['identity_emphasis', 'immigration'],
  },
  {
    title: 'سیاست خارجی و امنیت',
    tone: 'bg-orange-50/80 border-orange-100',
    names: ['west_engagement', 'regional_role', 'foreign_intervention', 'defense_capability', 'military_political_role', 'governance'],
  },
];

export function ResultCategoryGrid({
  rows,
  explanation,
  ctx,
  lowLabel,
  highLabel,
}: {
  rows: readonly AxisRow[];
  explanation: Readonly<Record<string, Contribution[]>>;
  ctx: ExplanationContext;
  lowLabel: string;
  highLabel: string;
}) {
  const byName = new Map(rows.map((row) => [row.name, row]));
  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      {[CATEGORIES.slice(0, 2), CATEGORIES.slice(2)].map((column, ci) => (
        <div key={ci} className="grid gap-5">
      {column.map((category) => {
        const categoryRows = category.names.flatMap((name) => {
          const row = byName.get(name);
          return row ? [row] : [];
        });
        if (!categoryRows.length) return null;
        return (
          <section key={category.title} className={`overflow-hidden rounded-3xl border ${category.tone}`}>
            <header className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <h3 className="text-lg font-bold text-stone-900">{category.title}</h3>
              <span aria-hidden className="h-1 w-16 rounded-full bg-teal-700/80" />
            </header>
            <div className="divide-y divide-stone-200/70 bg-white/75 px-4">
              {categoryRows.map((row) => (
                <ResultAxisCard
                  key={row.name}
                  row={row}
                  compact
                  contributions={explanation[row.name] ?? []}
                  ctx={ctx}
                  lowLabel={lowLabel}
                  highLabel={highLabel}
                />
              ))}
            </div>
          </section>
        );
      })}
        </div>
      ))}
    </div>
  );
}
