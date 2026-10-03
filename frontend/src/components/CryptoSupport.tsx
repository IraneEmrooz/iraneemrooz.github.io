'use client';
import { useState, type ReactNode } from 'react';
import { SUPPORT_ADDRESSES, type SupportAddress } from '@/lib/support-addresses';

const svgProps = {
  viewBox: '0 0 24 24', width: 24, height: 24, fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
};

// Plain monochrome glyphs (no brand colours: the site palette stays neutral).
const ICONS: Record<SupportAddress['id'], ReactNode> = {
  gram: <svg {...svgProps}><path d="M5 7h14l-7 13z" /><path d="M12 7v13" /></svg>,
  btc: <svg {...svgProps}><circle cx="12" cy="12" r="9.5" /><path d="M9.5 7.5h3.2a2 2 0 0 1 0 4H9.5zM9.5 11.5h3.6a2.2 2.2 0 0 1 0 4.4H9.5zM9.5 7.5v8.4M11 6v1.5M13 6v1.5M11 15.9v1.6M13 15.9v1.6" /></svg>,
  erc20: <svg {...svgProps}><path d="M12 3l6 9-6 3.5L6 12z" /><path d="M6 13.8l6 7.2 6-7.2-6 3.4z" /></svg>,
  trc20: <svg {...svgProps}><path d="M4 5l16 3-8 12z" /><path d="M4 5l8 7.5M20 8l-8 4.5" /></svg>,
};

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* fall through to the legacy path */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}

type Status = { kind: 'ok'; item: SupportAddress } | { kind: 'fail' } | null;

export function CryptoSupport() {
  const [status, setStatus] = useState<Status>(null);
  async function copy(item: SupportAddress) {
    setStatus((await copyText(item.address)) ? { kind: 'ok', item } : { kind: 'fail' });
  }
  return (
    <section aria-label="حمایت مالی" className="mt-6">
      <p>اگر این پروژه برایتان ارزش داشت، می‌توانید با رمزارز حمایتش کنید. روی هر آیکون بزنید تا نشانی کپی شود.</p>
      <ul className="mt-3 flex flex-wrap justify-center gap-2">
        {SUPPORT_ADDRESSES.map((it) => (
          <li key={it.id}>
            <button
              type="button"
              onClick={() => copy(it)}
              aria-label={`کپی نشانی ${it.label} روی ${it.network}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 transition-colors hover:bg-stone-100"
            >
              {ICONS[it.id]}
              <span className="text-start">
                <span className="block font-medium">{it.label}</span>
                <span className="block text-caption text-stone-600">{it.network}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p role="status" aria-live="polite" className="mt-3 min-h-7 text-caption text-stone-700">
        {status?.kind === 'ok' && <>نشانی {status.item.label} ({status.item.network}) کپی شد: <bdi dir="ltr">{short(status.item.address)}</bdi></>}
        {status?.kind === 'fail' && 'کپی خودکار ممکن نشد؛ نشانی را از فهرست زیر انتخاب و کپی کنید.'}
      </p>
      <details className="mx-auto mt-1 max-w-md">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-caption underline underline-offset-4">نمایش کامل نشانی‌ها</summary>
        <dl className="mt-2 grid gap-3 text-start">
          {SUPPORT_ADDRESSES.map((it) => (
            <div key={it.id}>
              <dt className="text-caption font-medium">{it.label} ({it.network})</dt>
              <dd dir="ltr" className="select-all break-all font-mono text-caption text-stone-700">{it.address}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-caption text-stone-600">پیش از ارسال، شبکه را در کیف پول خود با شبکهٔ نوشته‌شده برابر کنید؛ ارسال روی شبکهٔ اشتباه قابل بازگشت نیست.</p>
      </details>
    </section>
  );
}
