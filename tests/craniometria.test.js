import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCraniometria } from '../scripts/validate-craniometria.js';
import { craniometriaQuestions as questions, CRANIOMETRIA_PDF_URL } from '../src/data/craniometria.js';
import { createSession, questionsFor, selectAnswer, confirmAnswer, expireQuestion, nextQuestion, summary, validSession, readSession, writeSession, CRANIOMETRIA_STORAGE_KEY, LIMIT_MS } from '../src/engine.js';
import { quiz, intro, sidebar, review } from '../src/views.js';
import { modeNav } from '../src/visual.js';
import { escapeHtml } from '../src/format.js';
const now = 1_800_000_000_000;
test('Craniometria: 40 questões validadas, seção e fonte próprias', async () => {
  assert.equal((await validateCraniometria()).total, 40);
  assert.match(intro('craniometria'), /<dd>40<\/dd>/);
  assert.match(intro('craniometria'), /Craniometria/);
  assert.ok(intro('craniometria').includes(CRANIOMETRIA_PDF_URL));
  assert.match(sidebar(null, 'craniometria'), /40 questões/);
  assert.match(modeNav('craniometria'), /data-mode="craniometria" aria-current="page"/);
});
test('feedback em acerto e erro nas 40 questões, persistência isolada, expiração, nota e revisão', () => {
  const values = new Map();
  const storage = { getItem: k => values.get(k), setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k) };
  const original = createSession(now);
  writeSession(storage, original);
  let session = createSession(now, 'craniometria');
  assert.equal(questionsFor(session), questions);
  let time = now;
  for (const [i,q] of questions.entries()) {
    for (const choice of [q.answerIndex, (q.answerIndex + 1) % 4]) {
      const answered = confirmAnswer(selectAnswer(session, choice), time + 1);
      const html = quiz(answered);
      assert.ok(html.includes(escapeHtml(q.explanation)), q.id);
      assert.ok(html.includes(`${CRANIOMETRIA_PDF_URL}#page=${q.source.page}`));
    }
    session = i === 0 ? expireQuestion(session, time += LIMIT_MS) : confirmAnswer(selectAnswer(session, i === 1 ? (q.answerIndex + 1) % 4 : q.answerIndex), ++time);
    assert.ok(quiz(session).includes(escapeHtml(q.explanation)));
    assert.equal(validSession(session), true);
    assert.equal(writeSession(storage, session, CRANIOMETRIA_STORAGE_KEY), true);
    assert.deepEqual(readSession(storage, CRANIOMETRIA_STORAGE_KEY).session, session);
    session = nextQuestion(session, time);
  }
  assert.equal(session.screen, 'results');
  assert.equal(summary(session).correct, 38);
  assert.equal(summary(session).grade, 9.5);
  assert.equal(summary(session).timedOut, 1);
  assert.equal((review(session).match(/class="justification"/g) || []).length, 40);
  assert.deepEqual(readSession(storage).session, original);
  storage.setItem(CRANIOMETRIA_STORAGE_KEY, JSON.stringify(original));
  assert.equal(readSession(storage, CRANIOMETRIA_STORAGE_KEY).session, null);
});
