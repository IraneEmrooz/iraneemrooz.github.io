import type { ReactNode } from 'react';
import { btnPrimary, t } from './ui';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  actions?: ReactNode;
}

export function ErrorState({ title = 'مشکلی پیش آمد', message, onRetry, retryLabel = 'تلاش دوباره', actions }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-2xl border border-stone-300 bg-white p-6 text-center sm:p-8">
      <h2 className={t.heading}>{title}</h2>
      <p className="mt-3 text-stone-700">{message}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && <button type="button" onClick={onRetry} className={btnPrimary}>{retryLabel}</button>}
        {actions}
      </div>
    </div>
  );
}
