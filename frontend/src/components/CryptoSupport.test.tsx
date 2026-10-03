import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { SUPPORT_ADDRESSES } from '@/lib/support-addresses';
import { CryptoSupport } from './CryptoSupport';

// Independent copy of the expected strings: if someone edits an address, this test must be edited on purpose.
const EXPECTED: Record<string, string> = {
  gram: 'UQBLFRDMSwLDBBPZH7CrGJ9Z3ZfduyEvrXkdsjQIAGUCJ-or',
  btc: 'bc1qjppn5cs6vrj5gyjfrh999xewmcrt38m4ydmgnt',
  erc20: '0xF6b013319792B2642ef8e957c101D70D727dA509',
  trc20: 'TCh6NRNj3sSbF1FfH8DvkyzbkhYL6VygnW',
};

describe('crypto support footer', () => {
  const html = renderToStaticMarkup(<CryptoSupport />);
  const src = (p: string) => readFileSync(resolve(__dirname, p), 'utf8');

  it('has exactly the four expected addresses, unmodified', () => {
    assert.equal(SUPPORT_ADDRESSES.length, 4);
    for (const it of SUPPORT_ADDRESSES) assert.equal(it.address, EXPECTED[it.id], it.id);
  });
  it('one named copy button per address, and the full address is selectable in the list', () => {
    assert.equal((html.match(/<button type="button"/g) ?? []).length, 4);
    for (const a of Object.values(EXPECTED)) assert.ok(html.includes(a), a);
    assert.match(html, /aria-live="polite"/);
  });
  it('uses logical properties only and no browser storage', () => {
    for (const f of ['CryptoSupport.tsx']) {
      assert.doesNotMatch(src(f), /\b(text-left|text-right|ml-|mr-|pl-|pr-|left-|right-)\d?/, f);
      assert.doesNotMatch(src(f), /localStorage|sessionStorage/, f);
    }
  });
});
