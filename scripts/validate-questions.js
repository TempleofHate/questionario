import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { questions as originalQuestions, detailQuestions, groups as originalGroups, detailGroups } from '../src/data/questions.js';

export const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const stopWords = new Set('essa esse esta este isso isto aquela aquele alternativa resposta correta correto documento material fonte texto tabela pagina descrito descrita conforme segundo porque para pela pelo pelos pelas como entre sobre tambem mais uma suas seus nessa nesse origem insercao funcao acao nervo musculo'.split(' '));
function contentWords(text) {
  return new Set(text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().split(/[^a-z]+/).filter(word => word.length >= 4 && !stopWords.has(word)));
}
export function validateExplanation(explanation, pageText, id = 'questão') {
  assert.ok(typeof explanation === 'string' && explanation.trim().length > 25, `${id}: justificativa vazia ou insuficiente`);
  assert.ok(!/\b(lorem ipsum|todo|preencher|justificativa pendente)\b/i.test(explanation), `${id}: justificativa provisória`);
  const words = contentWords(explanation);
  const sourceWords = contentWords(pageText);
  const shared = [...words].filter(word => sourceWords.has(word));
  assert.ok(shared.length >= 3, `${id}: justificativa genérica ou sem conteúdo específico da página (termos encontrados: ${shared.join(', ')})`);
}
export async function validateQuestions() {
  const questions = [...originalQuestions, ...detailQuestions];
  const groups = [...originalGroups, ...detailGroups];
  assert.equal(originalQuestions.length, 150);
  assert.equal(detailQuestions.length, 40);
  const pages = (await readFile(new URL('../docs/musculos.txt', import.meta.url), 'utf8')).split('\f');
  assert.equal(questions.length, 190, 'O banco deve ter exatamente 190 questões');
  assert.equal(new Set(questions.map(q => q.id)).size, 190, 'IDs duplicados');
  assert.equal(new Set(questions.map(q => normalize(q.prompt))).size, 190, 'Enunciados duplicados');
  assert.equal(new Set(questions.map(q => normalize(q.explanation))).size, 190, 'Justificativas repetidas');
  for (const q of questions) {
    const label = `${q.id}: ${q.prompt}`;
    assert.ok(q.prompt.trim() && q.explanation.trim().length > 25, `${label}: explicação ausente`);
    assert.equal(q.options.length, 4, `${label}: alternativas`);
    assert.equal(new Set(q.options.map(normalize)).size, 4, `${label}: alternativas repetidas`);
    assert.ok(q.options.every(a => typeof a === 'string' && a.trim()), `${label}: alternativa vazia`);
    assert.ok(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < 4, `${label}: gabarito`);
    assert.equal(q.options.filter((_, i) => i === q.answerIndex).length, 1, `${label}: gabarito único`);
    assert.ok(['Fácil', 'Média', 'Difícil'].includes(q.difficulty), `${label}: dificuldade`);
    assert.ok(groups.some(([t]) => t === q.topic), `${label}: assunto`);
    assert.ok(Number.isInteger(q.source.page) && q.source.page >= 1 && q.source.page <= 7, `${label}: página`);
    validateExplanation(q.explanation, pages[q.source.page - 1], q.id);
    assert.ok(normalize(q.source.evidence).length >= 3, `${label}: evidência vazia`);
    assert.ok(normalize(pages[q.source.page - 1]).includes(normalize(q.source.evidence)), `${label}: evidência não encontrada na página ${q.source.page}: ${q.source.evidence}`);
  }
  return {
    total: questions.length,
    withExplanation: questions.filter(q => q.explanation.trim()).length,
    genericExplanations: 0,
    parts: { original: originalQuestions.length, details: detailQuestions.length },
    topics: Object.fromEntries(originalGroups.map(([t, rows]) => [t, rows.length + (detailGroups.find(([topic]) => topic === t)?.[1].length || 0)])),
    difficulty: Object.fromEntries(['Fácil', 'Média', 'Difícil'].map(d => [d, questions.filter(q => q.difficulty === d).length])),
    answerPositions: [0, 1, 2, 3].map(i => questions.filter(q => q.answerIndex === i).length),
    source: '190 referências de página e evidências presentes no texto extraído. Fidelidade semântica conferida editorialmente; a checagem textual não substitui essa revisão.',
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await validateQuestions(), null, 2));
}
