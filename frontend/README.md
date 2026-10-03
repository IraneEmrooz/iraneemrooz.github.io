# آزمون ارزش‌ها و دیدگاه‌های سیاسی — ایران امروز (نسخهٔ static)

Next.js (App Router) + TypeScript + Tailwind، فارسی و RTL. **سایت کاملاً static است**: بک‌اند، دیتابیس و API وجود ندارد.
پاسخ‌دادن و امتیازدهی در مرورگر انجام می‌شود و `npm run build` فقط پوشهٔ فایل‌های ثابت `out/` را می‌سازد.

## اجرا
```bash
npm ci
npm run dev          # http://localhost:3000
npm test             # تست‌های unit (امتیازدهی، لینک نتیجه، draft، جریان آزمون، کامپوننت‌ها)
npm run lint && npm run typecheck
npm run build        # next build + افزودن CSP به هر صفحه  → ./out
npm run preview      # سرو ./out روی http://localhost:4173
```
`npm run build:plain` همان build بدون مرحلهٔ CSP است (برای عیب‌یابی).

## Deploy
راهنمای کامل Vercel / GitHub Pages / Netlify / Cloudflare Pages: `../docs/handoff/RUNBOOK.md`.
- Vercel: Root Directory = همین پوشه (`frontend`)، بقیه پیش‌فرض.
- GitHub Pages: workflow آماده در `../.github/workflows/pages.yml` (برای repo پروژه‌ای خودش `NEXT_PUBLIC_BASE_PATH` را می‌گذارد).

## ساختار
- `src/app/` — `/`، `/test`، `/result` (نتیجه از hash نشانی ساخته می‌شود)، `/privacy`، `/methodology`
- `src/lib/definition/` — **تعریف تأییدشدهٔ آزمون v1.0** (۶۸ سؤال، وزن‌ها) و `engine.ts` (تابع خالص امتیازدهی). تغییر بدون اجازهٔ صریح ممنوع است.
- `src/lib/result/` — `compute.ts` (خروجی نتیجه) و `codec.ts` (فشرده‌سازی ۶۸ پاسخ در لینک نتیجه)
- `src/lib/storage.ts` — تنها چیزی که در مرورگر می‌ماند: پیش‌نویس پاسخ‌های ناتمام (۲۴ ساعت)
- `src/lib/flow/test-flow.ts` — state و اکشن‌های آزمون (مستقل از UI)
- `src/lib/domain/` — progress، برچسب محورها (`axis-labels.generated.ts` عیناً از `TEST_SPEC.md`)، view-model نتیجه
- `src/components/` — کامپوننت‌ها؛ `*Client.tsx` فقط اتصال hook/router هستند
- `scripts/inject-csp.mjs` — بعد از build برای هر صفحه یک Content-Security-Policy می‌سازد (hash اسکریپت‌های inline)
- `public/_headers`, `vercel.json` — هدرهای امنیتی ثابت

## تصمیم‌های مهم
- **نتیجه ذخیره نمی‌شود.** لینک نتیجه (`/result/#v1.…`) خودِ ۶۸ پاسخ را فشرده در hash دارد و صفحه هر بار نتیجه را دوباره حساب می‌کند؛ پس نتیجهٔ جعلی (امتیازی که از پاسخ‌های واقعی نیامده) قابل ساخت نیست. hash هرگز به سرور نمی‌رسد. هر کسی لینک را داشته باشد پاسخ‌ها را هم می‌بیند (در صفحهٔ نتیجه و `/privacy` گفته شده).
- **localStorage فقط پیش‌نویس ناتمام** را نگه می‌دارد؛ بعد از دیدن نتیجه، با «شروع دوباره» یا بعد از ۲۴ ساعت از شروع پاک می‌شود.
- هیچ `fetch`/socket در کد وجود ندارد (یک تست این را تضمین می‌کند) و CSP هم `connect-src 'self'` است.
- برچسب قطب‌ها فقط از `TEST_SPEC.md`؛ تست `axis-labels.test.ts` هر رشته را با فایل spec مقایسه می‌کند.
- فونت: Vazir به‌صورت self-host با `next/font/local`.
