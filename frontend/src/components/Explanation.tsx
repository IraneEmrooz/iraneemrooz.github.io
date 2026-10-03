import type { Contribution } from '@/lib/types';

export interface ExplanationContext {
  /** questionId → text (from the built-in test definition); null while unavailable. */
  questionTexts: Readonly<Record<number, string>> | null;
  scaleLabels: Readonly<Record<number, string>>;
}

export type ExplanationTarget =
  | { kind: 'axis'; poleA: string; poleB: string }
  | { kind: 'metric' };

/** «توضیح محاسبهٔ نتیجه»: shows exactly what the scoring returned (≤4 items). No extra inference. */
export function Explanation({ contributions, target, ctx }: { contributions: readonly Contribution[]; target: ExplanationTarget; ctx: ExplanationContext }) {
  if (contributions.length === 0) return null;
  return (
    <details className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-4">
      <summary className="cursor-pointer text-body font-medium">توضیح محاسبهٔ نتیجه</summary>
      <ul className="mt-4 grid gap-4">
        {contributions.slice(0, 4).map((c) => {
          const toward = c.signedResponse === 0
            ? `این پاسخ در محاسبهٔ ${target.kind === 'axis' ? 'این محور' : 'این مورد'} اثری نداشته است.`
            : target.kind === 'axis'
              ? `در محاسبهٔ این محور، این پاسخ به سمت «${c.signedResponse > 0 ? target.poleB : target.poleA}» اثر گذاشته است.`
              : `در محاسبهٔ این مورد، این پاسخ به سمت ${c.signedResponse > 0 ? 'موافقت با گزاره' : 'مخالفت با گزاره'} اثر گذاشته است.`;
          const text = ctx.questionTexts?.[c.questionId];
          return (
            <li key={c.questionId} className="text-caption">
              <p>{text ? `«${text}»` : 'متن این گزاره در حال حاضر در دسترس نیست.'}</p>
              <p className="text-stone-700">پاسخ شما: {ctx.scaleLabels[c.response] ?? '—'}. {toward}</p>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
