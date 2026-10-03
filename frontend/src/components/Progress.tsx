import { clampPercent, fa, formatPercent } from '@/lib/format';

function Bar({ label, value }: { label: string; value: number }) {
  const v = clampPercent(value);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-caption text-stone-700">
        <span>{label}</span>
        <span aria-hidden>{formatPercent(v)}</span>
      </div>
      <div
        role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}
        aria-valuetext={`${fa(v)} درصد`}
        className="h-2 w-full overflow-hidden rounded-full bg-stone-200"
      >
        <div className="h-full rounded-full bg-teal-700 transition-[width] duration-300" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

/** Two independent percentages. Deliberately no "x of y" and no question numbers anywhere. */
export function Progress({ sectionTitle, sectionPercent, totalPercent }: { sectionTitle?: string; sectionPercent: number; totalPercent: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2" data-testid="progress">
      <Bar label={sectionTitle ? `پیشرفت بخش «${sectionTitle}»` : 'پیشرفت بخش'} value={sectionPercent} />
      <Bar label="پیشرفت کل" value={totalPercent} />
    </div>
  );
}
