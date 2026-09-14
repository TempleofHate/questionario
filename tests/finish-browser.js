// Verificação curta após ajustes finais; o percurso integral está em browser.js.
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { createSession, selectAnswer, confirmAnswer, nextQuestion, STORAGE_KEY } from '../src/engine.js';
import { questions } from '../src/data/questions.js';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1505, height: 1045 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const base = process.env.QUIZ_URL || 'http://127.0.0.1:5173';
const errors = []; page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({path:'.impeccable/review/intro-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'Iniciar quiz'}).click();
  await page.getByRole('radio').nth(0).focus();
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.getByRole('radio').nth(1).isChecked(),true);
  await page.keyboard.press('ArrowUp');
  await page.screenshot({path:'.impeccable/review/desktop.png',fullPage:true});
  await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
  assert.equal(await page.locator('.feedback').count(),1);
  assert.equal(await page.locator('.action-arrow[aria-hidden="true"]').count(),1);
  await page.screenshot({path:'.impeccable/review/feedback-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'Próxima questão'}).click();
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('radio').nth(0).check();
  await page.getByRole('button',{name:'Confirmar resposta'}).click();
  await page.screenshot({path:'.impeccable/review/feedback-mobile.png',fullPage:true});
  // Dados representativos do estado final, usando as mesmas regras do aplicativo.
  let time=Date.now()-15000, s=createSession(time);
  questions.forEach((q,i)=>{time+=50;s=nextQuestion(confirmAnswer(selectAnswer(s,i%2?q.answerIndex:(q.answerIndex+1)%4),time),time);});
  await page.evaluate(({key,s})=>localStorage.setItem(key,JSON.stringify(s)),{key:STORAGE_KEY,s});
  await page.reload();
  await page.getByRole('button',{name:'Revisar respostas'}).click();
  await page.locator('#review-filter').selectOption('timeout');
  assert.match(await page.locator('.empty-state').innerText(),/Nenhuma questão/);
  await page.getByRole('button',{name:'Voltar ao resultado',exact:true}).first().click();
  await page.screenshot({path:'.impeccable/review/results-mobile.png',fullPage:true});
  await page.setViewportSize({width:1505,height:1045});
  await page.screenshot({path:'.impeccable/review/results-desktop.png',fullPage:true});
  // Cores base: contraste de texto e controles; complemento à revisão visual.
  const contrast = await page.evaluate(() => {
    const root=getComputedStyle(document.documentElement);
    const colors=Object.fromEntries(['bg','surface','text','muted','accent','error','error-bg'].map(k=>[k,root.getPropertyValue(`--${k}`).trim()]));
    function lum(hex){const c=hex.replace('#','').match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
    const pairs=[['text','bg'],['muted','bg'],['text','surface'],['accent','surface'],['error','error-bg'],['bg','accent']];
    return pairs.map(([fg,bg])=>({fg,bg,ratio:(Math.max(lum(colors[fg]),lum(colors[bg]))+.05)/(Math.min(lum(colors[fg]),lum(colors[bg]))+.05)}));
  });
  contrast.forEach(c=>assert.ok(c.ratio>=4.5,JSON.stringify(c)));
  // Novo início, modal cancelado e prazo continuam corretos.
  await page.getByRole('button',{name:'Refazer quiz',exact:true}).click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog').isVisible(),false);
  await page.getByRole('button',{name:'Refazer quiz',exact:true}).click();
  await page.getByRole('button',{name:'Apagar e recomeçar'}).click();
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('radio').nth(0).check();
  await page.screenshot({path:'.impeccable/review/mobile.png',fullPage:true});
  await page.evaluate(() => window.scrollTo(0, 350));
  const timer=await page.locator('.question-toolbar').boundingBox();assert.ok(timer.y>=0 && timer.y<100);
  const second=await context.newPage();await second.goto(base);
  await second.getByRole('button',{name:'Confirmar resposta'}).click();
  await page.waitForSelector('.feedback');
  assert.equal(await page.locator('fieldset[disabled]').count(),1);
  assert.deepEqual(errors,[]);
  await writeFile('.impeccable/review/finish-report.json',JSON.stringify({passed:true,keyboard:true,stickyTimer:true,multiTab:true,emptyFilter:true,contrast,errors},null,2));
  console.log('OK: teclado, foco, SVG, filtro vazio, cancelamento, timer fixo, sincronização entre abas e contraste.');
}finally{await browser.close();}
