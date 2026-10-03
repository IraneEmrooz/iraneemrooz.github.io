import type { AnswerValue, ScaleOption } from '@/lib/types';
import { t } from './ui';

export interface AnswerOptionsProps {
  questionId: number;
  legend: string;
  scale: readonly ScaleOption[];
  value: AnswerValue | null;
  onSelect: (v: AnswerValue) => void;
  disabled?: boolean;
}

/** Native radio group: arrow keys, Space, form semantics and screen-reader labelling come for free. Scale comes from the API. */
export function AnswerOptions({ questionId, legend, scale, value, onSelect, disabled }: AnswerOptionsProps) {
  const name = `answer-${questionId}`;
  return (
    <fieldset disabled={disabled} className="min-w-0 border-0 p-0">
      <legend className={`mb-4 ${t.question}`}>{legend}</legend>
      <div className="grid gap-2">
        {scale.map((opt) => {
          const checked = value === opt.value;
          return (
            <label key={opt.value} className="block cursor-pointer">
              <input
                type="radio" name={name} value={String(opt.value)} checked={checked}
                onChange={() => onSelect(opt.value)} className="peer sr-only"
              />
              <span
                className={`flex min-h-11 items-center gap-3 rounded-xl border px-4 py-2 transition-colors peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-700 ${
                  checked ? 'border-teal-800 bg-teal-50 font-medium' : 'border-stone-300 bg-white hover:bg-stone-50'
                }`}
              >
                <span aria-hidden className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${checked ? 'border-teal-800' : 'border-stone-400'}`}>
                  {checked && <span className="h-2.5 w-2.5 rounded-full bg-teal-800" />}
                </span>
                <span>{opt.label}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
