import { questions as muscleQuestions, BANK_VERSION } from './data/questions.js';
import { skullQuestions } from './data/skull.js';
import { containsPoint, validPoint } from './hotspots.js';
export const questionsFor = session => session?.mode === 'skull' ? skullQuestions : muscleQuestions;
export const SKULL_STORAGE_KEY = 'musculos-em-estudo:skull-session';
export const LIMIT_MS = 60_000;
export const STORAGE_KEY = 'musculos-em-estudo:session';
export const clamp = (number, min, max) => Math.min(max, Math.max(min, number));
export const createSession = (now = Date.now(), mode = 'muscles') => ({
  version: mode === 'skull' ? 'skull-v1' : BANK_VERSION, ...(mode === 'skull' ? { mode } : {}), screen: 'quiz', index: 0, answers: [], selected: null,
  questionStartedAt: now, deadline: now + LIMIT_MS, startedAt: now, notice: null,
});
export function remainingSeconds(session, now = Date.now()) {
  if (session.answers[session.index]) return 0;
  return Math.ceil(clamp(session.deadline - now, 0, LIMIT_MS) / 1000);
}
export function selectAnswer(session, choice) {
  if (session.mode === 'skull' || session.screen !== 'quiz' || session.answers[session.index] || !Number.isInteger(choice) || choice < 0 || choice > 3) return session;
  return { ...session, selected: choice };
}
export function confirmAnswer(session, now = Date.now()) {
  if (session.mode === 'skull') return session;
  if (session.screen !== 'quiz' || session.answers[session.index]) return session;
  if (now >= session.deadline) return expireQuestion(session, now);
  if (session.selected === null) return session;
  return record(session, session.selected, false, now);
}
function record(session, choice, timedOut, now, point) {
  const questions = questionsFor(session);
  const answer = { ...(point ? { point } : {}), id: questions[session.index].id, choice, timedOut, elapsedMs: clamp(now - session.questionStartedAt, 0, LIMIT_MS) };
  return { ...session, answers: [...session.answers, answer], notice: null };
}
export function nextQuestion(session, now = Date.now()) {
  const questions = questionsFor(session);
  if (session.screen !== 'quiz' || !session.answers[session.index]) return session;
  if (session.index === questions.length - 1) return { ...session, screen: 'results', selected: null };
  return { ...session, index: session.index + 1, selected: null, questionStartedAt: now, deadline: now + LIMIT_MS, notice: null };
}
export function expireQuestion(session, now = Date.now()) {
  if (session.screen !== 'quiz' || session.answers[session.index] || now < session.deadline) return session;
  // A expiração resolve e bloqueia a questão, mas preserva seu feedback até o avanço manual.
  // A seleção sem confirmação não conta como resposta, mesmo quando coincide com o gabarito.
  return { ...record(session, null, true, session.deadline), selected: null };
}
export function summary(session) {
  const questions = questionsFor(session);
  const byTopic = Object.fromEntries([...new Set(questions.map(q => q.topic))].map(topic => [topic, { total: 0, answered: 0, correct: 0, timedOut: 0 }]));
  questions.forEach(q => byTopic[q.topic].total++);
  let correct = 0, timedOut = 0, totalMs = 0;
  session.answers.forEach((answer, i) => {
    const q = questions[i];
    const right = !answer.timedOut && answer.choice === q.answerIndex;
    correct += Number(right); timedOut += Number(answer.timedOut); totalMs += answer.elapsedMs;
    byTopic[q.topic].answered++; byTopic[q.topic].correct += Number(right); byTopic[q.topic].timedOut += Number(answer.timedOut);
  });
  return { correct, errors: session.answers.length - correct, timedOut, totalMs, percent: correct / questions.length * 100, grade: correct / questions.length * 10, byTopic };
}
export function validSession(value) {
  const questions = questionsFor(value);
  if (!value || value.version !== (value.mode === 'skull' ? 'skull-v1' : BANK_VERSION) || (value.mode !== undefined && !['muscles', 'skull'].includes(value.mode)) || !['quiz', 'results', 'review'].includes(value.screen)) return false;
  if (!Number.isInteger(value.index) || value.index < 0 || value.index >= questions.length) return false;
  if (!Array.isArray(value.answers) || value.answers.length > questions.length) return false;
  if (![value.startedAt, value.questionStartedAt, value.deadline].every(n => Number.isSafeInteger(n) && n > 0)) return false;
  if (value.deadline - value.questionStartedAt !== LIMIT_MS || value.questionStartedAt < value.startedAt) return false;
  if (value.selected !== null && (!Number.isInteger(value.selected) || value.selected < 0 || value.selected > 3)) return false;
  if (value.notice !== null && (!Number.isInteger(value.notice) || value.notice < 0 || value.notice >= value.answers.length || !value.answers[value.notice]?.timedOut)) return false;
  if (value.screen === 'quiz' && ![value.index, value.index + 1].includes(value.answers.length)) return false;
  if (value.screen !== 'quiz' && (value.answers.length !== questions.length || value.index !== questions.length - 1)) return false;
  return value.answers.every((a, i) => a && a.id === questions[i].id && typeof a.timedOut === 'boolean'
    && Number.isFinite(a.elapsedMs) && a.elapsedMs >= 0 && a.elapsedMs <= LIMIT_MS
    && (value.mode !== 'skull' || (a.timedOut ? a.point === undefined : validPoint(a.point) && a.choice === (containsPoint(questions[i].hotspots, a.point) ? 0 : 1)))
    && (a.timedOut ? a.choice === null && a.elapsedMs === LIMIT_MS : Number.isInteger(a.choice) && a.choice >= 0 && a.choice <= 3));
}
export function readSession(storage, key = STORAGE_KEY) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return { session: null, warning: '' };
    const value = JSON.parse(raw);
    if (!validSession(value) || (key === SKULL_STORAGE_KEY) !== (value.mode === 'skull')) return { session: null, warning: 'O progresso salvo está inválido ou é de outra versão. Inicie uma nova sessão.' };
    return { session: value, warning: '' };
  } catch {
    return { session: null, warning: 'Não foi possível ler o progresso local. Você pode iniciar uma sessão; mantenha esta página aberta.' };
  }
}
export function writeSession(storage, session, key = STORAGE_KEY) {
  try {
    if (session) storage.setItem(key, JSON.stringify(session));
    else storage.removeItem(key);
    return true;
  } catch { return false; }
}

export function answerPoint(session, point, now = Date.now()) {
  if (session?.mode !== 'skull' || session.screen !== 'quiz' || session.answers[session.index] || !validPoint(point)) return session;
  if (now >= session.deadline) return expireQuestion(session, now);
  const right = containsPoint(questionsFor(session)[session.index].hotspots, point);
  return record(session, right ? 0 : 1, false, now, { x: point.x, y: point.y });
}
