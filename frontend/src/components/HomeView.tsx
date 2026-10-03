import type { ReactNode } from 'react';
import { LoadingState } from './LoadingState';
import { btnPrimary, btnSecondary, card, pageStack, t } from './ui';

export type HomeStatus =
  | { kind: 'checking' }
  | { kind: 'fresh' }
  | { kind: 'resume'; answeredPercent: number }
  | { kind: 'notice'; message: string };          // previous draft dropped (older than 24 h)

export interface HomeViewProps {
  status: HomeStatus;
  onStart: () => void;
  onResume: () => void;
  links?: ReactNode;
}

export function HomeView({ status, onStart, onResume, links }: HomeViewProps) {
  return (
    <div className={`${pageStack} text-center`}>
      <header>
        <h1 className={t.hero}>آزمون چندبعدی ارزش‌ها و دیدگاه‌های سیاسی ایران امروز</h1>
        <p className={`mx-auto mt-4 max-w-2xl ${t.bodyLg} text-stone-700`}>
          در این آزمون به گزاره‌هایی در ده بخش پاسخ می‌دهید. نتیجه، موقعیت پاسخ‌های شما را روی چند محور جداگانه نشان می‌دهد؛
          هیچ امتیاز یا برچسب سیاسی کلی‌ای به شما نسبت داده نمی‌شود.
        </p>
      </header>

      <section className={card} aria-label="شروع">
        {status.kind === 'checking' && <LoadingState label="در حال بررسی پاسخ‌های قبلی…" />}

        {status.kind === 'resume' && (
          <div>
            <p className="text-body-lg font-medium">یک آزمون ناتمام دارید.</p>
            <p className="mt-2 text-stone-700">پیشرفت کل: {new Intl.NumberFormat('fa-IR').format(status.answeredPercent)}٪</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={onResume} className={btnPrimary}>ادامهٔ آزمون</button>
              <button type="button" onClick={onStart} className={btnSecondary}>شروع دوبارهٔ آزمون</button>
            </div>
            <p className="mt-4 text-caption text-stone-600">«شروع دوباره» پاسخ‌های نیمه‌کارهٔ قبلی را از همین مرورگر پاک می‌کند.</p>
          </div>
        )}

        {(status.kind === 'fresh' || status.kind === 'notice') && (
          <div>
            {status.kind === 'notice' && <p role="status" className="mb-6 rounded-lg bg-stone-100 p-4 text-caption">{status.message}</p>}
            <p className="text-stone-700">
              پاسخ‌های نیمه‌کاره فقط در همین مرورگر روی دستگاه خودتان نگه داشته می‌شوند و تا ۲۴ ساعت می‌توانید ادامه دهید. برای دیدن نتیجه باید به همهٔ گزاره‌ها پاسخ دهید.
            </p>
            <div className="mt-6">
              <button type="button" onClick={onStart} className={btnPrimary}>شروع آزمون</button>
            </div>
          </div>
        )}
      </section>

      <p className="mx-auto max-w-xl text-caption text-stone-600">
        آزمون ناشناس است: حساب کاربری وجود ندارد و هیچ داده‌ای به سرور فرستاده نمی‌شود. جزئیات در صفحهٔ {links}.
      </p>
    </div>
  );
}
