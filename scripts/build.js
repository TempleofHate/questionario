import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { validateQuestions } from './validate-questions.js';
const report = await validateQuestions();
// dist é exclusivamente uma saída gerada deste script.
await rm(new URL('../dist', import.meta.url), { recursive: true, force: true });
await mkdir(new URL('../dist', import.meta.url));
for (const entry of ['index.html', 'src', 'assets', 'docs']) {
  await cp(new URL(`../${entry}`, import.meta.url), new URL(`../dist/${entry}`, import.meta.url), { recursive: true });
}
await writeFile(new URL('../dist/validation.json', import.meta.url), JSON.stringify(report, null, 2));
console.log('Build concluído em dist/. Banco validado: 150 questões.');
