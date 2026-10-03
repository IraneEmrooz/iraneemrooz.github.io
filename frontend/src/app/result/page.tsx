import type { Metadata } from 'next';
import { ResultClient } from '@/components/ResultClient';
import { pageMeta } from '@/lib/site';

// The result is NOT looked up anywhere: it is re-computed in the browser from the answers packed in the URL fragment (#…).
// Link preview (Telegram etc.) shows only this generic text + image. The answers live after the '#', which is never sent to any server.
export const metadata: Metadata = {
  ...pageMeta({ title: 'نتیجهٔ آزمون', description: 'نتیجهٔ یک شرکت‌کننده در آزمون ناشناس ارزش‌ها و دیدگاه‌های سیاسی. شما هم می‌توانید آزمون را بدهید و موقعیت خودتان را ببینید.', path: '/result/', canonical: false }),
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function Page() { return <ResultClient />; }
