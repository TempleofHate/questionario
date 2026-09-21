import test from 'node:test';
import assert from 'node:assert/strict';
import { questions } from '../src/data/questions.js';
import { createSession, selectAnswer, confirmAnswer, nextQuestion, expireQuestion, remainingSeconds, summary, validSession, readSession, writeSession, LIMIT_MS, STORAGE_KEY } from '../src/engine.js';
import { validateQuestions, validateExplanation } from '../scripts/validate-questions.js';
import { quiz, review } from '../src/views.js';
import { escapeHtml } from '../src/format.js';
const now = 1_800_000_000_000;

test('banco: 190 questões únicas, 4 alternativas, gabaritos e evidências no PDF', async () => {
  const report = await validateQuestions();
  assert.equal(report.total, 190);
  assert.equal(report.withExplanation, 190);
  assert.equal(report.genericExplanations, 0);
});
test('uma seleção por vez, confirmação e bloqueio contra alteração ou confirmação dupla', () => {
  let s = createSession(now);
  assert.equal(confirmAnswer(s, now + 1), s);
  s = selectAnswer(s, 0); s = selectAnswer(s, 2);
  assert.equal(s.selected, 2);
  s = confirmAnswer(s, now + 9_000);
  assert.equal(s.answers.length, 1);
  assert.equal(s.answers[0].choice, 2);
  assert.equal(s.answers[0].elapsedMs, 9_000);
  assert.equal(selectAnswer(s, 1), s);
  assert.equal(confirmAnswer(s, now + 10_000), s);
  assert.equal(expireQuestion(s, now + 100_000), s);
  assert.equal(validSession(s), true);
});
test('cronômetro usa prazo absoluto e não reinicia ao serializar e restaurar', () => {
  const s = JSON.parse(JSON.stringify(selectAnswer(createSession(now), 3)));
  assert.equal(remainingSeconds(s, now), 60);
  assert.equal(remainingSeconds(s, now + 50_001), 10);
  assert.equal(s.selected, 3);
  assert.equal(s.deadline, now + LIMIT_MS);
  assert.equal(validSession(s), true);
});
test('resposta no limite exato expira, mesmo que a opção correta esteja selecionada', () => {
  const s = confirmAnswer(selectAnswer(createSession(now), questions[0].answerIndex), now + LIMIT_MS);
  assert.equal(s.index, 0);
  assert.deepEqual(s.answers[0], { id: 'q001', choice: null, timedOut: true, elapsedMs: LIMIT_MS });
  assert.equal(s.notice, null);
  assert.equal(s.selected, null);
  assert.equal(selectAnswer(s, 1), s);
  assert.equal(confirmAnswer(s, now + LIMIT_MS + 1), s);
  assert.equal(summary(s).correct, 0);
  assert.equal(summary(s).errors, 1);
  assert.equal(summary(s).timedOut, 1);
});
test('aba fechada por muito tempo restaura a questão expirada e aguarda avanço manual', () => {
  const later = now + 12 * 60 * 60 * 1_000;
  const s = expireQuestion(createSession(now), later);
  assert.equal(s.answers.length, 1);
  assert.equal(s.index, 0);
  assert.equal(remainingSeconds(s, later), 0);
  assert.equal(expireQuestion(s, later + LIMIT_MS), s);
  assert.equal(validSession(s), true);
  const next = nextQuestion(s, later + 300_000);
  assert.equal(next.index, 1);
  assert.equal(remainingSeconds(next, later + 300_000), 60);
  assert.equal(summary(next).totalMs, LIMIT_MS);
});
test('não avança sem confirmar, e o tempo de leitura do feedback não entra no resultado', () => {
  const original = createSession(now);
  assert.equal(nextQuestion(original, now + 1_000), original);
  const answered = confirmAnswer(selectAnswer(original, 1), now + 10_000);
  const next = nextQuestion(answered, now + 100_000);
  assert.equal(next.index, 1);
  assert.equal(next.selected, null);
  assert.equal(next.deadline, now + 160_000);
  assert.equal(summary(next).totalMs, 10_000);
});
test('percurso completo calcula nota, erros, esgotamento, tempo e desempenho por assunto', () => {
  let s = createSession(now), time = now;
  questions.forEach((q, i) => {
    if (i % 3 === 0) { time += LIMIT_MS; s = nextQuestion(expireQuestion(s, time), time); }
    else {
      time += 1_000;
      s = confirmAnswer(selectAnswer(s, i % 3 === 1 ? q.answerIndex : (q.answerIndex + 1) % 4), time);
      s = nextQuestion(s, time);
    }
    assert.equal(validSession(s), true);
  });
  const stats = summary(s);
  assert.equal(s.screen, 'results'); assert.equal(s.answers.length, 190);
  assert.equal(stats.correct, 63); assert.equal(stats.errors, 127); assert.equal(stats.timedOut, 64);
  assert.equal(stats.totalMs, 64 * LIMIT_MS + 126 * 1_000);
  assert.equal(stats.grade, 63 / 190 * 10);
  assert.equal(Object.values(stats.byTopic).reduce((sum, t) => sum + t.correct, 0), 63);
  assert.equal(validSession({ ...s, screen: 'review' }), true);
});
test('última questão expirada mantém justificativa antes de abrir o resultado', () => {
  let s = createSession(now), time = now;
  for (let i = 0; i < 189; i++) {
    time += 1; s = nextQuestion(confirmAnswer(selectAnswer(s, 0), time), time);
  }
  s = expireQuestion(s, time + LIMIT_MS);
  assert.equal(s.screen, 'quiz'); assert.equal(s.answers.length, 190); assert.equal(s.index, 189);
  assert.ok(quiz(s).includes(escapeHtml(questions[189].explanation)));
  assert.match(quiz(s), /Ver resultado/);
  assert.equal(nextQuestion(s, time + LIMIT_MS + 1).screen, 'results');
});

