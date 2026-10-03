import type { AnswerValue, ScaleOption } from '@/lib/types';
import { AnswerOptions } from './AnswerOptions';
import { SectionHeader } from './SectionHeader';
import { btnPrimary, btnSecondary, cardCompact } from './ui';

export interface QuestionCardProps {
  questionId: number;
  sectionTitle: string;
  text: string;
  scale: readonly ScaleOption[];
  value: AnswerValue | null;
  onSelect: (v: AnswerValue) => void;
  onPrev: () => void; canPrev: boolean;
  onNext: () => void; canNext: boolean;
  isLast: boolean;
  onSubmit: () => void; canSubmit: boolean;
  submitError: { message: string } | null;
}

export function QuestionCard(p: QuestionCardProps) {
  return (
    <section className={cardCompact} aria-label={p.sectionTitle}>
      <SectionHeader title={p.sectionTitle} />
      <div className="mt-3">
        <AnswerOptions questionId={p.questionId} legend={p.text} scale={p.scale} value={p.value} onSelect={p.onSelect} />
      </div>
      {p.submitError && <p role="alert" className="mt-4 rounded-lg bg-stone-100 p-4 text-caption">{p.submitError.message}</p>}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-200 pt-4">
        <button type="button" onClick={p.onPrev} disabled={!p.canPrev} className={btnSecondary}>قبلی</button>
        {p.isLast ? (
          <button type="button" onClick={p.onSubmit} disabled={!p.canSubmit} className={btnPrimary}>مشاهدهٔ نتیجه</button>
        ) : (
          <button type="button" onClick={p.onNext} disabled={!p.canNext} className={btnPrimary}>بعدی</button>
        )}
      </div>
    </section>
  );
}
