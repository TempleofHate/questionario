# Validação da entrega

- Banco validado programaticamente: **150 questões**, 150 IDs únicos, enunciados sem duplicatas exatas normalizadas, quatro alternativas distintas por questão, um gabarito válido e 150 justificativas individuais não vazias. A validação de placeholders e conteúdo lexical específico não encontrou justificativas genéricas.
- Evidências textuais encontradas nas sete páginas do PDF. Revisão semântica editorial a partir da leitura integral; a busca textual não é uma prova automática de veracidade.
- Dificuldade: 47 fáceis, 63 médias, 40 difíceis. Posição dos gabaritos: A=38, B=38, C=37, D=37.
- 13 testes de lógica, persistência, validação e apresentação aprovados. Incluem confirmação no limite do tempo, bloqueio de resposta, recarga, estado inválido, armazenamento indisponível e manutenção do feedback da última questão expirada até o avanço manual.
- E2E em Chromium: todas as 150 questões percorridas por seleção e confirmação na interface, salvo uma expirada após espera real de 60 segundos. Resultado esperado verificado: 74 acertos, 76 erros incluindo 1 esgotamento, 49,3%. A expiração bloqueou a própria questão com gabarito e justificativa e aguardou clique, inclusive depois da recarga.
- Fluxos de iniciar, selecionar, confirmar, avançar, recarregar, restaurar, concluir, revisar, filtrar e reiniciar aprovados. Cancelamento de reinício preserva respostas. As 150 justificativas foram verificadas no feedback e na revisão pelo E2E; teste de renderização também verifica cada uma em acerto, erro e expiração.
- Larguras verificadas: 1505, 1280, 834, 390 e 320 px. Sem overflow horizontal ou erros de console.
- Checagem adicional: navegação por teclado, SVG decorativo, foco, filtro vazio, Escape no diálogo, timer fixo em celular e sincronização entre abas aprovados.
- Contrastes dos pares de texto/superfície testados: mínimo 8,72:1. Foco visível e textos de estado complementam as cores.
- `npm run lint` (análise sintática), `npm test` e `npm run build` aprovados. Projeto JavaScript, sem typecheck TypeScript.
- Impeccable: contexto e orientações utilizados, referência visual gerada e aprovada pelo usuário, detector mecânico sem ocorrências. Revisão visual independente aceitou a composição e confirmou a resolução das duas correções pedidas. O comparador automático de pixels reportou diferenças; o registro preserva a reprovação daquele gate e a avaliação visual separada, sem declarar aprovação automática de fidelidade pixel a pixel.

Scripts reproduzíveis em `tests/` e `scripts/`. Capturas e relatórios locais em `.impeccable/review/`. O build está em `dist/`.

## Preservação e revisão incremental

Comparação programática com o snapshot anterior confirmou preservação de todos os 150 IDs, enunciados, alternativas, gabaritos, ordem, assuntos e referências. Apenas oito justificativas foram ampliadas. A chave de localStorage e BANK_VERSION foram mantidas; estados anteriores continuam válidos.

A atualização de feedback foi revisada visualmente em desktop e celular segundo as orientações harden/craft-floor do Impeccable. O hook de design não apontou problemas determinísticos nos estilos modificados. A área usa título Justificativa, texto principal de 16px e espaçamento simples; foco e rolagem levam ao feedback depois da resolução. DESIGN.md e .impeccable/design.json documentam o sistema existente. A documentação foi concluída localmente após falha por limite de uso do agente anterior.
