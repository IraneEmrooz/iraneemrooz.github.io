// Runs after `next build` (see package.json "build"). For every exported page it computes the SHA-256 of each inline
// <script> and adds a Content-Security-Policy <meta> that allows exactly those scripts (+ files from the same origin)
// and forbids everything else — including any network request to other sites. Works on every static host
// (GitHub Pages can't send headers, so a <meta> policy is the only option there).
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const OUT = resolve(process.argv[2] ?? 'out');

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (name.endsWith('.html')) yield p;
  }
}

export function buildCsp(html) {
  const hashes = new Set();
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/.test(m[1]) || m[2].trim() === '') continue;           // external files are covered by 'self'
    hashes.add(`'sha256-${createHash('sha256').update(m[2], 'utf8').digest('base64')}'`);
  }
  return [
    `default-src 'none'`,
    `script-src 'self' ${[...hashes].join(' ')}`.trim(),
    `style-src 'self' 'unsafe-inline'`,        // React inline style attributes (axis markers)
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `connect-src 'self'`,                        // same-origin only (Next fetches its own page payloads)
    `manifest-src 'self'`,
    `base-uri 'none'`,
    `form-action 'none'`,
    `object-src 'none'`,
  ].join('; ');
}

export function injectCsp(html) {
  if (/http-equiv=["']Content-Security-Policy["']/i.test(html)) return html;   // idempotent
  const tag = `<meta http-equiv="Content-Security-Policy" content="${buildCsp(html)}"/>`;
  if (!/<head[^>]*>/i.test(html)) throw new Error('no <head> found');
  return html.replace(/<head[^>]*>/i, (h) => `${h}${tag}`);                    // first in <head> so it precedes any script
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('inject-csp.mjs')) {
  let n = 0;
  for (const f of htmlFiles(OUT)) { writeFileSync(f, injectCsp(readFileSync(f, 'utf8'))); n++; }
  if (n === 0) { console.error(`inject-csp: no .html files found in ${OUT}`); process.exit(1); }
  console.log(`inject-csp: policy added to ${n} page(s) in ${OUT}`);
}
