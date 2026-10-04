import type { Metadata } from 'next';

// One place for the public address and the shared SEO text. Everything is resolved at build time (static export).
//  • <user>.github.io repo  → no base path, address is https://iraneemrooz.github.io
//  • project-site repo      → the workflow sets NEXT_PUBLIC_BASE_PATH=/<repo>; set NEXT_PUBLIC_SITE_URL to the origin if it differs.
const BASE = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iraneemrooz.github.io').replace(/\/+$/, '');
export const SITE_URL = `${SITE_ORIGIN}${BASE}`;
export const SITE_NAME = 'ایران امروز';
export const SITE_TITLE = 'ارزش‌ها و دیدگاه‌های سیاسی ایران امروز';
export const OG_IMAGE = { url: `${SITE_URL}/og-image-v2.png`, width: 1200, height: 630, alt: 'آزمون چندبعدی ارزش‌ها و دیدگاه‌های سیاسی ایران امروز' };

/** Title / description / canonical / Open Graph / Twitter. `path` starts and ends with "/". Pass `canonical: false` for noindex pages
 *  that only need a link preview (e.g. /result, which people share). */
export function pageMeta(o: { title?: string; description: string; path: string; canonical?: boolean }): Metadata {
  const url = `${SITE_URL}${o.path}`;
  const fullTitle = o.title ? `${o.title} | ${SITE_TITLE}` : SITE_TITLE;
  return {
    ...(o.title ? { title: o.title } : {}),
    description: o.description,
    ...(o.canonical === false ? {} : { alternates: { canonical: url } }),
    openGraph: { type: 'website', locale: 'fa_IR', siteName: SITE_NAME, title: fullTitle, description: o.description, url, images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', title: fullTitle, description: o.description, images: [OG_IMAGE.url] },
  };
}
