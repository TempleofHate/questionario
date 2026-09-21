import { escapeHtml as e } from './format.js';
export function visualImage(q, answer, review = false) {
  const image = q.image;
  return `<figure class="visual-question">
    ${!review ? `<div class="visual-tools"><p id="visual-help">${answer ? `${answer.timedOut ? 'Tempo esgotado.' : answer.choice === 0 ? 'Resposta correta.' : 'Resposta incorreta.'} Contorno verde: localização correta. Cruz: seu clique.` : 'Clique ou toque na estrutura. O primeiro toque registra sua resposta.'}</p><button type="button" class="secondary" data-action="zoom" aria-pressed="false">Ampliar imagem</button></div>` : ''}
    <div class="image-scroll" ${review ? '' : 'tabindex="0" aria-label="Área da imagem; role para explorar a imagem ampliada"'}><div class="image-plane" style="aspect-ratio:${image.width}/${image.height};--image-ratio:${image.width / image.height}">
      <img src="${e(image.local)}" width="${image.width}" height="${image.height}" alt="${e(image.alt || 'Fotografia de peça óssea do crânio para identificação anatômica')}" ${review ? 'loading="lazy"' : 'fetchpriority="high"'} draggable="false">
      <svg class="hotspot-layer" viewBox="0 0 100 100" preserveAspectRatio="none" ${!answer && !review ? 'data-hotspot tabindex="0" role="button" aria-label="Responder na imagem: use as setas para mover o cursor, Shift para precisão e Enter para responder" aria-describedby="visual-help"' : 'role="img" aria-label="Localização correta destacada"'}>
      ${answer ? q.hotspots.map(p => `<polygon class="correct-region" points="${p.map(pair => pair.join(',')).join(' ')}"/>`).join('') : ''}
      ${answer?.point ? `<path class="answer-mark" d="M${answer.point.x - 1},${answer.point.y - 1} l2,2 m-2,0 l2,-2"/>` : ''}
      ${!answer && !review ? '<path class="keyboard-cursor" d="M48,50 h4 M50,48 v4"/>' : ''}
      </svg>
    </div></div>
    <figcaption>${e(image.author)} · <a href="${e(image.licenseUrl)}" target="_blank" rel="noopener">${e(image.license)}</a> · ${e(image.provider || 'Wikimedia Commons')}. ${e(image.changes || 'Redimensionada e comprimida.')}${answer ? '<br>Contorno verde: região correta. A cruz indica seu clique, quando houve resposta.' : ''}</figcaption>
    ${!answer && !review ? '<p class="fineprint">Para detalhes pequenos, amplie a imagem e deslize para explorar. Pelo teclado: setas movem o cursor; Shift + seta ajusta com precisão; Enter registra.</p>' : ''}
  </figure>`;
}
export function visualIntro() {
  return `<section class="intro"><h1 id="screen-title" tabindex="-1">Reconheça o crânio.<br>Localize cada estrutura.</h1>
    <p class="lead">70 questões com fotografias de peças anatômicas reais. Identifique ossos, suturas, forames, processos e cavidades diretamente na imagem.</p>
    <dl class="intro-facts"><div><dt>Questões visuais</dt><dd>70</dd></div><div><dt>Por questão</dt><dd>60 segundos</dd></div><div><dt>Fotografias</dt><dd>11 vistas e detalhes</dd></div></dl>
    <h2>Como funciona</h2><ol class="instructions"><li>Clique ou toque na estrutura pedida. O primeiro clique registra a resposta.</li><li>Amplie a imagem para localizar detalhes pequenos.</li><li>Veja a região correta e leia a justificativa, mesmo ao errar ou quando o tempo terminar.</li><li>Avance no seu ritmo. Ao final, revise as 70 questões e suas respostas.</li></ol>
    <p class="muted">Este modo tem progresso próprio, salvo neste navegador. A sessão das 150 questões de músculos é preservada. O cronômetro continua se você sair ou atualizar a página.</p>
    <div class="actions"><button class="primary" data-action="start">Iniciar quiz visual</button><a href="/docs/skull-sources.html">Fontes e créditos das imagens</a></div></section>`;
}
export function modeNav(mode) {
  return `<nav class="mode-nav" aria-label="Modo de estudo"><button class="text-button" data-action="mode" data-mode="muscles" ${mode === 'muscles' ? 'aria-current="page"' : ''}>Músculos · 150 questões</button><button class="text-button" data-action="mode" data-mode="muscle-details" ${mode === 'muscle-details' ? 'aria-current="page"' : ''}>Músculos por completo · 40 questões</button><button class="text-button" data-action="mode" data-mode="skull" ${mode === 'skull' ? 'aria-current="page"' : ''}>Crânio visual · 70 questões</button><button class="text-button" data-action="mode" data-mode="muscle-visual" ${mode === 'muscle-visual' ? 'aria-current="page"' : ''}>Músculos visuais · 70 questões</button><button class="text-button" data-action="mode" data-mode="skull-theory" ${mode === 'skull-theory' ? 'aria-current="page"' : ''}>Crânio — Fossas, Forames e Resistência · 40 questões</button></nav>`;
}

export function muscleVisualIntro() {
  return `<section class="intro"><h1 id="screen-title" tabindex="-1">Reconheça os músculos.<br>Localize cada estrutura.</h1>
  <p class="lead">70 questões com ilustrações anatômicas sem nomes ou legendas de identificação. Localize os músculos da face, da mastigação, da língua e das regiões hióideas e cervicais.</p>
  <dl class="intro-facts"><div><dt>Questões visuais</dt><dd>70</dd></div><div><dt>Por questão</dt><dd>60 segundos</dd></div><div><dt>Resposta</dt><dd>Clique ou toque</dd></div></dl>
  <h2>Como funciona</h2><ol class="instructions"><li>Clique ou toque no músculo pedido. O primeiro toque registra a resposta.</li><li>Amplie a imagem para explorar detalhes pequenos.</li><li>Após acertar, errar ou esgotar o tempo, confira o contorno verde e a justificativa.</li><li>Ao final, revise suas 70 respostas.</li></ol>
  <p class="muted">Progresso próprio salvo neste navegador. As sessões textuais e de ossos são preservadas. O cronômetro continua ao sair ou atualizar a página.</p>
  <div class="actions"><button class="primary" data-action="start">Iniciar quiz visual</button><a href="/docs/muscle-sources.html">Fontes e créditos das imagens</a></div></section>`;
}
