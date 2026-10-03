import Link from 'next/link';
import { ErrorState } from '@/components/ErrorState';
import { btnPrimary } from '@/components/ui';

export default function NotFound() {
  return <ErrorState title="صفحه پیدا نشد" message="نشانی واردشده وجود ندارد." actions={<Link href="/" className={btnPrimary}>صفحهٔ اصلی</Link>} />;
}
