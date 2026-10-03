import { clampPercent, fa, formatPercent } from '@/lib/format';

function Track({ value, label, compact = false }: { value: number; label: string; compact?: boolean }) {
  const v = clampPercent(value);
  return (
    <div className={compact ? 'px-0.5' : 'px-2'}>
      <div role="img" aria-label={label} className={`relative rounded-full bg-stone-200 ${compact ? 'h-1.5' : 'h-2'}`}>
        <span aria-hidden className={`absolute bg-stone-400 ${compact ? '-top-0.5 h-3 w-px' : '-top-1 h-4 w-px'}`} style={{ insetInlineStart: '50%' }} />
        <span
          data-testid="axis-marker"
          aria-hidden
          className={`absolute rounded-full border-2 border-white bg-teal-800 shadow ring-1 ring-teal-800 ${compact ? '-top-1 h-4 w-4' : '-top-1.5 h-5 w-5'}`}
          style={{ insetInlineStart: `${v}%`, marginInlineStart: compact ? '-8px' : '-10px' }}
        />
      </div>
    </div>
  );
}

export function leanSentence(poleA: string, poleB: string, value: number): string {
  const b = Math.round(clampPercent(value));
  const a = 100 - b;
  if (a === b) return 'شما در نقطهٔ میانی ریاضی این محور قرار دارید.';
  return `شما ${fa(Math.max(a, b))}٪ به «${a > b ? poleA : poleB}» گرایش دارید.`;
}

/** Short caption for the compact cards: the percent is already shown above, so this one carries the pole too. */
export function leanCaption(poleA: string, poleB: string, value: number): string {
  const b = Math.round(clampPercent(value));
  const a = 100 - b;
  if (a === b) return 'در نقطهٔ میانی ریاضی این محور';
  return `${fa(Math.max(a, b))}٪ به «${a > b ? poleA : poleB}» گرایش دارید`;
}

export function BipolarAxis({ poleA, poleB, value, compact = false }: { poleA: string; poleB: string; value: number; compact?: boolean }) {
  const v = clampPercent(value);
  const lean = Math.max(Math.round(v), 100 - Math.round(v));   // share toward the closer pole — the SAME number the sentence below states
  return (
    <div>
      <div className={`flex items-start justify-between gap-3 font-medium ${compact ? 'mb-2 text-xs leading-5' : 'mb-4 text-body'}`}>
        <span className="max-w-[45%]">{poleA}</span>
        <span className="max-w-[45%] text-end">{poleB}</span>
      </div>
      <Track value={v} compact={compact} label={`موقعیت روی محور «${poleA}» تا «${poleB}»: ${fa(Math.round(v))} درصد از مسیر، از «${poleA}» به سمت «${poleB}»`} />
      <div className={`text-center font-bold text-teal-800 ${compact ? 'mt-2 text-xs' : 'mt-4 text-body'}`}>{formatPercent(lean)}</div>
      {compact
        ? <p className="mt-1 text-center text-xs font-medium leading-5 text-stone-700">{leanCaption(poleA, poleB, v)}</p>
        : <p className="mt-2 text-center text-body font-medium text-stone-800">{leanSentence(poleA, poleB, v)}</p>}
    </div>
  );
}

export function MetricBar({ title, value, lowLabel, highLabel, compact = false }: { title: string; value: number; lowLabel: string; highLabel: string; compact?: boolean }) {
  const v = clampPercent(value);
  return (
    <div className={compact ? 'mt-2' : ''}>
      {!compact && <div className="mb-4 flex items-start justify-between gap-4 text-body font-medium"><span>{lowLabel}</span><span className="text-end">{highLabel}</span></div>}
      <div className="flex items-center justify-between gap-3">
        <span className={compact ? 'text-[11px] text-stone-500' : 'text-body'}>{lowLabel}</span>
        <span className={`font-bold text-teal-800 ${compact ? 'text-xs' : 'text-body'}`}>{formatPercent(v)}</span>
        <span className={compact ? 'text-[11px] text-end text-stone-500' : 'text-body'}>{highLabel}</span>
      </div>
      <Track value={v} compact={compact} label={`${title}: ${fa(Math.round(v))} درصد، بین «${lowLabel}» و «${highLabel}»`} />
      {!compact && <p className="mt-4 text-center text-body font-medium text-stone-800">موقعیت شما در این مورد {formatPercent(v)} از مسیر «{lowLabel}» تا «{highLabel}» است.</p>}
    </div>
  );
}
