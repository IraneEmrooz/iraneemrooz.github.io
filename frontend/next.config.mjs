/** @type {import('next').NextConfig} */
// Fully static site: `next build` writes plain files to ./out (no Node server, no API, no database).
//  • Response headers can't be set here with `output: 'export'` — see public/_headers (Netlify / Cloudflare Pages)
//    and vercel.json; the Content-Security-Policy is injected per page by scripts/inject-csp.mjs after the build.
//  • GitHub Pages "project sites" are served from /<repo>: build with NEXT_PUBLIC_BASE_PATH=/<repo>.
//    (A custom domain or <user>.github.io needs no base path.)
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');
const nextConfig = {
  output: 'export',
  trailingSlash: true,          // /privacy/index.html — works on every static host without rewrite rules
  reactStrictMode: true,
  images: { unoptimized: true },
  ...(basePath && { basePath }),
};
export default nextConfig;
