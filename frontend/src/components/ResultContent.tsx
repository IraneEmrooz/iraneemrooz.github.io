import type { ReactNode } from 'react';
import type { ResultData, TestDefinition } from '@/lib/types';
import { DEFAULT_SCALE_LABELS } from '@/lib/domain/axis-labels';
import { buildResultViewModel } from '@/lib/domain/result-view';
import { formatPercent } from '@/lib/format';
import { withBase } from '@/lib/paths';
import type { ExplanationContext } from './Explanation';
import { FutureGovernmentSection } from './FutureGovernmentSection';
import { ResultCategoryGrid } from './ResultCategoryGrid';
import { card, pageStack } from './ui';

export interface ResultContentProps {
  result: ResultData;
  test: TestDefinition | null;          // null ⇒ question texts not shown (never invented)
  linkActions?: ReactNode;               // copy-link / new test buttons (client-side pieces)
}

export function ResultContent({ result, test, linkActions }: ResultContentProps) {
  const vm = buildResultViewModel(result);
  const scaleLabels: Record<number, string> = { ...DEFAULT_SCALE_LABELS };
  for (const s of test?.scale ?? []) scaleLabels[s.value] = s.label;
  const questionTexts = test ? Object.fromEntries(test.sections.flatMap((s) => s.questions.map((q) => [q.id, q.text]))) : null;
  const ctx: ExplanationContext = { questionTexts, scaleLabels };
  const low = scaleLabels[-2], high = scaleLabels[2];
  const hasAnyExplanation = Object.values(result.explanation).some((l) => l.length > 0);

  return (
    <div className={pageStack}>
      <header className="text-center">
        <div className="text-sm font-bold tracking-wide text-teal-800">ایران امروز</div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">نتیجهٔ آزمون شما</h1>
        <p className="mt-2 text-body text-stone-600">نگاهی کوتاه به دیدگاه‌های شما</p>
      </header>

      <section aria-labelledby="meta-heading" className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="px-6 pb-7 pt-7 text-center sm:px-10">
          <h2 id="meta-heading" className="text-body font-medium text-stone-600">فاصله از وضع موجود</h2>
          <div className="mt-2 text-6xl font-bold tracking-tight text-teal-800 sm:text-7xl">{formatPercent(result.distanceFromStatusQuo)}</div>
          <div className="mx-auto mt-6 max-w-2xl">
            <div className="h-3 overflow-hidden rounded-full bg-stone-200">
              <div className="h-full rounded-full bg-teal-800" style={{ width: `${Math.max(0, Math.min(100, result.distanceFromStatusQuo))}%` }} />
            </div>
          </div>
          <p className="mt-4 text-caption text-stone-500">یک معیار مستقل از پاسخ‌های شما؛ نه امتیاز سیاسی کلی</p>
        </div>
        <div className="grid border-t border-stone-100 bg-stone-50/80 sm:grid-cols-2">
          <div className="px-6 py-4 sm:border-e sm:border-stone-200">
            <div className="text-caption text-stone-500">قطعیت پاسخ‌ها</div>
            <div className="mt-1 text-heading font-bold text-stone-900">{formatPercent(result.certainty)}</div>
          </div>
          <div className="px-6 py-4">
            <div className="text-caption text-stone-500">معنای درصد هر محور</div>
            <div className="mt-1 text-caption text-stone-700">نشان می‌دهد پاسخ‌های شما در آن محور چقدر به یکی از دو سو گرایش دارد؛ مثلاً «۷۰٪ به تعامل با غرب گرایش دارید». ۵۰٪ فقط نقطهٔ میانی ریاضی است.</div>
          </div>
        </div>
      </section>

      <section className={`${card} bg-stone-100`} data-testid="save-link-note" aria-label="نگه‌داشتن نشانی نتیجه">
        <p className="text-body">
          این نتیجه جای دیگری ذخیره نشده و فقط از روی نشانی همین صفحه ساخته می‌شود. اگر می‌خواهید بعداً دوباره ببینید، نشانی این صفحه را نگه دارید. پاسخ‌های شما به همهٔ گزاره‌ها داخل همین نشانی هست (بخش بعد از «#»، که هیچ‌وقت به سرور فرستاده نمی‌شود)؛ پس هر کسی که نشانی را از شما بگیرد می‌تواند پاسخ‌هایتان را ببیند.
        </p>
        {linkActions && <div className="mt-4">{linkActions}</div>}
      </section>

      <section aria-labelledby="axes-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 id="axes-heading" className="text-heading font-bold">نقشهٔ دیدگاه‌ها</h2>
            <p className="mt-2 text-caption text-stone-600">نگاهی به مواضع شما در مهم‌ترین محورهای سیاسی و اجتماعی</p>
          </div>
        </div>
        <ResultCategoryGrid rows={vm.general} explanation={result.explanation} ctx={ctx} lowLabel={low} highLabel={high} />
      </section>

      <FutureGovernmentSection rows={vm.future} explanation={result.explanation} ctx={ctx} lowLabel={low} highLabel={high} />

      {!hasAnyExplanation && (
        <p className="text-caption text-stone-700" data-testid="no-explanation">
          برای این نتیجه پاسخ اثرگذاری برای نمایش وجود ندارد (مثلاً چون همهٔ پاسخ‌ها «{scaleLabels[0]}» بوده‌اند). جزئیات در صفحهٔ <a className="underline" href={withBase('/privacy/')}>حریم خصوصی</a> آمده است.
        </p>
      )}
      {hasAnyExplanation && (
        <p className="text-caption text-stone-600">
          «توضیح محاسبهٔ نتیجه» فقط نشان می‌دهد کدام پاسخ‌ها در محاسبهٔ هر محور بیشترین اثر را داشته‌اند؛ تحلیل شخصیت یا پیش‌بینی رفتار سیاسی نیست.
          روش محاسبه در صفحهٔ <a className="underline" href={withBase('/methodology/')}>روش‌شناسی</a> توضیح داده شده است.
        </p>
      )}
    </div>
  );
}
