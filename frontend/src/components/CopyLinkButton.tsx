'use client';
import { useState } from 'react';
import { CopyIcon } from './icons';
import { btnSecondary } from './ui';

export function CopyLinkButton() {
  const [msg, setMsg] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(window.location.href); setMsg('نشانی کپی شد.'); }
    catch { setMsg('کپی خودکار ممکن نشد؛ نشانی را از نوار آدرس مرورگر نگه دارید.'); }
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button type="button" onClick={copy} className={`${btnSecondary} gap-2`}><CopyIcon />کپی نشانی نتیجه</button>
      <span role="status" aria-live="polite" className="text-caption text-stone-700">{msg}</span>
    </span>
  );
}
