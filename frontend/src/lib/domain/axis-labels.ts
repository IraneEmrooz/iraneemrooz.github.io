import { AXIS_LABELS, type AxisLabel } from './axis-labels.generated';
export { AXIS_LABELS, type AxisLabel };

/** Metric titles: exact wording from TEST_SPEC.md "بخش «آینده حکومت»". Metrics are single-pole and independent. */
export const METRIC_TITLES: Readonly<Record<string, string>> = {
  reza_pahlavi_transition_role: 'نقش رضا پهلوی در گذار',
  democratic_choice: 'فرایند دموکراتیک تعیین شکل حکومت',
};

/**
 * "آینده حکومت" items, in the order TEST_SPEC.md lists them. Rendered in their own section and
 * NEVER combined with anything else.
 */
export const FUTURE_ITEMS: readonly { type: 'axis' | 'metric'; name: string }[] = [
  { type: 'axis', name: 'future_government_form' },
  { type: 'metric', name: 'reza_pahlavi_transition_role' },
  { type: 'metric', name: 'democratic_choice' },
  { type: 'axis', name: 'transition_leadership' },
  { type: 'axis', name: 'transition_speed' },
  { type: 'axis', name: 'accountability_vs_reconciliation' },
];
const FUTURE_AXES: ReadonlySet<string> = new Set(FUTURE_ITEMS.filter((i) => i.type === 'axis').map((i) => i.name));

/** All other bipolar axes, in TEST_SPEC order. No grouping headings (none are defined in the spec). */
export const GENERAL_AXES: readonly string[] = Object.keys(AXIS_LABELS).filter((n) => !FUTURE_AXES.has(n));

/** Neutral, data-only note taken from TEST_SPEC ("در v1.0 فقط A بارگذاری شده"). */
export const AXIS_NOTES: Readonly<Record<string, string>> = {
  identity_emphasis:
    'در نسخهٔ ۱٫۰ آزمون، پرسش‌ها فقط به قطب «تأکید بر هویت ایرانی» اشاره می‌کنند و هیچ پرسشی به قطب دیگر این محور اشاره نمی‌کند.',
  foreign_intervention:
    'در نسخهٔ ۱٫۰ آزمون، پرسش‌ها فقط به قطب «کاهش مداخله خارجی» اشاره می‌کنند و هیچ پرسشی به قطب دیگر این محور اشاره نمی‌کند.',
};

/** Fallback only for the result page when the test definition can't be loaded; text identical to TEST_SPEC "مقیاس پاسخ". */
export const DEFAULT_SCALE_LABELS: Readonly<Record<number, string>> = {
  2: 'خیلی موافقم', 1: 'موافقم', 0: 'نظری ندارم', [-1]: 'مخالفم', [-2]: 'خیلی مخالفم',
};