test('justificativas vazias, genéricas e placeholders são rejeitados', () => {
  const page = 'O temporal retrai a mandíbula pelas fibras posteriores e realiza fechamento leve.';
  for (const value of ['', 'Essa é a resposta correta.', 'Esta é a alternativa correta, conforme descrito no documento fornecido.', 'TODO preencher: temporal retrai a mandíbula pelas fibras posteriores.']) {
    assert.throws(() => validateExplanation(value, page));
  }
  assert.doesNotThrow(() => validateExplanation('O temporal retrai a mandíbula pelas fibras posteriores e realiza fechamento leve.', page));
});

test('as 190 questões exibem sua justificativa em acerto, erro, expiração e revisão', () => {
  let session = createSession(now), time = now;
  questions.forEach((q, i) => {
    for (const outcome of ['correct', 'wrong', 'timeout']) {
      const choice = outcome === 'correct' ? q.answerIndex : (q.answerIndex + 1) % 4;
      const answered = outcome === 'timeout' ? expireQuestion(session, time + LIMIT_MS) : confirmAnswer(selectAnswer(session, choice), time + 1);
      const html = quiz(answered);
      assert.ok(html.includes(escapeHtml(q.explanation)), `${q.id}: ${outcome}`);
      assert.match(html, /Justificativa:/);
      assert.match(html, /fieldset disabled/);
      assert.match(html, /data-action="next"/);
      assert.ok(html.includes(outcome === 'timeout' ? 'Tempo esgotado' : outcome === 'correct' ? 'Resposta correta' : 'Resposta incorreta'));
    }
    time += 1;
    session = nextQuestion(confirmAnswer(selectAnswer(session, q.answerIndex), time), time);
    assert.equal(session.answers.length, i + 1);
  });
  const html = review(session);
  assert.equal((html.match(/class="justification"/g) || []).length, 190);
  questions.forEach(q => assert.ok(html.includes(escapeHtml(q.explanation))));
});

