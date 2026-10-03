import type { AnswerValue, TestDefinition } from '../types';

export type Answers = Readonly<Record<number, AnswerValue>>;
export interface OrderedQuestion { id: number; section: number }

/** Questions in the exact order the API delivers them (section by section). */
export function flattenQuestions(test: TestDefinition): OrderedQuestion[] {
  return test.sections.flatMap((s) => s.questions.map((q) => ({ id: q.id, section: s.number })));
}

export const percent = (part: number, whole: number): number => (whole <= 0 ? 0 : Math.round((part / whole) * 100));

export interface Progress {
  sectionNumber: number; sectionTitle: string;
  sectionPercent: number; totalPercent: number;
  answeredCount: number; totalCount: number;
}

/** Real progress = confirmed (server-saved) answers. Section progress restarts at 0 in every new section; total never resets. */
export function computeProgress(test: TestDefinition, answers: Answers, sectionNumber: number): Progress {
  const section = test.sections.find((s) => s.number === sectionNumber) ?? test.sections[0];
  const totalCount = test.sections.reduce((n, s) => n + s.questions.length, 0);
  const answeredCount = test.sections.reduce((n, s) => n + s.questions.filter((q) => answers[q.id] !== undefined).length, 0);
  const inSection = section ? section.questions.filter((q) => answers[q.id] !== undefined).length : 0;
  return {
    sectionNumber: section?.number ?? 0, sectionTitle: section?.title ?? '',
    sectionPercent: percent(inSection, section?.questions.length ?? 0),
    totalPercent: percent(answeredCount, totalCount),
    answeredCount, totalCount,
  };
}

/** Index of the first question without a saved answer, or -1 when everything is answered. */
export const firstUnansweredIndex = (order: readonly OrderedQuestion[], answers: Answers): number =>
  order.findIndex((q) => answers[q.id] === undefined);
