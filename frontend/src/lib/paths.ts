/** Prefix for plain <a href> links in pure components (GitHub Pages project sites live under /<repo>). Inlined at build time. */
const BASE = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');
export const withBase = (path: string): string => `${BASE}${path}`;
