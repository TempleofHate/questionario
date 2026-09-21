import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { craniometriaQuestions as questions } from '../src/data/craniometria.js';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.QUIZ_URL || 'http://127.0.0.1:5173');
  await page.locator('[data-action="start"]').click();
  await page.getByRole('radio').first().check();
  await page.locator('#confirm').click();
  await page.locator('[data-mode="craniometria"]').click();
  assert.equal(await page.locator('#screen-title').innerText(), 'Craniometria');
  await page.screenshot({ path: '/tmp/craniometria-desktop.png', fullPage: true });
  await page.locator('[data-action="start"]').click();
  assert.equal(await page.locator('progress').getAttribute('max'), '40');
  await page.reload();
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
  for (const [i, q] of questions.entries()) {
    await page.getByRole('radio').nth(i === 1 ? (q.answerIndex + 1) % 4 : q.answerIndex).check();
    await page.locator('#confirm').click();
    assert.equal(await page.locator('.justification p').innerText(), q.explanation);
    if (i === 0) {
      await page.screenshot({ path: '/tmp/craniometria-mobile.png', fullPage: true });
      await page.locator('[data-mode="muscles"]').click();
      assert.equal(await page.locator('progress').getAttribute('max'), '150');
      assert.equal(await page.locator('.feedback').count(), 1);
      await page.locator('[data-mode="craniometria"]').click();
      assert.equal(await page.locator('.justification p').innerText(), q.explanation);
    }
    await page.locator('[data-action="next"]').click();
  }
  await page.locator('[data-action="review"]').click();
  assert.equal(await page.locator('.review-item').count(), 40);
  await page.reload();
  assert.equal(await page.locator('.review-item').count(), 40);
  await page.locator('#review-filter').selectOption('wrong');
  assert.equal(await page.locator('.review-item').count(), 1);
  for (const mode of ['skull', 'muscle-visual', 'muscle-details', 'skull-theory', 'craniometria']) {
    await page.locator(`[data-mode="${mode}"]`).click();
    assert.equal(await page.locator(`[data-mode="${mode}"]`).getAttribute('aria-current'), 'page');
  }
  assert.deepEqual(errors, []);
  console.log('Craniometria: 40 respostas, acerto/erro, revisão, persistência, modos separados e larguras 1280/390/320 OK.');
} finally { await browser.close(); }
