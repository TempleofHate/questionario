import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { questions, detailQuestions } from '../src/data/questions.js';
import { muscleProfiles } from '../src/data/additional.js';
import { createSession, questionsFor, selectAnswer, confirmAnswer, expireQuestion, nextQuestion, validSession, summary, readSession, writeSession, STORAGE_KEY, DETAIL_STORAGE_KEY, LIMIT_MS } from '../src/engine.js';
import { quiz, review, intro, sidebar } from '../src/views.js';
import { escapeHtml } from '../src/format.js';
const now = 1_800_000_000_000;
const memory = () => { const values = new Map(); return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }; };

test('150 originais intactas e 40 músculos separados, cada um com os quatro aspectos', () => {
  assert.equal(createHash('sha256').update(JSON.stringify(questions)).digest('hex'), '11a66687d4df869be09908f244865a483d656a94203f1c09caa9423bf7888f24');
  assert.equal(detailQuestions.length, 40);
  assert.equal(new Set(muscleProfiles.map(p => p[2])).size, 40);
  for (const q of detailQuestions) {
    for (const label of ['Origem:', 'Inserção:', 'Função:', 'Inervação:']) {
      assert.ok(q.explanation.includes(label));
      assert.ok(q.options.every(option => option.includes(label)));
    }
  }
  for (const muscle of ['Risório', 'Abaixador do septo nasal']) {
    const q = detailQuestions.find(q => q.prompt.startsWith(`${muscle}:`));
    assert.match(q.options[q.answerIndex], /Não informada no PDF/);
  }
  assert.match(intro('muscle-details'), /<dd>40<\/dd>/);
  assert.match(sidebar(null, 'muscle-details'), /40 questões/);
});

test('nova parte tem persistência, correção, expiração, nota e revisão independentes', () => {
  const storage = memory();
  const original = confirmAnswer(selectAnswer(createSession(now), 0), now + 1);
  writeSession(storage, original);
  let s = createSession(now, 'muscle-details'), time = now;
  assert.equal(questionsFor(s), detailQuestions);
  detailQuestions.forEach((q, i) => {
    s = i === 0 ? expireQuestion(s, time += LIMIT_MS) : confirmAnswer(selectAnswer(s, q.answerIndex), ++time);
    assert.ok(quiz(s).includes(escapeHtml(q.explanation)));
    assert.equal(validSession(s), true);
    assert.equal(writeSession(storage, s, DETAIL_STORAGE_KEY), true);
    assert.deepEqual(readSession(storage, DETAIL_STORAGE_KEY).session, s);
    s = nextQuestion(s, time);
  });
  assert.equal(s.screen, 'results');
  assert.equal(summary(s).correct, 39);
  assert.equal(summary(s).grade, 9.75);
  assert.equal((review(s).match(/class="justification"/g) || []).length, 40);
  assert.deepEqual(readSession(storage).session, original);
  storage.setItem(STORAGE_KEY, JSON.stringify(s));
  assert.equal(readSession(storage).session, null);
});

test('sessões antigas de 150 continuam concluídas; banco misto preserva respostas originais', () => {
  const storage = memory();
  let session = createSession(now);
  questions.forEach((q, i) => { session = nextQuestion(confirmAnswer(selectAnswer(session, q.answerIndex), now + i + 1), now + i + 1); });
  for (const screen of ['results', 'review']) {
    const old = { ...session, screen };
    writeSession(storage, old);
    assert.deepEqual(readSession(storage).session, old);
  }
  for (const count of [150, 160, 190]) {
    const answers = [...session.answers, ...Array.from({ length: count - 150 }, (_, i) => ({ id: `q${151 + i}`, choice: 0, timedOut: false, elapsedMs: 1 }))];
    const old = { ...session, screen: count === 190 ? 'results' : 'quiz', index: Math.min(count, 189), answers };
    writeSession(storage, old);
    const restored = readSession(storage).session;
    assert.equal(restored.screen, 'results');
    assert.deepEqual(restored.answers, session.answers);
    assert.equal(summary(restored).correct, 150);
    assert.equal(readSession(storage, DETAIL_STORAGE_KEY).session, null);
    writeSession(storage, { ...old, answers: [...answers.slice(0, -1), { ...answers.at(-1), id: 'wrong' }] });
    assert.equal(readSession(storage).session, null);
  }
});
