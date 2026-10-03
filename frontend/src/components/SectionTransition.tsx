import { btnPrimary, btnSecondary, card } from './ui';

export function SectionTransition({ title, onContinue, onBack, canBack }: { title: string; onContinue: () => void; onBack: () => void; canBack: boolean }) {
  return (
    <div className={`${card} text-center`}>
      <p className="text-caption text-stone-600">بخش بعدی</p>
      <h2 className="mt-3 text-title font-bold">{title}</h2>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {canBack && <button type="button" onClick={onBack} className={btnSecondary}>بازگشت</button>}
        <button type="button" onClick={onContinue} className={btnPrimary} autoFocus>ادامه</button>
      </div>
    </div>
  );
}
