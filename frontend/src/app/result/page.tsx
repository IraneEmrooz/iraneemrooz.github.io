import type { Metadata } from 'next';
import { ResultClient } from '@/components/ResultClient';

// The result is NOT looked up anywhere: it is re-computed in the browser from the answers packed in the URL fragment (#…).
export const metadata: Metadata = { title: 'نتیجهٔ آزمون', robots: { index: false, follow: false }, referrer: 'no-referrer' };

export default function Page() { return <ResultClient />; }
