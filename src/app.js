import { PDF_URL } from './data/questions.js';
import { createSession, isVisual, SKULL_THEORY_STORAGE_KEY, MUSCLE_VISUAL_STORAGE_KEY, DETAIL_STORAGE_KEY, STORAGE_KEY, SKULL_STORAGE_KEY, questionsFor, answerPoint, readSession, writeSession, selectAnswer, confirmAnswer, nextQuestion, expireQuestion, remainingSeconds } from './engine.js';
import { intro, sidebar, quiz, results, review } from './views.js';
import { modeNav } from './visual.js';
import { clock } from './format.js';

const app = document.querySelector('#app');
const warning = document.querySelector('#storage-warning');
const announcer = document.querySelector('#announcer');
const dialog = document.querySelector('#reset-dialog');
let storage;
try { storage = window.localStorage; } catch { storage = null; }
let mode = location.hash === '#cranio-teorico' ? 'skull-theory' : location.hash === '#musculos-detalhados' ? 'muscle-details' : location.hash === '#musculos-visuais' ? 'muscle-visual' : location.hash === '#cranio' ? 'skull' : 'muscles';
const storageKey = () => mode === 'skull-theory' ? SKULL_THEORY_STORAGE_KEY : mode === 'muscle-details' ? DETAIL_STORAGE_KEY : mode === 'muscle-visual' ? MUSCLE_VISUAL_STORAGE_KEY : mode === 'skull' ? SKULL_STORAGE_KEY : STORAGE_KEY;
const restored = readSession(storage, storageKey());
let session = restored.session;
let reviewFilter = 'all';
let lastAnnounced = '';
let resumeFocus;
if (restored.warning) showWarning(restored.warning);
document.querySelector('#pdf-link').href = PDF_URL;

function showWarning(message) { warning.textContent = message; warning.hidden = false; }
function persist() {
  if (!writeSession(storage, session, storageKey())) showWarning('O navegador não permitiu salvar o progresso. O quiz funciona nesta aba, mas as respostas podem se perder ao fechar ou atualizar.');
}
function announce(message) { announcer.textContent = message; }
function render(focus = true) {
  const content = !session ? intro(mode) : session.screen === 'quiz' ? quiz(session) : session.screen === 'results' ? results(session) : review(session, reviewFilter);
  app.innerHTML = `${sidebar(session, mode)}<main id="main" class="${isVisual({ mode }) ? 'skull-mode' : ''}">${modeNav(mode)}${content}</main>`;
  document.title = session?.screen === 'quiz' ? `Questão ${session.index + 1} de ${questionsFor(session).length} — Músculos em estudo` : 'Músculos em estudo — Quiz de cabeça e pescoço';
  document.querySelector('.site-footer > span').textContent = mode === 'muscle-visual' ? 'Ilustrações anatômicas · AnatomyTOOL · Créditos em cada imagem' : mode === 'skull' ? 'Fotografias anatômicas reais · Wikimedia Commons · CC BY-SA 4.0' : 'Baseado exclusivamente no material de estudo.';
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
    document.querySelector(isVisual(session) ? '.visual-question' : '.feedback')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}
function tick() {
  if (!session || session.screen !== 'quiz' || dialog.open) return;
  const next = expireQuestion(session);
  if (next !== session) {
    const index = session.index;
    transition(next);
    announce(`Tempo esgotado na questão ${index + 1}. Resposta correta: ${questionsFor(session)[index].options[questionsFor(session)[index].answerIndex]}. Leia a justificativa e avance quando estiver pronto.`);
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
  const surface = event.target.closest('[data-hotspot]');
  if (surface && session) {
    const image = surface.previousElementSibling;
    if (!image.complete || !image.naturalWidth) return;
    const rect = surface.getBoundingClientRect();
    transition(answerPoint(session, { x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 }));
    return;
  }
  const button = event.target.closest('[data-action]');
  if (!button) return;
  switch (button.dataset.action) {
    case 'start': transition(createSession(Date.now(), mode)); break;
    case 'mode': switchMode(button.dataset.mode); break;
    case 'zoom': {
      const expanded = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(expanded));
      button.textContent = expanded ? 'Ajustar à tela' : 'Ampliar imagem';
      button.closest('figure').querySelector('.image-plane').classList.toggle('expanded', expanded);
      break;
    }
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
    transition(createSession(Date.now(), mode));
    announce('Progresso anterior apagado. Nova sessão iniciada.');
  } else {
    resumeFocus?.focus();
    tick();
  }
});
window.addEventListener('storage', event => {
  if (event.key !== storageKey()) return;
  const latest = readSession(storage, storageKey());
  if (latest.warning) { showWarning(latest.warning); return; }
  session = latest.session;
  if (dialog.open) dialog.close('cancel');
  render(); tick();
  announce('Progresso atualizado a partir de outra aba.');
});
function switchMode(nextMode) {
  if (!['skull', 'muscles', 'muscle-visual', 'muscle-details', 'skull-theory'].includes(nextMode) || nextMode === mode) return;
  persist();
  mode = nextMode;
  history.replaceState(null, '', mode === 'skull-theory' ? '#cranio-teorico' : mode === 'muscle-details' ? '#musculos-detalhados' : mode === 'muscle-visual' ? '#musculos-visuais' : mode === 'skull' ? '#cranio' : location.pathname + location.search);
  const restoredMode = readSession(storage, storageKey());
  session = restoredMode.session;
  if (restoredMode.warning) showWarning(restoredMode.warning);
  lastAnnounced = ''; render(); tick();
}
window.addEventListener('hashchange', () => switchMode(location.hash === '#cranio-teorico' ? 'skull-theory' : location.hash === '#musculos-detalhados' ? 'muscle-details' : location.hash === '#musculos-visuais' ? 'muscle-visual' : location.hash === '#cranio' ? 'skull' : 'muscles'));
app.addEventListener('keydown', event => {
  const surface = event.target.closest('[data-hotspot]');
  if (!surface) return;
  const point = { x: Number(surface.dataset.x || 50), y: Number(surface.dataset.y || 50) };
  const delta = event.shiftKey ? 0.25 : 2;
  const offsets = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] };
  if (offsets[event.key]) {
    event.preventDefault();
    point.x = Math.max(0, Math.min(100, point.x + offsets[event.key][0]));
    point.y = Math.max(0, Math.min(100, point.y + offsets[event.key][1]));
    surface.dataset.x = point.x; surface.dataset.y = point.y;
    surface.querySelector('.keyboard-cursor').setAttribute('d', `M${point.x - 2},${point.y} h4 M${point.x},${point.y - 2} v4`);
  } else if (['Enter', ' '].includes(event.key)) {
    event.preventDefault();
    const image = surface.previousElementSibling;
    if (image.complete && image.naturalWidth) transition(answerPoint(session, point));
  }
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
window.addEventListener('pageshow', tick);
render(false);
tick();
if (restored.session) announce(`Progresso restaurado. ${restored.session.answers.length} questões concluídas.`);
setInterval(tick, 250);
