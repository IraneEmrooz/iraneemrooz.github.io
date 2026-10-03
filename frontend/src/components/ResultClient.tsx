'use client';
import Link from 'next/link';
import { useMemo, useSyncExternalStore } from 'react';
import { PUBLIC_TEST } from '@/lib/definition/public-test';
import { buildResultViewModel } from '@/lib/domain/result-view';
import { answersFromHash } from '@/lib/result/codec';
import { computeResult } from '@/lib/result/compute';
import { CopyLinkButton } from './CopyLinkButton';
import { DownloadImageButton } from './DownloadImageButton';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';
import { ResultContent } from './ResultContent';
import { btnPrimary } from './ui';

const subscribe = (cb: () => void) => { window.addEventListener('hashchange', cb); return () => window.removeEventListener('hashchange', cb); };
const getHash = (): string | null => window.location.hash;
const getServerHash = (): string | null => null;      // static HTML has no hash ⇒ show "loading" until hydration

export function ResultClient() {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash);
  const result = useMemo(() => {
    if (hash === null) return undefined;
    const answers = answersFromHash(hash);
    if (!answers) return null;
    try { return computeResult(answers); } catch { return null; }
  }, [hash]);

  if (result === undefined) return <LoadingState label="در حال ساخت نتیجه…" />;
  if (result === null) {
    return (
      <ErrorState
        title="نتیجه پیدا نشد"
        message="نشانی نتیجه کامل یا درست نیست. نتیجه فقط از روی نشانی کامل ساخته می‌شود و جای دیگری ذخیره نشده است."
        actions={<Link href="/" className={btnPrimary}>صفحهٔ اصلی</Link>}
      />
    );
  }
  const vm = buildResultViewModel(result);
  const linkActions = (
    <span className="flex flex-wrap items-center gap-3">
      <CopyLinkButton />
      <DownloadImageButton input={{ general: vm.general, future: vm.future, distanceFromStatusQuo: vm.distanceFromStatusQuo }} />
      <Link href="/" className="inline-flex min-h-11 items-center underline">شروع مجدد آزمون</Link>
    </span>
  );
  return <ResultContent result={result} test={PUBLIC_TEST} linkActions={linkActions} />;
}
