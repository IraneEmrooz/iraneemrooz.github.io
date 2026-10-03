import Link from 'next/link';
import type { ReactNode } from 'react';
import { CryptoSupport } from './CryptoSupport';

const link = 'inline-flex min-h-11 items-center px-2 text-caption text-stone-700 underline-offset-4 hover:underline';

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-10 focus:rounded focus:bg-white focus:p-3">پرش به محتوا</a>
      <header className="border-b border-stone-200 bg-white">
        <nav aria-label="پیوندهای اصلی" className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <Link href="/" className="brand-wrap inline-flex min-h-11 items-center px-1"><span className="brand-glow font-brand text-title sm:text-title-lg">ایران امروز</span></Link>
          <span className="flex flex-wrap">
            <Link href="/methodology" className={link}>روش‌شناسی</Link>
            <Link href="/privacy" className={link}>حریم خصوصی</Link>
          </span>
        </nav>
      </header>
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      <footer className="border-t border-stone-200 px-4 py-8 text-center text-caption text-stone-600">
        <p>این آزمون یک ابزار توصیفی است و هیچ برچسب یا امتیاز سیاسی کلی‌ای تولید نمی‌کند.</p>
        <section aria-label="تماس با من" className="mt-4">
          <span>تماس با من: </span>
          <a href="mailto:iraneemrooz@proton.me" dir="ltr" className="inline-flex min-h-11 items-center px-1 font-medium text-teal-800 underline underline-offset-4">iraneemrooz@proton.me</a>
        </section>
        <CryptoSupport />
      </footer>
    </div>
  );
}
