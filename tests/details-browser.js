import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { detailQuestions } from '../src/data/questions.js';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await mkdir('.impeccable/review', { recursive: true });
try {
  await page.goto(process.env.QUIZ_URL || 'http://127.0.0.1:5173');
  await page.getByRole('button', { name: 'Iniciar quiz', exact: true }).click();
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Confirmar resposta' }).click();
  await page.locator('[data-mode="muscle-details"]').click();
  assert.match(await page.locator('#main').innerText(), /40/);
  await page.screenshot({ path: '.impeccable/review/details-intro-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Iniciar quiz', exact: true }).click();
  assert.equal(await page.locator('progress').getAttribute('max'), '40');
  await page.reload();
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: `.impeccable/review/details-question-${width}.png`, fullPage: true });
  }
  for (const [i, q] of detailQuestions.entries()) {
    await page.getByRole('radio').nth(q.answerIndex).check();
    await page.getByRole('button', { name: 'Confirmar resposta' }).click();
    assert.equal(await page.locator('.justification p').innerText(), q.explanation);
    await page.locator('[data-action="next"]').click();
    if (i === 0) {
      await page.locator('[data-mode="muscles"]').click();
      assert.equal(await page.locator('progress').getAttribute('max'), '150');
      assert.equal(await page.locator('.feedback').count(), 1);
      await page.locator('[data-mode="muscle-details"]').click();
      assert.match(await page.locator('.question-toolbar').innerText(), /Questão 2/);
    }
  }
  await page.locator('[data-action="review"]').click();
  assert.equal(await page.locator('.review-item').count(), 40);
  await page.reload();
  assert.equal(await page.locator('.review-item').count(), 40);
  for (const mode of ['skull', 'muscle-visual', 'muscle-details']) {
    await page.locator(`[data-mode="${mode}"]`).click();
    assert.equal(await page.locator(`[data-mode="${mode}"]`).getAttribute('aria-current'), 'page');
  }
  assert.deepEqual(errors, []);
  console.log('OK: 40 questões, revisão, recarga, quatro partes independentes e larguras 1280/390/320.');
} finally { await browser.close(); }
