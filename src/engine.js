import { craniometriaQuestions, CRANIOMETRIA_VERSION } from './data/craniometria.js';
import { skullTheoryQuestions, SKULL_THEORY_VERSION } from './data/skull-theory.js';
import { questions as muscleQuestions, BANK_VERSION, detailQuestions, DETAIL_VERSION } from './data/questions.js';
import { muscleVisualQuestions, MUSCLE_VISUAL_VERSION } from './data/muscle-visual.js';
import { skullQuestions } from './data/skull.js';
import { containsPoint, validPoint } from './hotspots.js';
export const isVisual = session => ['skull', 'muscle-visual'].includes(session?.mode);
export const questionsFor = session => session?.mode === 'craniometria' ? craniometriaQuestions : session?.mode === 'skull-theory' ? skullTheoryQuestions : session?.mode === 'muscle-details' ? detailQuestions : session?.mode === 'muscle-visual' ? muscleVisualQuestions : session?.mode === 'skull' ? skullQuestions : muscleQuestions;
export const DETAIL_STORAGE_KEY = 'musculos-em-estudo:muscle-details-session';
export const MUSCLE_VISUAL_STORAGE_KEY = 'musculos-em-estudo:muscle-visual-session';
export const SKULL_THEORY_STORAGE_KEY = 'musculos-em-estudo:skull-theory-session';
export const CRANIOMETRIA_STORAGE_KEY = 'musculos-em-estudo:craniometria-session';
const versionFor = mode => mode === 'craniometria' ? CRANIOMETRIA_VERSION : mode === 'skull-theory' ? SKULL_THEORY_VERSION : mode === 'muscle-details' ? DETAIL_VERSION : mode === 'muscle-visual' ? MUSCLE_VISUAL_VERSION : mode === 'skull' ? 'skull-v1' : BANK_VERSION;
export const SKULL_STORAGE_KEY = 'musculos-em-estudo:skull-session';
export const LIMIT_MS = 60_000;
export const STORAGE_KEY = 'musculos-em-estudo:session';
export const clamp = (number, min, max) => Math.min(max, Math.max(min, number));
export const createSession = (now = Date.now(), mode = 'muscles') => ({
  version: versionFor(mode), ...(mode !== 'muscles' ? { mode } : {}), screen: 'quiz', index: 0, answers: [], selected: null,
  questionStartedAt: now, deadline: now + LIMIT_MS, startedAt: now, notice: null,
});
export function remainingSeconds(session, now = Date.now()) {
  if (session.answers[session.index]) return 0;
  return Math.ceil(clamp(session.deadline - now, 0, LIMIT_MS) / 1000);
}
export function selectAnswer(session, choice) {
  if (isVisual(session) || session.screen !== 'quiz' || session.answers[session.index] || !Number.isInteger(choice) || choice < 0 || choice > 3) return session;
  return { ...session, selected: choice };
}
export function confirmAnswer(session, now = Date.now()) {
  if (isVisual(session)) return session;
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
  if (!value || value.version !== versionFor(value.mode) || (value.mode !== undefined && !['muscles', 'skull', 'muscle-visual', 'muscle-details', 'skull-theory', 'craniometria'].includes(value.mode)) || !['quiz', 'results', 'review'].includes(value.screen)) return false;
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
    && (!isVisual(value) || (a.timedOut ? a.point === undefined : validPoint(a.point) && a.choice === (containsPoint(questions[i].hotspots, a.point) ? 0 : 1)))
    && (a.timedOut ? a.choice === null && a.elapsedMs === LIMIT_MS : Number.isInteger(a.choice) && a.choice >= 0 && a.choice <= 3));
}
export function readSession(storage, key = STORAGE_KEY) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return { session: null, warning: '' };
    let value = JSON.parse(raw);
    // O antigo banco misto tinha q001–q190. Só as primeiras 150 mantêm o gabarito.
    // Valide o registro antigo inteiro antes de preservar a parte original.
    if (key === STORAGE_KEY && value?.version === BANK_VERSION && !value.mode
      && value.index >= 150 && value.index < 190 && Array.isArray(value.answers)) {
      const legacyBank = Array.from({ length: 190 }, (_, i) => `q${String(i + 1).padStart(3, '0')}`);
      const lengthOK = value.screen === 'quiz'
        ? [value.index, value.index + 1].includes(value.answers.length)
        : ['results', 'review'].includes(value.screen) && value.index === 189 && value.answers.length === 190;
      const answersOK = value.answers.every((a, i) => a && a.id === legacyBank[i]
        && typeof a.timedOut === 'boolean' && Number.isFinite(a.elapsedMs) && a.elapsedMs >= 0 && a.elapsedMs <= LIMIT_MS
        && (a.timedOut ? a.choice === null && a.elapsedMs === LIMIT_MS : Number.isInteger(a.choice) && a.choice >= 0 && a.choice < 4));
      if (lengthOK && answersOK) value = { ...value, index: 149, answers: value.answers.slice(0, 150), screen: 'results', selected: null, notice: null };
    }
    if (!validSession(value) || key !== (value.mode === 'craniometria' ? CRANIOMETRIA_STORAGE_KEY : value.mode === 'skull-theory' ? SKULL_THEORY_STORAGE_KEY : value.mode === 'muscle-details' ? DETAIL_STORAGE_KEY : value.mode === 'muscle-visual' ? MUSCLE_VISUAL_STORAGE_KEY : value.mode === 'skull' ? SKULL_STORAGE_KEY : STORAGE_KEY)) return { session: null, warning: 'O progresso salvo está inválido ou é de outra versão. Inicie uma nova sessão.' };
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
  if (!isVisual(session) || session.screen !== 'quiz' || session.answers[session.index] || !validPoint(point)) return session;
  if (now >= session.deadline) return expireQuestion(session, now);
  const right = containsPoint(questionsFor(session)[session.index].hotspots, point);
  return record(session, right ? 0 : 1, false, now, { x: point.x, y: point.y });
}
