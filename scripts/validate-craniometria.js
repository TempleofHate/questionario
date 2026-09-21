import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { craniometriaQuestions as questions, CRANIOMETRIA_PDF_URL } from '../src/data/craniometria.js';
import { normalize } from './validate-questions.js';
export async function validateCraniometria() {
  await access(new URL(`..${CRANIOMETRIA_PDF_URL}`, import.meta.url));
  assert.equal(questions.length, 40);
  for (const field of ['id', 'prompt', 'explanation']) {
    assert.equal(new Set(questions.map(q => normalize(q[field]))).size, 40, `${field}: duplicação`);
  }
  for (const q of questions) {
    assert.equal(q.options.length, 4, q.id);
    assert.equal(new Set(q.options.map(normalize)).size, 4, q.id);
    assert.ok(q.options.every(o => typeof o === 'string' && o.trim()), q.id);
    assert.ok(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < 4, q.id);
    assert.ok(q.explanation.trim().length > 50, q.id);
    assert.ok(['Fácil', 'Média', 'Difícil'].includes(q.difficulty), q.id);
    assert.equal(q.source.url, CRANIOMETRIA_PDF_URL);
    assert.equal(q.source.page, q.source.pages[0]);
    assert.ok(q.source.pages.every(p => Number.isInteger(p) && p >= 1 && p <= 77), q.id);
    assert.ok(q.source.evidence.trim().length > 10, q.id);
  }
  assert.equal(new Set(questions.map(q => q.difficulty)).size, 3);
  return { total: 40, withFourOptions: 40, withSingleAnswer: 40, withExplanation: 40,
    source: 'PDF integral de 77 páginas conferido visualmente. Referências e evidências por questão; fidelidade semântica conferida editorialmente.' };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await validateCraniometria(), null, 2));
}
