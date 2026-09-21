import { groups, detailGroups, PDF_URL } from './data/questions.js';
import { summary, isVisual, remainingSeconds, questionsFor } from './engine.js';
import { escapeHtml as e, decimal, duration, clock } from './format.js';
import { visualImage, visualIntro, muscleVisualIntro } from './visual.js';
const letters = ['A', 'B', 'C', 'D'];
const arrow = '<svg class="action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const source = q => q.type === 'hotspot' ? `<a href="${e(q.source.url)}" target="_blank" rel="noopener">Imagem original no ${e(q.image.provider || 'Wikimedia Commons')}</a> · <a href="${q.credits || "/docs/skull-sources.html"}">Fontes e créditos</a>` : `<a href="${e(PDF_URL)}#page=${q.source.page}" target="_blank" rel="noopener">Conferir no PDF · p. ${q.source.page}<span class="sr-only"> (abre em outra aba)</span></a>`;
export function sidebar(session, mode = 'muscles') {
  const bank = questionsFor(session || { mode });
  const topics = mode === 'muscle-details' ? detailGroups : mode === 'muscle-visual' ? [['Anatomia visual muscular', bank]] : mode === 'skull' ? [['Anatomia visual do crânio', bank]] : groups;
  const stats = session ? summary(session) : null;
  return `<aside class="sidebar" aria-label="Assuntos do quiz"><h2>${session ? 'Sua sessão' : 'Roteiro de estudo'}</h2>
    <ol class="topic-list">${topics.map(([topic, rows]) => {
      const active = session?.screen === 'quiz' && bank[session.index].topic === topic;
      const completed = stats?.byTopic[topic].answered || 0;
      return `<li class="${active ? 'active' : ''}" ${active ? 'aria-current="step"' : ''}><span>${e(topic)}</span><span class="topic-count">${session ? `${completed}/` : ''}${rows.length}</span></li>`;
    }).join('')}</ol><div class="session-notes"><p>${bank.length} questões<br>1 minuto por questão</p>${session ? `<p>${stats.correct} ${stats.correct === 1 ? 'acerto' : 'acertos'} até aqui</p><button class="text-button" data-action="reset">Apagar progresso e recomeçar</button>` : isVisual({ mode }) ? '<p>Imagens anatômicas.<br>Resposta por toque na imagem.</p>' : '<p>Base única: o PDF<br>de cabeça e pescoço.</p>'}</div></aside>`;
}
export function intro(mode = 'muscles') {
  if (mode === 'muscle-visual') return muscleVisualIntro();
  if (mode === 'skull') return visualIntro();
  return `<section class="intro"><h1 id="screen-title" tabindex="-1">${mode === 'muscle-details' ? 'Estude cada músculo.<br>Relacione os quatro aspectos.' : 'Conheça os músculos.<br>Entenda as relações.'}</h1>
    <p class="lead">${mode === 'muscle-details' ? 'Uma questão por músculo do PDF, reunindo origem, inserção, função e inervação. Escolha a associação correta dos quatro aspectos. Quando a fonte não informa a inervação, essa ausência é indicada.' : 'Uma sessão de estudo sobre os músculos da cabeça e do pescoço, do primeiro conceito às relações entre origem, inserção, ação e inervação.'}</p>
    <dl class="intro-facts"><div><dt>Questões</dt><dd>${questionsFor({ mode }).length}</dd></div><div><dt>Por questão</dt><dd>60 segundos</dd></div><div><dt>Fonte</dt><dd>7 páginas de estudo</dd></div></dl>
    <h2>Como funciona</h2><ol class="instructions"><li>Escolha uma das quatro alternativas e confirme.</li><li>Leia a justificativa e avance no seu ritmo.</li><li>Se o minuto terminar, a questão fica como não respondida e conta como erro. Leia o gabarito e a justificativa antes de avançar.</li></ol>
    <p class="muted">Cada parte tem progresso próprio, salvo neste navegador. O cronômetro da questão em andamento continua se você sair ou atualizar a página.</p>
    <div class="actions"><button class="primary" data-action="start">Iniciar quiz ${arrow}</button><a href="${e(PDF_URL)}" target="_blank" rel="noopener">Ler material de estudo<span class="sr-only"> (abre em outra aba)</span></a></div>
    <p class="fineprint">Ao final, veja sua nota, o desempenho por assunto e revise todas as respostas. As questões seguem as informações do material fornecido.</p></section>`;
}
// Compatibilidade com avisos salvos por sessões anteriores ao avanço manual por expiração.
function timeoutNotice(session) {
  if (session.notice === null) return '';
  const q = questionsFor(session)[session.notice];
  return `<section class="timeout-notice" role="status"><div class="notice-heading"><strong>Tempo esgotado na questão ${session.notice + 1}</strong><button data-action="dismiss" class="text-button" aria-label="Fechar aviso de tempo esgotado">Fechar</button></div><p>Registrada como erro. Resposta correta: <strong>${e(q.options[q.answerIndex])}</strong>.</p><p><strong>Justificativa:</strong> ${e(q.explanation)}</p>${source(q)}</section>`;
}
function answerFeedback(q, answer) {
  const right = !answer.timedOut && answer.choice === q.answerIndex;
  const status = answer.timedOut ? 'Tempo esgotado' : right ? 'Resposta correta' : 'Resposta incorreta';
  return `<section class="feedback ${answer.timedOut ? 'timeout' : right ? 'success' : 'error'}" aria-labelledby="feedback-title">
    <h2 id="feedback-title" tabindex="-1">${status}</h2>
    <dl class="feedback-answers"><div><dt>Sua resposta</dt><dd>${answer.timedOut ? 'Não respondida — tempo esgotado' : e(q.options[answer.choice])}</dd></div>
    <div><dt>Resposta correta</dt><dd class="positive">${e(q.options[q.answerIndex])}</dd></div></dl>
    <div class="justification"><h3>Justificativa:</h3><p>${e(q.explanation)}</p></div>
    ${source(q)}</section>`;
}
export function quiz(session) {
  const questions = questionsFor(session);
  const q = questions[session.index], answer = session.answers[session.index];
  const answered = session.answers.length;
  return `${timeoutNotice(session)}<section class="question" aria-labelledby="screen-title">
    <div class="question-toolbar"><span><strong>Questão ${session.index + 1}</strong> de ${questions.length}</span><div class="timer ${answer ? 'stopped' : ''}" role="timer" aria-label="${answer?.timedOut ? 'Tempo esgotado' : answer ? 'Resposta confirmada' : 'Tempo restante'}" aria-live="off"><span class="timer-label">${answer?.timedOut ? 'Tempo esgotado' : answer ? 'Respondida' : 'Tempo restante'}</span><span id="countdown">${answer?.timedOut ? '00:00' : answer ? '—' : clock(remainingSeconds(session))}</span></div></div>
    <progress aria-label="Progresso: questões concluídas" value="${answered}" max="${questions.length}">${answered} de ${questions.length}</progress>
    <div class="question-meta"><span>${e(q.topic)}</span><span>${e(q.difficulty)}</span><span>${answered} ${answered === 1 ? 'concluída' : 'concluídas'}</span></div>
    <h1 id="screen-title" tabindex="-1">${e(q.prompt)}</h1>
    <form id="answer-form">${q.type === 'hotspot' ? visualImage(q, answer) : `<fieldset ${answer ? 'disabled' : ''}><legend class="sr-only">Selecione uma alternativa</legend><div class="options">${q.options.map((option, i) => {
      const selected = (answer ? answer.choice : session.selected) === i;
      const correct = answer && i === q.answerIndex;
      const wrong = answer && selected && !correct;
      return `<label class="option ${selected ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}"><input type="radio" name="answer" value="${i}" ${selected ? 'checked' : ''}><span class="option-letter" aria-hidden="true">${letters[i]}</span><span class="option-copy">${e(option)}</span>${correct || wrong ? `<span class="option-status">${correct ? 'Correta' : 'Sua resposta'}</span>` : ''}</label>`;
    }).join('')}</div></fieldset>`}
    ${answer ? answerFeedback(q, answer) : ''}
    <div class="question-actions"><p>${answer ? 'Leia a justificativa. Avance quando estiver pronto.' : q.type === 'hotspot' ? 'Responda diretamente na fotografia.' : 'Selecione uma alternativa e confirme.'}</p>${answer ? `<button type="button" class="primary" data-action="next">${session.index === questions.length - 1 ? 'Ver resultado' : 'Próxima questão'} ${arrow}</button>` : q.type === 'hotspot' ? '' : `<button type="submit" class="primary" id="confirm" ${session.selected === null ? 'disabled' : ''}>Confirmar resposta</button>`}</div></form></section>`;
}
export function results(session) {
  const questions = questionsFor(session);
  const stats = summary(session);
  return `${timeoutNotice(session)}<section class="results"><h1 id="screen-title" tabindex="-1">Seu estudo, em perspectiva.</h1><p class="lead">Você concluiu as ${questions.length} questões. Use o resultado para orientar a próxima revisão.</p>
    <dl class="result-summary"><div class="grade"><dt>Nota final</dt><dd>${decimal(stats.grade)}<span> / 10</span></dd></div><div><dt>Aproveitamento</dt><dd>${decimal(stats.percent)}%</dd></div><div><dt>Acertos</dt><dd>${stats.correct}<span> / ${questions.length}</span></dd></div></dl>
    <dl class="result-details"><div><dt>Erros, incluindo tempo esgotado</dt><dd>${stats.errors}</dd></div><div><dt>Questões com tempo esgotado</dt><dd>${stats.timedOut}</dd></div><div><dt>Tempo total nas questões</dt><dd>${duration(stats.totalMs)}</dd></div></dl>
    <h2>Desempenho por assunto</h2><div class="topic-results">${Object.entries(stats.byTopic).map(([topic, data]) => `<div class="topic-result"><div><span>${e(topic)}</span><strong>${data.correct} / ${data.total}<span class="muted"> · ${decimal(data.correct / data.total * 100, 0)}%</span></strong></div><progress value="${data.correct}" max="${data.total}" aria-label="Acertos em ${e(topic)}">${data.correct} de ${data.total}</progress></div>`).join('')}</div>
    <div class="actions"><button class="primary" data-action="review">Revisar respostas ${arrow}</button><button class="secondary" data-action="reset">Refazer quiz</button></div><p class="fineprint">Nota = acertos ÷ ${questions.length} × 10. O tempo soma os segundos usados para responder, sem incluir a leitura do feedback.</p></section>`;
}
export function review(session, filter = 'all') {
  const questions = questionsFor(session);
  const rows = questions.map((q, i) => ({ q, i, answer: session.answers[i] })).filter(({ q, answer }) => filter === 'all' || (filter === 'wrong' && (answer.timedOut || answer.choice !== q.answerIndex)) || (filter === 'timeout' && answer.timedOut));
  return `<section class="review"><div class="review-top"><h1 id="screen-title" tabindex="-1">Revisar respostas</h1><button class="text-button" data-action="results">Voltar ao resultado</button></div><p class="lead">Releia as explicações e consulte o trecho correspondente no material.</p><div class="review-controls"><label for="review-filter">Mostrar</label><select id="review-filter"><option value="all" ${filter === 'all' ? 'selected' : ''}>Todas as respostas</option><option value="wrong" ${filter === 'wrong' ? 'selected' : ''}>Somente erros</option><option value="timeout" ${filter === 'timeout' ? 'selected' : ''}>Tempo esgotado</option></select><span class="muted">${rows.length} ${rows.length === 1 ? 'questão' : 'questões'}</span></div>
    <div class="review-list">${rows.length ? rows.map(({ q, i, answer }) => {
      const right = !answer.timedOut && answer.choice === q.answerIndex;
      return `<article class="review-item"><div class="review-meta"><span>Questão ${i + 1} · ${e(q.topic)}</span><strong class="${right ? 'positive' : 'negative'}">${answer.timedOut ? 'Tempo esgotado' : right ? 'Correta' : 'Incorreta'}</strong></div><h2>${e(q.prompt)}</h2>${q.type === 'hotspot' ? visualImage(q, answer, true) : ''}<dl><div><dt>Sua resposta</dt><dd>${answer.choice === null ? 'Não respondida — tempo esgotado' : e(q.options[answer.choice])}</dd></div><div><dt>Resposta correta</dt><dd class="positive">${e(q.options[q.answerIndex])}</dd></div></dl><div class="justification"><h3>Justificativa:</h3><p>${e(q.explanation)}</p></div>${source(q)}</article>`;
    }).join('') : '<p class="empty-state">Nenhuma questão neste filtro. Escolha outra opção para continuar a revisão.</p>'}</div><div class="actions"><button class="secondary" data-action="results">Voltar ao resultado</button><button class="text-button" data-action="reset">Refazer quiz</button></div></section>`;
}
