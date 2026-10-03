'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { percent } from '@/lib/domain/progress';
import { PUBLIC_TEST } from '@/lib/definition/public-test';
import { createBrowserDraftStore } from '@/lib/storage';
import { HomeView, type HomeStatus } from './HomeView';

export function HomeClient() {
  const router = useRouter();
  const store = useRef(createBrowserDraftStore()).current;
  const [status, setStatus] = useState<HomeStatus>({ kind: 'checking' });

  useEffect(() => {
    const r = store.load();
    if (r.kind === 'ok' && Object.keys(r.draft.answers).length > 0) {
      setStatus({ kind: 'resume', answeredPercent: percent(Object.keys(r.draft.answers).length, PUBLIC_TEST.totalQuestions) });
    } else if (r.kind === 'expired') {
      setStatus({ kind: 'notice', message: 'پاسخ‌های نیمه‌کارهٔ قبلی بیش از ۲۴ ساعت پیش شروع شده بودند و پاک شدند.' });
    } else setStatus({ kind: 'fresh' });
  }, [store]);

  return (
    <HomeView
      status={status}
      onStart={() => { store.clear(); router.push('/test'); }}
      onResume={() => router.push('/test')}
      links={<><Link className="underline" href="/privacy">حریم خصوصی</Link> و <Link className="underline" href="/methodology">روش‌شناسی</Link></>}
    />
  );
}
