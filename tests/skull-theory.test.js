import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSkullTheory } from '../scripts/validate-skull-theory.js';
import { skullTheoryQuestions as questions } from '../src/data/skull-theory.js';
import { createSession, questionsFor, isVisual, selectAnswer, confirmAnswer, expireQuestion, nextQuestion, validSession, summary, readSession, writeSession, SKULL_THEORY_STORAGE_KEY, STORAGE_KEY, DETAIL_STORAGE_KEY, SKULL_STORAGE_KEY, MUSCLE_VISUAL_STORAGE_KEY, LIMIT_MS } from '../src/engine.js';
import { quiz, review, intro, sidebar } from '../src/views.js';
import { escapeHtml } from '../src/format.js';
import { modeNav } from '../src/visual.js';
const now = 1_800_000_000_000;
test('40 questões tradicionais com fontes locais, alternativas, gabaritos e justificativas únicos', async () => {
  assert.equal((await validateSkullTheory()).total, 40);
  assert.match(intro('skull-theory'), /2 imagens de anotações/);
  assert.match(sidebar(null, 'skull-theory'), /40 questões/);
  assert.match(modeNav('skull-theory'), /data-mode="skull-theory" aria-current="page"/);
  assert.equal(isVisual({ mode: 'skull-theory' }), false);
});
test('acerto, erro, expiração, revisão e persistência de crânio independentes das quatro partes', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const existing = [['muscles', STORAGE_KEY, 150], ['muscle-details', DETAIL_STORAGE_KEY, 40], ['skull', SKULL_STORAGE_KEY, 70], ['muscle-visual', MUSCLE_VISUAL_STORAGE_KEY, 70]];
  for (const [mode, key, count] of existing) {
    const old = createSession(now, mode);
    assert.equal(questionsFor(old).length, count);
    writeSession(storage, old, key);
  }
  const before = new Map(values);
  let s = createSession(now, 'skull-theory'), time = now;
  assert.equal(questionsFor(s), questions);
  for (const [i, q] of questions.entries()) {
    s = i === 2 ? expireQuestion(s, time += LIMIT_MS) : confirmAnswer(selectAnswer(s, i === 1 ? (q.answerIndex + 1) % 4 : q.answerIndex), ++time);
    assert.ok(quiz(s).includes(escapeHtml(q.explanation)));
    assert.match(quiz(s), /Conferir nas anotações/);
    assert.doesNotMatch(quiz(s), /data-hotspot|Conferir no PDF/);
    assert.equal(validSession(s), true);
    writeSession(storage, s, SKULL_THEORY_STORAGE_KEY);
    assert.deepEqual(readSession(storage, SKULL_THEORY_STORAGE_KEY).session, s);
    s = nextQuestion(s, time);
  }
  assert.equal(s.screen, 'results');
  assert.equal(summary(s).correct, 38);
  assert.equal(summary(s).grade, 9.5);
  assert.equal(summary(s).timedOut, 1);
  assert.equal((review(s).match(/class="justification"/g) || []).length, 40);
  assert.equal((review(s, 'wrong').match(/class="justification"/g) || []).length, 2);
  for (const [, key] of existing) assert.equal(values.get(key), before.get(key));
  for (const screen of ['results', 'review']) {
    writeSession(storage, { ...s, screen }, SKULL_THEORY_STORAGE_KEY);
    assert.equal(readSession(storage, SKULL_THEORY_STORAGE_KEY).session.screen, screen);
  }
  storage.setItem(STORAGE_KEY, JSON.stringify(s));
  assert.equal(readSession(storage).session, null);
});
