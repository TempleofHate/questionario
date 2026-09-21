import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { questions } from '../src/data/questions.js';
import { STORAGE_KEY } from '../src/engine.js';
const baseURL = process.env.QUIZ_URL || 'http://127.0.0.1:5173';
await mkdir('.impeccable/review', { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1505, height: 1045 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const checkpoint = message => console.log(`OK: ${message}`);
async function capture(name) {
  await page.evaluate(() => window.scrollTo(0, 0));
  return page.screenshot({ path: `.impeccable/review/${name}.png`, fullPage: true });
}
const saved = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
async function assertFeedback(index, status) {
  const q = questions[index];
  assert.equal(await page.locator('#feedback-title').innerText(), status);
  assert.equal(await page.locator('.feedback .justification h3').innerText(), 'Justificativa:');
  assert.equal(await page.locator('.feedback .justification p').innerText(), q.explanation);
  assert.equal(await page.locator('.option.correct .option-copy').innerText(), q.options[q.answerIndex]);
  assert.equal(await page.getByRole('radio').evaluateAll(radios => radios.every(r => r.disabled || r.closest('fieldset')?.disabled)), true);
  assert.equal((await saved()).index, index, 'Não avança antes da leitura e do clique');
  assert.equal(await page.getByRole('button', { name: index === 189 ? 'Ver resultado' : 'Próxima questão' }).isVisible(), true);
}
async function noOverflow() {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Sem overflow horizontal');
}
try {
  await page.goto(baseURL);
  await page.evaluate(() => document.fonts.ready);
  await capture('intro-desktop');
  await page.getByRole('button', { name: 'Iniciar quiz' }).click();
  await page.getByRole('radio').nth(questions[0].answerIndex).check();
  assert.equal(await page.locator('.feedback').count(), 0, 'Selecionar não confirma nem avança');
  await capture('desktop');
  for (const [width, height, name] of [[1280,800,'notebook'],[834,1112,'tablet'],[390,844,'mobile'],[320,740,'small-mobile']]) {
    await page.setViewportSize({ width, height }); await noOverflow(); await capture(name);
    const button = page.getByRole('button', { name: 'Confirmar resposta' });
    assert.ok((await button.boundingBox()).height >= 44);
  }
  await page.setViewportSize({ width: 1505, height: 1045 });
  await page.getByRole('button', { name: 'Confirmar resposta' }).click();
  await assertFeedback(0, 'Resposta correta');
  assert.ok((await page.locator('.justification').boundingBox()).y < page.viewportSize().height, 'Justificativa apresentada no viewport');
  assert.equal(await page.locator('fieldset[disabled]').count(), 1);
  assert.match(await page.locator('.feedback').innerText(), /Resposta correta/);
  assert.equal((await saved()).answers.length, 1);
  await capture('feedback-desktop');
  await page.reload();
  await assertFeedback(0, 'Resposta correta');
  assert.equal(await page.locator('fieldset[disabled]').count(), 1);
  await page.getByRole('button', { name: 'Próxima questão' }).click();
  checkpoint('iniciar, selecionar, confirmar, bloquear resposta, restaurar feedback e avançar');
  await page.getByRole('radio').nth((questions[1].answerIndex + 1) % 4).check();
  const before = await saved();
  await page.reload();
  assert.equal((await saved()).deadline, before.deadline);
  assert.equal((await saved()).selected, before.selected);
  assert.equal(await page.locator('input:checked').count(), 1);
  await page.getByRole('button', { name: 'Confirmar resposta' }).click();
  await assertFeedback(1, 'Resposta incorreta');
  assert.equal(await page.locator('.feedback-answers dd').first().innerText(), questions[1].options[before.selected]);
  assert.equal(await page.locator('.option.correct').count(), 1);
  assert.equal(await page.locator('.option.wrong').count(), 1);
  await page.setViewportSize({ width: 390, height: 844 }); await capture('feedback-mobile');
  await page.setViewportSize({ width: 1505, height: 1045 });
  await page.getByRole('button', { name: 'Próxima questão' }).click();
  checkpoint('erro destacado e progresso/seleção/prazo restaurados após recarga');
  console.log('Aguardando o minuto real da questão 3 expirar…');
  await page.waitForFunction(() => document.querySelector('.timer')?.classList.contains('urgent'), null, { timeout: 65000 });
  // Confere a urgência e aguarda o feedback sem manipular relógio ou localStorage.
  assert.ok(Number((await page.locator('#countdown').innerText()).split(':')[1]) <= 10);
  await page.waitForFunction(() => document.querySelector('#feedback-title')?.textContent === 'Tempo esgotado', null, { timeout: 20000 });
  await assertFeedback(2, 'Tempo esgotado');
  assert.equal((await saved()).answers[2].timedOut, true);
  assert.equal((await saved()).answers[2].choice, null);
  assert.equal(await page.locator('input:checked').count(), 0);
  await page.waitForTimeout(1500);
  assert.equal((await saved()).index, 2, 'A explicação permanece aguardando avanço');
  await capture('timeout-desktop');
  await page.setViewportSize({ width: 390, height: 844 }); await noOverflow(); await capture('timeout-mobile');
  await page.reload();
  await assertFeedback(2, 'Tempo esgotado');
  await page.getByRole('button', { name: 'Próxima questão' }).click();
  assert.equal((await saved()).index, 3);
  assert.equal(await page.locator('.feedback').count(), 0);
  await page.setViewportSize({ width: 1505, height: 1045 });
  checkpoint('60s reais, expiração bloqueada com justificativa, recarga e avanço somente por clique');
  for (let i = 3; i < 190; i++) {
    await page.getByRole('radio').nth(i % 2 === 0 ? questions[i].answerIndex : (questions[i].answerIndex + 1) % 4).check();
    await page.getByRole('button', { name: 'Confirmar resposta' }).click();
    await assertFeedback(i, i % 2 === 0 ? 'Resposta correta' : 'Resposta incorreta');
    await page.getByRole('button', { name: i === 189 ? 'Ver resultado' : 'Próxima questão' }).click();
  }
  const completed = await saved();
  assert.equal(completed.answers.length, 190);
  assert.equal(completed.screen, 'results');
  assert.equal(await page.locator('.topic-result').count(), 6);
  assert.equal(completed.answers.filter((a, i) => a.choice === questions[i].answerIndex).length, 94);
  assert.match(await page.locator('.result-summary').innerText(), /49,5%/);
  await capture('results-desktop');
  await page.setViewportSize({ width: 390, height: 844 }); await noOverflow(); await capture('results-mobile');
  await page.getByRole('button', { name: 'Revisar respostas' }).click();
  assert.equal(await page.locator('.review-item').count(), 190);
  assert.deepEqual(await page.locator('.review-item .justification p').allTextContents(), questions.map(q => q.explanation));
  assert.equal(await page.locator('.review-meta strong').filter({ hasText: /^Correta$/ }).count(), 94);
  assert.equal(await page.locator('.review-meta strong').filter({ hasText: /^Incorreta$/ }).count(), 95);
  assert.equal(await page.locator('.review-meta strong').filter({ hasText: /^Tempo esgotado$/ }).count(), 1);
  await page.locator('#review-filter').selectOption('wrong');
  assert.equal(await page.locator('.review-item').count(), 96);
  await page.locator('#review-filter').selectOption('timeout');
  assert.equal(await page.locator('.review-item').count(), 1);
  await capture('review-mobile');
  await page.reload();
  assert.equal((await saved()).screen, 'review');
  await page.getByRole('button', { name: 'Refazer quiz', exact: true }).click();
  await page.getByRole('button', { name: 'Manter meu progresso' }).click();
  assert.equal((await saved()).answers.length, 190);
  await page.getByRole('button', { name: 'Refazer quiz', exact: true }).click();
  await page.getByRole('button', { name: 'Apagar e recomeçar' }).click();
  assert.equal((await saved()).answers.length, 0);
  assert.equal((await saved()).index, 0);
  checkpoint('190 questões percorridas, resultado, revisão, filtros, cancelamento e reinício');
  // Novo contexto: armazenamento bloqueado deve degradar sem impedir o quiz.
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  const other = await blocked.newPage();
  await other.goto(baseURL);
  await other.getByRole('button', { name: 'Iniciar quiz' }).click();
  assert.equal(await other.locator('#storage-warning').isVisible(), true);
  await other.getByRole('radio').nth(0).check();
  await other.getByRole('button', { name: 'Confirmar resposta' }).click();
  assert.equal(await other.locator('.feedback').count(), 1);
  await blocked.close();
  checkpoint('storage bloqueado exibe aviso e permite responder');
  // O PDF é servido pelo mesmo projeto e não depende de conexão externa.
  const response = await context.request.get(new URL(await page.locator('#pdf-link').getAttribute('href'), baseURL).href);
  assert.equal(response.status(), 200);
  assert.match(response.headers()['content-type'], /application\/pdf/);
  assert.deepEqual(errors, []);
  await writeFile('.impeccable/review/browser-report.json', JSON.stringify({ passed: true, questionsAnswered: 190, explanationsInFeedback: 190, explanationsInReview: 190, timeoutRequiresManualAdvance: true, correct: 94, wrongIncludingTimeout: 96, realTimeoutSeconds: 60, viewports: [1505,1280,834,390,320], consoleErrors: errors }, null, 2));
  checkpoint('PDF acessível; nenhum erro de console; nenhum overflow horizontal');
} finally { await browser.close(); }
