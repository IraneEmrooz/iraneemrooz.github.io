// Persian pole labels copied VERBATIM from docs/handoff/TEST_SPEC.md ("۲۳ محور/metric مستقل"). Do not reword.
// Enforced by axis-labels.test.ts, which re-parses TEST_SPEC.md and compares every string.
export interface AxisLabel { poleA: string; poleB: string }

/** Order = definition order in TEST_SPEC.md. */
export const AXIS_LABELS: Readonly<Record<string, AxisLabel>> = {
  individual_freedom: { poleA: 'محدودیت‌های حکومتی', poleB: 'آزادی‌های فردی' },
  citizen_equality: { poleA: 'تبعیض / امتیاز حقوقی', poleB: 'برابری حقوق شهروندان' },
  secularism: { poleA: 'نقش سیاسی/حقوقی دین', poleB: 'حکومت سکولار' },
  democracy: { poleA: 'قدرت غیرانتخابی', poleB: 'حاکمیت مردم' },
  rule_of_law: { poleA: 'قدرت بدون پاسخگویی', poleB: 'محدودیت قدرت و پاسخگویی' },
  market_vs_state: { poleA: 'اقتصاد بازار', poleB: 'مداخله دولت' },
  limited_vs_service_state: { poleA: 'خدمات عمومی محدودتر', poleB: 'خدمات عمومی گسترده‌تر' },
  identity_emphasis: { poleA: 'تأکید بر هویت فروملی', poleB: 'تأکید بر هویت ایرانی' },
  assimilation_vs_pluralism: { poleA: 'یکسان‌سازی', poleB: 'تکثر قومی و زبانی' },
  decentralization: { poleA: 'تمرکز قدرت در مرکز', poleB: 'اختیار بیشتر مدیریت محلی' },
  immigration: { poleA: 'کنترل مهاجرت', poleB: 'گشودگی مهاجرت' },
  west_engagement: { poleA: 'فاصله راهبردی از غرب', poleB: 'تعامل با غرب' },
  regional_role: { poleA: 'نقش منطقه‌ای محدود', poleB: 'نقش منطقه‌ای فعال' },
  foreign_intervention: { poleA: 'کاهش مداخله خارجی', poleB: 'مداخله / حمایت خارجی' },
  defense_capability: { poleA: 'توان دفاعی محدود', poleB: 'توان دفاعی و بازدارندگی' },
  military_political_role: { poleA: 'نظامی غیرسیاسی', poleB: 'نقش سیاسی نظامیان' },
  governance: { poleA: 'کنترل اداری / شفافیت محدود', poleB: 'شفافیت، پاسخگویی و اختیار محلی' },
  transition_speed: { poleA: 'گذار سریع', poleB: 'گذار تدریجی' },
  transition_leadership: { poleA: 'رهبری متمرکز', poleB: 'رهبری جمعی' },
  accountability_vs_reconciliation: { poleA: 'مصالحه / عفو', poleB: 'پاسخگویی / محاکمه' },
  future_government_form: { poleA: 'جمهوری', poleB: 'پادشاهی مشروطه' },
};
