'use client';
import { useState } from 'react';
import type { ResultImageInput } from '@/lib/result-image';
import { DownloadIcon } from './icons';
import { btnSecondary } from './ui';

// The canvas code is a separate file loaded on demand. If that load fails once (flaky network, a page kept open across a new
// release), try again before giving up.
async function loadRenderer() {
  try { return await import('@/lib/result-image'); }
  catch { await new Promise((r) => setTimeout(r, 600)); return await import('@/lib/result-image'); }
}

export function DownloadImageButton({ input }: { input: ResultImageInput }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  async function download() {
    setState('busy');
    try {
      const { renderResultImage } = await loadRenderer();                 // canvas code is only loaded on demand
      const blob = await renderResultImage(input);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'iran-emrooz-result.png';                // no result id in the file name
      if ('download' in HTMLAnchorElement.prototype) { document.body.appendChild(a); a.click(); a.remove(); }
      else window.open(url, '_blank');                                    // old browsers: open the image so it can be saved by long-press
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setState('done');
    } catch { setState('error'); }
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button type="button" onClick={download} disabled={state === 'busy'} aria-busy={state === 'busy'} className={`${btnSecondary} gap-2`}>
        <DownloadIcon />{state === 'busy' ? 'در حال ساخت تصویر…' : 'دانلود تصویر نتیجه'}
      </button>
      <span role="status" aria-live="polite" className="text-caption text-stone-700">
        {state === 'done' && 'تصویر ذخیره شد.'}
        {state === 'error' && 'ساخت تصویر ممکن نشد. صفحه را رفرش کنید و دوباره تلاش کنید؛ اگر نشد، لینک را در Chrome یا Safari باز کنید.'}
      </span>
    </span>
  );
}
