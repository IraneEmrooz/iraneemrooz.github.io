// Shared types. There is no backend any more: everything below is produced in the browser.
export type AnswerValue = -2 | -1 | 0 | 1 | 2;
export const ANSWER_VALUES: readonly AnswerValue[] = [2, 1, 0, -1, -2];

export interface ScaleOption { value: AnswerValue; label: string }
export interface TestQuestion { id: number; text: string }
export interface TestSection { number: number; title: string; questionCount: number; questions: TestQuestion[] }
export interface TestDefinition {
  slug: string; title: string; version: string; totalQuestions: number;
  scale: ScaleOption[]; sections: TestSection[];
}

export interface Contribution {
  questionId: number; response: AnswerValue; weight: number; signedResponse: number; weightedContribution: number;
}
export interface ResultData {
  testVersion: string; certainty: number; distanceFromStatusQuo: number;
  axes: Record<string, number>; metrics: Record<string, number>;
  explanation: Record<string, Contribution[]>;
}
