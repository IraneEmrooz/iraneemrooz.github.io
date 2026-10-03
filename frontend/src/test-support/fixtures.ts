import type { ResultData, TestDefinition } from '@/lib/types';
import { AXIS_LABELS } from '@/lib/domain/axis-labels';

const COUNTS = [10, 4, 7, 8, 7, 5, 6, 5, 5, 11]; // same section sizes as Test Definition v1.0 (68 total)
export const SECTION_TITLES = ['آزادی، جامعه و شهروندی', 'سکولاریسم', 'دموکراسی و حاکمیت قانون', 'اقتصاد', 'هویت و قومیت', 'مهاجرت', 'سیاست خارجی', 'نظامی', 'حکمرانی', 'گذار سیاسی و شکل حکومت آینده'];

/** Test definition with placeholder texts ("متن گزارهٔ آزمایشی N") so UI tests can tell UI text from question text. */
export function makeTest(): TestDefinition {
  let id = 0;
  return {
    slug: 'iran-political-values', title: 'آزمون', version: '1.0', totalQuestions: 68,
    scale: [
      { value: 2, label: 'خیلی موافقم' }, { value: 1, label: 'موافقم' }, { value: 0, label: 'نظری ندارم' },
      { value: -1, label: 'مخالفم' }, { value: -2, label: 'خیلی مخالفم' },
    ],
    sections: COUNTS.map((n, i) => ({
      number: i + 1, title: SECTION_TITLES[i], questionCount: n,
      questions: Array.from({ length: n }, () => { id++; return { id, text: `متن گزارهٔ آزمایشی ${id}` }; }),
    })),
  };
}

export function makeResult(over: Partial<ResultData> = {}): ResultData {
  const axes: Record<string, number> = {};
  Object.keys(AXIS_LABELS).forEach((n, i) => { axes[n] = (i * 13) % 101; });
  return {
    testVersion: '1.0', certainty: 82.35, distanceFromStatusQuo: 47.1,
    axes, metrics: { democratic_choice: 75, reza_pahlavi_transition_role: 25 },
    explanation: {
      individual_freedom: [{ questionId: 2, response: 2, weight: 1, signedResponse: 2, weightedContribution: 2 }],
      democratic_choice: [{ questionId: 63, response: 1, weight: 1, signedResponse: 1, weightedContribution: 1 }],
    },
    ...over,
  };
}
