'use client';
import { ErrorState } from '@/components/ErrorState';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState message="مشکلی در نمایش صفحه پیش آمد." onRetry={reset} />;
}
