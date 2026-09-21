import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { skullTheoryQuestions as questions, skullNoteSources } from '../src/data/skull-theory.js';
export async function validateSkullTheory() {
  assert.equal(questions.length, 40);
  assert.equal(new Set(questions.map(q => q.id)).size, 40);
  assert.equal(new Set(questions.map(q => q.prompt.normalize('NFD').toLowerCase().replace(/[^a-z0-9]/g, ''))).size, 40);
  assert.equal(new Set(questions.map(q => q.source.evidence)).size, 40);
  assert.equal(new Set(questions.map(q => q.difficulty)).size, 3);
  for (const q of questions) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.options.every(option => typeof option === 'string' && option.trim()));
    assert.ok(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < 4);
    assert.ok(q.explanation.trim().length > 40);
    assert.ok(['Fácil', 'Média', 'Difícil'].includes(q.difficulty));
    assert.ok(skullNoteSources.includes(q.source.url) && q.source.evidence.trim());
    assert.equal(q.type, undefined);
    assert.equal(q.hotspots, undefined);
  }
  for (const path of skullNoteSources) await access(new URL(`..${path}`, import.meta.url));
  return { total: 40, options: 40, answers: 40, explanations: 40, unique: 40, sources: 2 };
}
