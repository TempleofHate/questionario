# Músculos em estudo

Aplicação web de quiz em português, com **150 questões originais e uma parte independente de 40 questões por músculo**, baseada exclusivamente no PDF presente em `docs/`.

## Executar

Requer Node.js 22 ou superior. A aplicação não possui dependências de execução.

```bash
npm run dev
```

Abra **http://localhost:5173**. Use o servidor HTTP; abrir `index.html` diretamente como `file://` não carrega módulos JavaScript corretamente.

## Produção

```bash
npm run build
npm run preview
```

O build valida as questões e gera `dist/`, pronta para hospedagem estática **na raiz do domínio**. O preview usa a porta 5173: encerre o servidor de desenvolvimento antes de iniciá-lo. Para outra porta: `PORT=4173 npm run preview`.

## Funcionalidades

- 150 questões, quatro alternativas, resposta única, explicação e link à página do PDF.
- 60 segundos por questão, alerta visual nos dez segundos finais e bloqueio das alternativas ao esgotar o prazo.
- Respostas confirmadas ficam bloqueadas; alternativa correta e escolha errada recebem indicação textual e visual. A área Justificativa aparece imediatamente após confirmar, tanto no acerto quanto no erro.
- No esgotamento, a questão fica como não respondida e vale um erro. O gabarito e a justificativa permanecem na própria questão até o clique em Próxima questão.
- Resultado com acertos, erros, percentual, nota de 0 a 10, tempo de resposta, esgotamentos e desempenho por assunto.
- Revisão de todas as respostas, com justificativa individual, resposta escolhida, gabarito e status; filtros de erros e de tempo esgotado.
- Persistência local, restauração de seleção, respostas e prazo, sincronização entre abas e reinício confirmado.
- Tema escuro, fontes locais, teclado, foco visível, link para pular ao conteúdo e layout responsivo.

O tempo total soma o tempo utilizado em cada questão, limitado a 60 segundos. Não inclui a leitura dos feedbacks. O cronômetro utiliza um prazo absoluto: atualizar a página não devolve tempo. Ao retornar depois de uma longa ausência, somente a questão que estava aberta expira e seu feedback é restaurado; as questões ainda não exibidas recebem seu minuto após o avanço manual. Uma alternativa selecionada, mas não confirmada antes do prazo, não é pontuada. Se o navegador impedir `localStorage`, o quiz continua em memória e mostra um aviso.

## Fonte e autoria

O caminho `docs/musculos.pdf` citado no pedido não existia. A fonte encontrada foi **`docs/Músculos Cabeça e Pescoço (2)-1.pdf`**, preservada sem alterações. O texto integral extraído está em `docs/musculos.txt`.

As sete páginas foram lidas integralmente e conferidas também como imagens, incluindo tabelas que continuam em outra página, destaques e notas finais. Não foi utilizado conhecimento anatômico externo. Redação e ortografia foram normalizadas sem acrescentar informação; os campos sem inervação não foram completados. As afirmações seguem o documento, inclusive sua terminologia e suas atribuições de nervos.

Veja `docs/analise-conteudo.md` para cobertura, distribuição e limites da validação.

## Verificações

```bash
npm run validate  # banco, IDs, alternativas, gabarito, justificativas não genéricas e evidência no texto
npm run lint      # análise sintática de todos os módulos JavaScript
npm test          # testes de lógica e persistência com node:test
npm run build     # validação e geração de dist/
```

Para o teste de navegador (única dependência de desenvolvimento):

```bash
npm ci
npx playwright install chromium
npm run dev
# Em outro terminal:
npm run test:e2e
```

O teste E2E percorre as 150 questões pela interface, espera uma expiração real de 60 segundos, exige avanço manual após ler a justificativa, verifica as 150 justificativas no feedback e na revisão, testa recarga, resultado, revisão, filtros e reinício, captura cinco larguras (320, 390, 834, 1280 e 1505 px) e verifica ausência de overflow e erros de console. Use `QUIZ_URL=http://127.0.0.1:4173 npm run test:e2e` para testar outro servidor. As capturas e o relatório ficam em `.impeccable/review/` (ignorado pelo Git).

Não há TypeScript nem etapa de typecheck. `lint` usa o analisador de sintaxe do próprio Node, sem instalar um linter externo.

## Organização

- `src/data/`: questões editoriais por assunto e montagem determinística do banco.
- `src/engine.js`: regras do quiz, relógio, pontuação e persistência, sem DOM.
- `src/views.js`: apresentação de início, questão, resultado e revisão.
- `src/app.js`: eventos e integração do estado com a interface.
- `src/styles.css`: sistema visual e responsividade.
- `scripts/`: servidor, validação, análise sintática e build.
- `tests/`: testes unitários e de navegador.
- `assets/fonts/`: fontes Noto auto-hospedadas, com licença.
- `PRODUCT.md`, `DESIGN.md`, `.impeccable/`: contexto e revisão de design.

Nos arquivos editoriais cada linha é `[página, dificuldade, evidência, enunciado, [correta, errada, errada, errada], explicação]`. A montagem em `questions.js` distribui os gabaritos entre A–D de maneira determinística (38/38/37/37). Alterações no banco que invalidem respostas salvas devem incrementar `BANK_VERSION`.

## Continuação: justificativas e expiração

O banco e os gabaritos foram preservados. O campo `explanation` é a justificativa individual. Oito justificativas foram ampliadas com informações do PDF. A seleção exige confirmação, e acertos, erros e esgotamentos mantêm feedback até avanço manual. A versão e a chave do armazenamento foram mantidas, pois IDs, ordem e gabaritos não mudaram. Sessões antigas continuam restauráveis.

## Músculos por completo

A aba **Músculos por completo · 40 questões** (`#musculos-detalhados`) tem uma questão para cada um dos 40 músculos das tabelas do PDF. Todas relacionam **origem, inserção, função e inervação**, com quatro alternativas, justificativa e referência à página. Distribuição: face (17), mastigação (4), língua e palato (8), hióide e deglutição (8) e pescoço (3).

As sínteses seguem exclusivamente o documento, inclusive os campos de inervação não informados do risório e do abaixador do septo nasal. As alternativas incorretas apresentam perfis de outros músculos já descritos na fonte. As linhas do masséter e do abaixador do ângulo da boca continuam na página seguinte, indicada na justificativa.

Cada uma das quatro partes tem sessão, nota, revisão e reinício independentes. As 150 questões originais mantêm IDs, ordem, alternativas e gabaritos. O progresso do antigo banco misto de 190 preserva as respostas das primeiras 150; as 40 reformuladas começam em uma sessão própria, pois seu conteúdo mudou. Sessões de 150 já concluídas permanecem concluídas.

`tests/details.test.js` cobre separação, integridade do banco original, migração, pontuação e persistência. `tests/details-browser.js` percorre as 40 questões, verifica troca de partes, recarga, revisão e responsividade.
