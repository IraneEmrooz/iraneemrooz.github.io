import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

// Only pages meant to appear in search. /test and /result are noindex and intentionally left out.
export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/methodology/', '/privacy/'].map((p) => ({ url: `${SITE_URL}${p}` }));
}
