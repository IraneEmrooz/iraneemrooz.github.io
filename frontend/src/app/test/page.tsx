import type { Metadata } from 'next';
import { TestClient } from '@/components/TestClient';

export const metadata: Metadata = { title: 'آزمون', robots: { index: false } };
export default function Page() { return <TestClient />; }
