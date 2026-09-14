---
name: Músculos em estudo
description: Interface acadêmica noturna para estudo, justificativas e revisão.
colors:
  primary: "#c5df9a"
  primary-hover: "#d6edb4"
  background: "#121b19"
  surface: "#1b2722"
  text: "#eff0e7"
  muted: "#acbab4"
  border: "#53645d"
  soft-border: "#35463f"
  error: "#ffb6a7"
  error-surface: "#302421"
typography:
  headline:
    fontFamily: "Study Serif, Georgia, serif"
    fontSize: "clamp(26px, 2.45vw, 36px)"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Study Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  justification:
    fontFamily: "Study Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Study Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 400
rounded:
  control: "4px"
  dialog: "8px"
spacing:
  one: "8px"
  two: "16px"
  three: "24px"
  four: "32px"
  five: "48px"
  six: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  option-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "16px 20px"
  justification:
    textColor: "{colors.text}"
    typography: "{typography.justification}"
---

# Design System: Músculos em estudo

## Overview

**Creative North Star: "Sessão de estudo editorial"**

Sistema extraído da aplicação existente e da referência aprovada pelo usuário. A leitura da pergunta e da justificativa orienta a composição. O fundo noturno uniforme, a hierarquia serifada e os controles simples mantêm a atmosfera acadêmica solicitada.

**Key Characteristics:**
- Perguntas serifadas, corpo sem serifa e fontes locais.
- Superfícies planas, divisórias finas e espaço consistente.
- Feedback textual, com gabarito e justificativa identificados.

## Colors

O verde-claro primário identifica ações e gabaritos. O fundo e a superfície são verdes muito escuros; texto claro e texto secundário têm papéis distintos. O tom de erro identifica a escolha incorreta, sem colorir toda a justificativa.

**The Text First Rule.** Acerto, erro e tempo esgotado sempre aparecem escritos. A cor complementa o significado.

## Typography

Study Serif corresponde à Noto Serif local; Study Sans corresponde à Noto Sans local. A pergunta usa o papel headline, com títulos equilibrados. Metadados usam label, enquanto justificativas usam o papel próprio de leitura, inclusive em celular. Parágrafos têm medida máxima de 72 caracteres tipográficos.

**The Explanation Rule.** Justificativa é conteúdo principal: não usar tamanho de legenda, truncamento, acordeão fechado nem desaparecimento automático.

## Layout

Container de até 1300px, normalmente 90% da largura. Desktop: índice lateral de 260px e coluna principal flexível. Até 1050px, a lateral usa 200px. Até 760px, a questão precede o resumo e as margens laterais são de 20px. O cronômetro permanece fixo no topo da leitura no celular.

A justificativa sucede o status e o resumo de respostas. A confirmação ou expiração leva o foco ao feedback; o botão de próxima questão permanece depois dele. O avanço exige ação do usuário em todos os resultados.

## Elevation & Depth

Não há sombras. A separação vem de espaço, bordas simples e mudança discreta de superfície. O diálogo de reinício usa fundo escurecido e foco protegido porque apaga progresso.

## Shapes

Controles têm cantos discretos; os rádios são circulares. A barra de progresso é linear. Setas de ação são SVGs decorativos consistentes, com traço de 1,5px.

## Components

- **Alternativas:** linhas com rádio, letra e texto. Estados selecionada, correta e escolha incorreta preservam a mesma estrutura. Após confirmação ou expiração, o fieldset fica desabilitado.
- **Feedback:** título de status, resposta do usuário, resposta correta, título Justificativa, explicação e link à página do PDF. Sem caixa de alerta exagerada. Tempo esgotado usa estado textual neutro e não avança sozinho.
- **Botões:** altura mínima de 48px. Primário verde-claro; secundário transparente com borda. Foco visível de 3px com afastamento de 5px.
- **Revisão:** lista separada por divisórias, contendo pergunta, status, respostas e justificativa. Filtros não ocultam conteúdo da questão individual.
- **Movimento:** uma revelação curta do feedback (220ms), desativada com prefers-reduced-motion. Nenhum significado depende da animação.

## Do's and Don'ts

### Do:
- **Do** preservar o tema, as fontes locais e a hierarquia existente.
- **Do** manter justificativas legíveis em acerto, erro, expiração e revisão.
- **Do** conservar foco de teclado e referências ao material de estudo.

### Don't:
- **Don't** avançar automaticamente depois de revelar uma resposta.
- **Don't** reduzir a justificativa a uma mensagem genérica ou somente ao gabarito.
- **Don't** introduzir imagens anatômicas, fatos externos, gradientes ou ornamentos sem relação com o estudo.
