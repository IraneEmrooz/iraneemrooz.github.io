import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import { SiteChrome } from '@/components/SiteChrome';
import { SITE_ORIGIN, SITE_TITLE } from '@/lib/site';
import './globals.css';

// Vazir, self-hosted (no external request). Weights: Light 300 · Regular 400 · Medium 500 · Bold 700.
const vazir = localFont({
  src: [
    { path: '../fonts/Vazir-Light.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/Vazir.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Vazir-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/Vazir-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-vazir',
  display: 'swap',
  fallback: ['Tahoma', 'system-ui', 'sans-serif'],
});

// Yekan Boom — brand wordmark only (header). Single weight; never use it for body text.
const yekanBoom = localFont({
  src: [{ path: '../fonts/YekanBoom.woff2', weight: '400', style: 'normal' }],
  variable: '--font-yekan-boom',
  display: 'swap',
  fallback: ['Tahoma', 'system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: SITE_TITLE, template: `%s | ${SITE_TITLE}` },
  description: 'آزمون ناشناس و توصیفی؛ بدون امتیاز یا برچسب سیاسی کلی.',   // pages override this with their own (see lib/site.ts)
  referrer: 'no-referrer',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} ${yekanBoom.variable}`}>
      <body><SiteChrome>{children}</SiteChrome></body>
    </html>
  );
}
