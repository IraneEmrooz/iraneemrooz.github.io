import { QUESTIONS, TEST_VERSION } from './scoring-v1';
import { QUESTION_TEXTS_V1, SECTIONS_V1 } from './questions-v1';
import type { TestDefinition } from '../types';

export const TEST_SLUG = 'iran-political-values';
export const TEST_TITLE = 'آزمون چندبعدی ارزش‌ها و دیدگاه‌های سیاسی معاصر ایران';
export const SCALE = [
  { value: 2 as const, label: 'خیلی موافقم' }, { value: 1 as const, label: 'موافقم' }, { value: 0 as const, label: 'نظری ندارم' },
  { value: -1 as const, label: 'مخالفم' }, { value: -2 as const, label: 'خیلی مخالفم' },
];

// Guard: scoring definition and texts must describe the same 68 questions (same check the backend had).
if (QUESTION_TEXTS_V1.length !== QUESTIONS.length || QUESTION_TEXTS_V1.some((q, i) => q.id !== QUESTIONS[i].id)) {
  throw new Error('questions-v1 and scoring-v1 are out of sync');
}

/** Texts, sections and scale for the UI. Built once at module load. */
export function buildPublicTest(): TestDefinition {
  return {
    slug: TEST_SLUG, title: TEST_TITLE, version: TEST_VERSION, totalQuestions: QUESTIONS.length,
    scale: SCALE.map((s) => ({ ...s })),
    sections: SECTIONS_V1.map((s) => ({
      number: s.number, title: s.title, questionCount: s.count,
      questions: QUESTION_TEXTS_V1.filter((t) => QUESTIONS[t.id - 1].section === s.number).map((t) => ({ id: t.id, text: t.text })),
    })),
  };
}
export const PUBLIC_TEST: TestDefinition = buildPublicTest();
