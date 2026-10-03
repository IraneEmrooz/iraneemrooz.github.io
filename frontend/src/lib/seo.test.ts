import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import sitemap from '../app/sitemap';
import { pageMeta, SITE_URL } from './site';

const src = (p: string) => readFileSync(resolve(__dirname, p), 'utf8');

describe('SEO guards', () => {
  it('public address is the GitHub Pages user site', () => {
    assert.equal(SITE_URL.startsWith('https://'), true);
    assert.match(SITE_URL, /^https:\/\/iraneemrooz\.github\.io/);
  });
  it('pageMeta builds an absolute canonical + Open Graph image', () => {
    const m = pageMeta({ title: 'حریم خصوصی', description: 'x', path: '/privacy/' });
    assert.equal(m.alternates?.canonical, `${SITE_URL}/privacy/`);
    assert.match(JSON.stringify(m.openGraph), /og-image\.png/);
    assert.match(String(m.description), /x/);
  });
  it('/test and /result stay noindex and out of the sitemap', () => {
    for (const f of ['../app/test/page.tsx', '../app/result/page.tsx']) assert.match(src(f), /index:\s*false/, f);
    const urls = sitemap().map((e) => e.url);
    assert.deepEqual(urls, [`${SITE_URL}/`, `${SITE_URL}/methodology/`, `${SITE_URL}/privacy/`]);
  });
  it('robots does not block /test or /result (noindex needs crawling)', () => {
    assert.doesNotMatch(src('../app/robots.ts'), /disallow/i);
  });
});
