# Leitura e cobertura do documento

Fonte exclusiva: `Músculos Cabeça e Pescoço (2)-1.pdf`, sete páginas. Extração por `pdftotext -layout`, seguida de leitura integral e conferência visual das sete páginas renderizadas por `pdftoppm`. Não foram encontradas imagens anatômicas ou trechos ilegíveis que exigissem OCR. As continuações do abaixador do ângulo da boca (páginas 2–3), masséter (3–4), além do início da linha do genio-hióideo na página 6, foram consideradas.

## Assuntos

| Assunto | Conteúdo | Questões |
| --- | --- | ---: |
| Face | Occipitofrontal, orbicular do olho, corrugador, prócero, nasal, levantadores do lábio e ângulo da boca, zigomáticos, bucinador, risório, abaixador do septo, orbicular da boca, abaixadores do ângulo e lábio inferior, mentual | 50 |
| Mastigação | Temporal, masséter, pterigóideos medial e lateral; origens, inserções e funções dos feixes; protrusão, retração, fechamento, lateralização, translação e disco da ATM | 30 |
| Língua e palato | Genioglosso, hioglosso, estiloglosso, palatoglosso, tensor e levantador do véu palatino, palatofaríngeo e músculo da úvula | 24 |
| Hióide e deglutição | Digástrico, estilo-hióideo, milo-hióideo, genio-hióideo, esterno-hióideo, omo-hióideo, esterno-tireóideo e tireo-hióideo | 26 |
| Pescoço | Platisma, esternocleidomastóideo e trapézio, incluindo relações vasculares, inspiração e escápula | 14 |
| Relações anatômicas | Limites e conteúdo do espaço canino, porção motora do ramo mandibular e músculos enumerados na nota final | 6 |
| **Total** | | **150** |

A proporção considera quantidade de estruturas e densidade de informações. Os quatro músculos da mastigação recebem espaço adicional porque o texto diferencia feixes, tendões, fixações e movimentos. As relações do espaço canino também são retomadas em comparações de origem na seção de face.

## Dificuldades

47 questões fáceis (identificação e conceitos), 63 médias (comparações e associações) e 40 difíceis (integração de origem, inserção, função e nervo). As integrações são deduzidas de informações expressas na tabela. Não foram inventados diagnósticos, lesões, sintomas ou prognósticos. O tensor do tímpano aparece apenas como integrante da nota de inervação, pois não há dados de sua origem, inserção ou função.

## Decisões de fidelidade

- Distinguir ventre frontal/occipital e partes lacrimal/palpebral/orbital.
- Manter diferenças transversa/alar do nasal e descrições do sorriso dos zigomáticos e risório.
- Não preencher os campos de inervação marcados com traço no risório e abaixador do septo nasal.
- Preservar origens alternativas explicitamente atribuídas a Delane ou LACAPE/Madeira, identificando a atribuição quando necessária.
- Distinguir tuberosidade pterigóidea de fóvea pterigóidea e os feixes superior/inferior do lateral.
- Seguir a descrição de ação do genioglosso e as inervações de genio-hióideo, tireo-hióideo, plexo faríngeo e trapézio conforme o PDF, sem retificações por fontes externas.
- Evitar transformar o erro de repetição textual na inserção do genio-hióideo em uma pergunta sobre localização exata. As questões desse músculo utilizam origem, ação e nervo legíveis.

## Rastreabilidade e validação

Cada questão expõe uma página do PDF na explicação e possui uma evidência textual interna. `npm run validate` exige 150 IDs únicos, enunciados únicos normalizados, quatro alternativas não vazias e distintas, um índice correto válido, explicação não vazia, assunto/dificuldade conhecidos e presença da evidência na página indicada do texto extraído. A comparação ignora acentos, espaços e pontuação para tolerar quebras de linha da tabela.

A presença de uma evidência é uma checagem de rastreabilidade, não uma prova automática de veracidade anatômica. A correspondência semântica entre enunciados, gabaritos, distratores e PDF foi revisada editorialmente durante a autoria. Os distratores recombinam estruturas e relações do próprio documento. Perguntas de integração podem cruzar páginas; a explicação identifica a página adicional quando relevante.

## Continuação: justificativas

Foram mantidos todos os enunciados, alternativas, gabaritos e IDs. Oito explicações foram ampliadas (q012, q035, q059, q064, q096, q136, q137 e q141), recuperando origem, inserção ou ação expressas nas respectivas páginas. Nenhum dado anatômico externo foi acrescentado. A validação agora também rejeita placeholders, justificativas repetidas e textos sem pelo menos três termos significativos encontrados na página de referência. Essa checagem lexical complementa a leitura editorial; não demonstra sozinha a fidelidade semântica.