test('progresso de sessão antiga continua compatível; feedback expirado também é restaurável', () => {
  const expired = expireQuestion(createSession(now), now + LIMIT_MS);
  const storage = { getItem: () => JSON.stringify(expired) };
  const restored = readSession(storage).session;
  assert.deepEqual(restored, expired);
  assert.match(quiz(restored), /Tempo esgotado/);
  assert.match(quiz(restored), /Justificativa:/);
  const legacy = { ...nextQuestion(expired, now + LIMIT_MS), notice: 0 };
  assert.equal(validSession(legacy), true);
  assert.ok(quiz(legacy).includes(escapeHtml(questions[0].explanation)));
});
test('persistência tolera JSON inválido, versão antiga e storage bloqueado', () => {
  const store = new Map();
  const storage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) };
  const s = createSession(now);
  assert.equal(writeSession(storage, s), true); assert.deepEqual(readSession(storage).session, s);
  assert.equal(writeSession(storage, null), true); assert.equal(readSession(storage).session, null);
  store.set(STORAGE_KEY, '{bad'); assert.ok(readSession(storage).warning);
  store.set(STORAGE_KEY, JSON.stringify({ ...s, version: 'old' })); assert.ok(readSession(storage).warning);
  const blocked = { getItem() { throw Error(); }, setItem() { throw Error(); }, removeItem() { throw Error(); } };
  assert.ok(readSession(blocked).warning); assert.equal(writeSession(blocked, s), false);
});
test('validação rejeita progresso estruturalmente adulterado', () => {
  const s = createSession(now);
  for (const patch of [{ index: 999 }, { index: 1 }, { selected: 4 }, { screen: 'results' }, { deadline: now }, { notice: 0 }, { answers: [{ id: 'q999', timedOut: false, choice: 0, elapsedMs: 0 }] }]) {
    assert.equal(validSession({ ...s, ...patch }), false);
  }
});

test('acréscimo de exatamente 40 preserva integralmente as 150 questões originais', async () => {
  const { createHash } = await import('node:crypto');
  const originalHash = createHash('sha256').update(JSON.stringify(questions.slice(0, 150))).digest('hex');
  assert.equal(originalHash, '11a66687d4df869be09908f244865a483d656a94203f1c09caa9423bf7888f24');
  assert.equal(questions.slice(150).length, 40);
  assert.deepEqual(questions.slice(150).map(q => q.id), Array.from({ length: 40 }, (_, i) => `q${151 + i}`));
  assert.equal(new Set(questions.slice(150).map(q => q.difficulty)).size, 3);
  assert.equal(new Set(questions.slice(150).map(q => q.topic)).size, 6);
});

test('sessões antigas concluídas retomam em q151 e preservam respostas no localStorage', () => {
  let session = createSession(now);
  for (let i = 0; i < 150; i++) {
    session = confirmAnswer(selectAnswer(session, questions[i].answerIndex), now + i + 1);
    if (i < 149) session = nextQuestion(session, now + i + 1);
  }
  for (const screen of ['quiz', 'results', 'review']) {
    const old = { ...session, screen, selected: null };
    let raw = JSON.stringify(old);
    const storage = { getItem: () => raw, setItem: (_, value) => { raw = value; } };
    const restored = readSession(storage).session;
    assert.ok(restored);
    assert.equal(validSession(restored), true);
    assert.deepEqual(restored.answers, old.answers);
    assert.equal(summary(restored).correct, 150);
    const resumed = screen === 'quiz' ? nextQuestion(restored, now + 151) : restored;
    assert.equal(resumed.index, 150);
    assert.equal(resumed.screen, 'quiz');
    assert.equal(remainingSeconds(resumed, resumed.questionStartedAt), 60);
    assert.equal(writeSession(storage, resumed), true);
    assert.deepEqual(readSession(storage).session, resumed);
  }
});
