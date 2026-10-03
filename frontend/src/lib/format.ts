const faNumber = new Intl.NumberFormat('fa-IR');

/** Persian digits. */
export const fa = (n: number): string => faNumber.format(n);
export const formatPercent = (n: number): string => `${fa(Math.round(n))}٪`;
export const clampPercent = (n: number): number => (Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0);
