// ---- Buttons & surfaces ----
export const btnBase =
  'inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2 text-body font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';
export const btnPrimary = `${btnBase} bg-teal-800 text-white hover:bg-teal-900 disabled:hover:bg-teal-800`;
export const btnSecondary = `${btnBase} border border-stone-300 bg-white text-stone-800 hover:bg-stone-100 disabled:hover:bg-white`;
export const card = 'rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm';
export const cardCompact = 'rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm';

// ---- Type scale (sizes/line-heights live in tailwind.config.ts) ----
export const t = {
  display: 'text-display sm:text-display-lg font-bold',
  hero: 'text-title sm:text-title-lg md:whitespace-nowrap font-bold', // one line from md up
  title: 'text-title sm:text-title-lg font-bold',
  heading: 'text-heading font-bold',
  question: 'text-question sm:text-question-lg font-medium',
  bodyLg: 'text-body-lg',
  body: 'text-body',
  caption: 'text-caption',
} as const;

// ---- Spacing rhythm: page sections gap-10 · cards gap-4 · inside a card gap-6 · heading→content mt-4 ----
export const pageStack = 'grid gap-10';
export const cardStack = 'grid gap-4';
