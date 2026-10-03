import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { QUESTION_TEXTS_V1 as T, SECTIONS_V1 } from './questions-v1';
import { QUESTIONS } from './scoring-v1';

test('questions: 68 texts, ids 1..68 in order, unique, non-empty, trimmed', () => {
  assert.equal(T.length, 68);
  T.forEach((q, i) => { assert.equal(q.id, i + 1); assert.ok(q.text.length > 10); assert.equal(q.text, q.text.trim()); });
  assert.equal(new Set(T.map((q) => q.text)).size, 68);
});
test('questions: sections match scoring definition and declared counts', () => {
  assert.equal(SECTIONS_V1.reduce((s, x) => s + x.count, 0), 68);
  for (const s of SECTIONS_V1) assert.equal(QUESTIONS.filter((q) => q.section === s.number).length, s.count);
});
test('questions: frozen', () => { assert.ok(Object.isFrozen(T) && Object.isFrozen(T[0])); });
test('questions: fingerprint (informational)', () => {
  console.log('SHA256', createHash('sha256').update(T.map((q) => `${q.id}\t${q.text}`).join('\n'), 'utf8').digest('hex'));
});
