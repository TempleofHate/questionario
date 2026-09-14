# Quiz principal

Mode: Operate / Read no feedback e na revisão.

## Direção aprovada
Referência: `.impeccable/mocks/reference.png`. O usuário respondeu “Seguir essa referência”.
Composição editorial de sessão de estudo, aparência noturna fixada pelo usuário. Índice de assuntos à esquerda, pergunta e alternativas à direita, progresso e cronômetro acima. No celular, a questão vem primeiro e o resumo da sessão vai abaixo.

## Contrato
A primeira tela apresenta o escopo, regras de tempo, persistência e botão de início. A superfície principal segue a referência aprovada: cabeçalho fino, margem ampla, duas colunas, título serifado, quatro opções com borda simples, ação primária verde-clara e fundo escuro uniforme. Campos não literais da imagem: contagem inicial da barra deve refletir zero respostas; textos repetitivos de assunto foram condensados; texturas geradas não fazem parte da aplicação.
Assinatura funcional: a seleção marca a linha; a confirmação transforma a mesma lista em gabarito bloqueado e revela explicação com página da fonte. O tempo esgotado bloqueia a questão, revela o gabarito e a justificativa, e aguarda avanço manual. O feedback recebe foco e é trazido ao viewport após confirmação ou expiração, com a identificação Justificativa em texto de 16px. A atualização é incremental, solicitada pelo usuário; a referência visual e a arquitetura são preservadas.
Estados exigidos: início, questão, seleção, acerto, erro, expiração, restauração, storage indisponível, resultado, revisão filtrada, filtro vazio e confirmação de reinício.

## Evidências
Banco de 150 questões: 47 fáceis, 63 médias, 40 difíceis. Resultado matemático, sem inventar classificações de desempenho. Sem imagens anatômicas externas. Imagem de referência gerada pela ferramenta nativa image_gen; serve apenas de referência visual, não de fonte anatômica ou elemento da interface.
