import { PDF_URL, questions } from './data/questions.js';
import { createSession, STORAGE_KEY, readSession, writeSession, selectAnswer, confirmAnswer, nextQuestion, expireQuestion, remainingSeconds } from './engine.js';
import { intro, sidebar, quiz, results, review } from './views.js';
import { clock } from './format.js';

const app = document.querySelector('#app');
const warning = document.querySelector('#storage-warning');
const announcer = document.querySelector('#announcer');
const dialog = document.querySelector('#reset-dialog');
let storage;
try { storage = window.localStorage; } catch { storage = null; }
const restored = readSession(storage);
let session = restored.session;
let reviewFilter = 'all';
let lastAnnounced = '';
let resumeFocus;
if (restored.warning) showWarning(restored.warning);
document.querySelector('#pdf-link').href = PDF_URL;

function showWarning(message) { warning.textContent = message; warning.hidden = false; }
function persist() {
  if (!writeSession(storage, session)) showWarning('O navegador não permitiu salvar o progresso. O quiz funciona nesta aba, mas as respostas podem se perder ao fechar ou atualizar.');
}
function announce(message) { announcer.textContent = message; }
function render(focus = true) {
  const content = !session ? intro() : session.screen === 'quiz' ? quiz(session) : session.screen === 'results' ? results(session) : review(session, reviewFilter);
  app.innerHTML = `${sidebar(session)}<main id="main">${content}</main>`;
  document.title = session?.screen === 'quiz' ? `Questão ${session.index + 1} de 150 — Músculos em estudo` : 'Músculos em estudo — Quiz de cabeça e pescoço';
  updateClock();
  if (focus) {
    document.querySelector('#screen-title').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
function transition(next) {
  if (next === session) return;
  const wasAnswered = session?.index === next.index && session?.answers[next.index];
  session = next; persist(); render();
  if (session.screen === 'quiz' && session.answers[session.index] && !wasAnswered) {
    // Leva o leitor ao feedback, inclusive em questões longas no celular.
    document.querySelector('#feedback-title')?.focus({ preventScroll: true });
    document.querySelector('.feedback')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}
function tick() {
  if (!session || session.screen !== 'quiz' || dialog.open) return;
  const next = expireQuestion(session);
  if (next !== session) {
    const index = session.index;
    transition(next);
    announce(`Tempo esgotado na questão ${index + 1}. Resposta correta: ${questions[index].options[questions[index].answerIndex]}. Leia a justificativa e avance quando estiver pronto.`);
  } else updateClock();
}
function updateClock() {
  const element = document.querySelector('#countdown');
  if (!element || !session || session.answers[session.index]) return;
  const seconds = remainingSeconds(session);
  element.textContent = clock(seconds);
  element.parentElement.classList.toggle('urgent', seconds <= 10);
  if (seconds <= 10 && lastAnnounced !== `${session.index}:10`) {
    announce('Atenção: restam dez segundos ou menos para confirmar a resposta.');
    lastAnnounced = `${session.index}:10`;
  }
}
app.addEventListener('change', event => {
  if (event.target.matches('input[name="answer"]')) {
    const next = expireQuestion(session);
    if (next !== session) { transition(next); return; }
    session = selectAnswer(session, Number(event.target.value));
    persist();
    document.querySelectorAll('.option').forEach(label => label.classList.toggle('selected', label.querySelector('input').checked));
    document.querySelector('#confirm').disabled = session.selected === null;
  }
  if (event.target.id === 'review-filter') {
    reviewFilter = event.target.value;
    render(false);
    document.querySelector('#review-filter').focus();
  }
});
app.addEventListener('submit', event => {
  if (event.target.id !== 'answer-form') return;
  event.preventDefault();
  transition(confirmAnswer(session));
});
app.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  switch (button.dataset.action) {
    case 'start': transition(createSession()); break;
    case 'next': transition(nextQuestion(session)); break;
    case 'dismiss': transition({ ...session, notice: null }); break;
    case 'review': reviewFilter = 'all'; transition({ ...session, screen: 'review', notice: null }); break;
    case 'results': transition({ ...session, screen: 'results' }); break;
    case 'reset': resumeFocus = button; dialog.showModal(); break;
  }
});
dialog.addEventListener('close', () => {
  if (dialog.returnValue === 'restart') {
    session = null; persist();
    transition(createSession());
    announce('Progresso anterior apagado. Nova sessão iniciada.');
  } else {
    resumeFocus?.focus();
    tick();
  }
});
window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY) return;
  const latest = readSession(storage);
  if (latest.warning) { showWarning(latest.warning); return; }
  session = latest.session;
  if (dialog.open) dialog.close('cancel');
  render(); tick();
  announce('Progresso atualizado a partir de outra aba.');
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
window.addEventListener('pageshow', tick);
render(false);
tick();
if (restored.session) announce(`Progresso restaurado. ${restored.session.answers.length} questões concluídas.`);
setInterval(tick, 250);
