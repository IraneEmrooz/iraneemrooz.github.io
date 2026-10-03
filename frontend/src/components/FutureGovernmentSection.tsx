import type { Contribution } from '@/lib/types';
import type { ResultRow } from '@/lib/domain/result-view';
import type { ExplanationContext } from './Explanation';
import { t } from './ui';
import { ResultAxisCard } from './ResultAxisCard';
import { AxisIcon } from './AxisIcon';

export function FutureGovernmentSection({ rows, explanation, ctx, lowLabel, highLabel }: {
  rows: readonly ResultRow[];
  explanation: Readonly<Record<string, Contribution[]>>;
  ctx: ExplanationContext; lowLabel: string; highLabel: string;
}) {
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="future-gov-heading" data-testid="future-government" className="overflow-hidden rounded-3xl border border-teal-100 bg-teal-50/60">
      <header className="border-b border-teal-100 bg-teal-50 px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <AxisIcon name="transition_speed" />
          <div>
            <h2 id="future-gov-heading" className={t.heading}>آیندهٔ حکومت</h2>
            <p className="mt-1 text-caption text-stone-600">نگاه شما به ساختار و مسیر گذار</p>
            <p className="mt-2 text-caption text-stone-600">این بخش جدا از محورهای عمومی نمایش داده می‌شود. هر مورد مستقل است و با موارد دیگر، یا با محورهای بالا، در هیچ عدد یا نتیجهٔ کلی ترکیب نشده است.</p>
          </div>
        </div>
      </header>
      <div className="grid divide-y divide-teal-100 bg-white/80 px-4 sm:grid-cols-2 sm:divide-y-0 sm:[&>article:nth-child(odd)]:border-e sm:[&>article:nth-child(odd)]:border-teal-100">
        {rows.map((r) => (
          <ResultAxisCard
            key={r.name}
            row={r}
            compact
            contributions={explanation[r.name] ?? []}
            ctx={ctx}
            lowLabel={lowLabel}
            highLabel={highLabel}
          />
        ))}
      </div>
    </section>
  );
}
