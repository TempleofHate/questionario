import { face } from './face.js';
import { mastigacao } from './mastigacao.js';
import { lingua } from './lingua.js';
import { hioide } from './hioide.js';
import { pescoco } from './pescoco.js';
import { relacoes } from './relacoes.js';

export const BANK_VERSION = 'musculos-v1';
export const PDF_URL = '/docs/Músculos Cabeça e Pescoço (2)-1.pdf';
export const groups = [
  ['Face', face], ['Mastigação', mastigacao], ['Língua e palato', lingua],
  ['Hióide e deglutição', hioide], ['Pescoço', pescoco], ['Relações anatômicas', relacoes],
];
// Gabaritos distribuídos de forma determinística; nenhuma aleatoriedade ao restaurar.
export const questions = groups.flatMap(([topic, rows]) => rows.map(row => ({ topic, row })))
  .map(({ topic, row }, index) => {
    const [page, difficulty, evidence, prompt, editorialOptions, explanation] = row;
    const answerIndex = (index * 7 + Math.floor(index / 4)) % 4;
    const options = [...editorialOptions];
    const [correct] = options.splice(0, 1);
    options.splice(answerIndex, 0, correct);
    return Object.freeze({
      id: `q${String(index + 1).padStart(3, '0')}`, topic, difficulty, prompt,
      options: Object.freeze(options), answerIndex, explanation,
      source: Object.freeze({ page, evidence }),
    });
  });
