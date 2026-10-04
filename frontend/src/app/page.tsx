import type { Metadata } from 'next';
import { HomeClient } from '@/components/HomeClient';
import { SITE_NAME, SITE_TITLE, SITE_URL, pageMeta } from '@/lib/site';

const DESCRIPTION = 'آزمون ناشناس در ده بخش برای دیدن موقعیت دیدگاه‌هایتان روی چند محور سیاسی و اجتماعی. پاسخ‌ها فقط در مرورگر شما می‌ماند و برچسب سیاسی کلی داده نمی‌شود.';

export const metadata: Metadata = pageMeta({ description: DESCRIPTION, path: '/' });

// Structured data (schema.org). Plain JSON — not executed, nothing is sent anywhere.
const jsonLd = { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, alternateName: SITE_TITLE, url: `${SITE_URL}/`, inLanguage: 'fa', description: DESCRIPTION };

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <HomeClient />
    </>
  );
}
