// Sínteses editoriais exclusivamente das tabelas do PDF local (páginas 1–7).
// Cada registro cobre origem, inserção, função e inervação de um músculo.
// Campos não informados e particularidades do documento são preservados.
export const muscleProfiles = [
  ['Face', 1, 'Occipitofrontal', 'Aponeurose', [
    'Ventre frontal: aponeurose epicrânica; occipital: linha nucal superior e protuberância occipital externa',
    'Ventre frontal: pele da região do supercílio; occipital: aponeurose epicrânica',
    'Elevar a pele da fronte e formar rugas horizontais', 'Ramo frontal do VII e ramo auricular posterior']],
  ['Face', 1, 'Orbicular do olho', 'Crista', [
    'Parte lacrimal: crista lacrimal posterior; palpebral: ligamento palpebral medial; orbital: processo frontal da maxila',
    'Pálpebras e pele periorbital', 'Expelir lágrimas, unir as pálpebras levemente e forçar o fechamento do olho, formando rugas em leque', 'Ramo zigomático']],
  ['Face', 1, 'Corrugador do supercílio', 'Supraorbital', [
    'Margem supraorbital do frontal', 'Pele do supercílio', 'Puxar o supercílio medialmente e formar pregas verticais', 'Ramo frontal']],
  ['Face', 1, 'Prócero', 'Osso Nasal', [
    'Osso nasal', 'Pele da glabela', 'Abaixar a parte medial dos supercílios e formar pregas horizontais', 'Ramo zigomático']],
  ['Face', 1, 'Nasal', 'saliências alveolares', [
    'Base do osso alveolar da maxila e saliências alveolares do incisivo lateral e canino',
    'Parte transversa: dorso do nariz; alar: cartilagem alar', 'Parte transversa: comprimir a narina; alar: dilatar a narina', 'Ramo zigomático']],
  ['Face', 1, 'Levantador do lábio superior e da asa do nariz', 'Processo Frontal', [
    'Processo frontal da maxila', 'Pele da asa do nariz e do lábio superior', 'Elevar e dobrar o lábio superior e dilatar a narina', 'Ramo bucal']],
  ['Face', 1, 'Levantador do lábio superior', 'Margem Infraorbital', [
    'Margem infraorbital', 'Lábio superior', 'Elevar o lábio superior e ressaltar o sulco nasolabial', 'Ramo bucal']],
  ['Face', 1, 'Levantador do ângulo da boca', 'Fossa canina', [
    'Fossa canina', 'Ângulo da boca', 'Elevar o ângulo da boca', 'Ramo bucal']],
  ['Face', 2, 'Zigomático menor', 'Osso zigomático', [
    'Osso zigomático', 'Lábio superior', 'Elevar o lábio superior, puxando-o lateral e superiormente no riso não espontâneo', 'Ramo zigomático']],
  ['Face', 2, 'Zigomático maior', 'Face lateral', [
    'Face lateral do osso zigomático', 'Porção mais lateral do lábio superior e comissura labial', 'Tracionar o ângulo da boca para cima e lateralmente no sorriso verdadeiro', 'Ramo zigomático']],
  ['Face', 2, 'Bucinador', 'Processos Alveolares', [
    'Processos alveolares da maxila e mandíbula, rafe e ligamento pterigomandibular', 'Ângulo da boca',
    'Retrair o ângulo da boca e comprimir a bochecha contra os dentes, contribuindo com sopro, assobio, deglutição e mastigação', 'Ramo bucal']],
  ['Face', 2, 'Risório', 'Fáscia Massetérica', [
    'Fáscia massetérica e pele da bochecha', 'Ângulo da boca', 'Levantar e retrair o ângulo da boca, formando o riso falso', 'Não informada no PDF (campo com traço)']],
  ['Face', 2, 'Abaixador do septo nasal', 'Depressão óssea', [
    'Depressão óssea lateral à eminência alveolar do incisivo lateral superior', 'Septo nasal', 'Abaixar a asa do nariz', 'Não informada no PDF (campo com traço)']],
  ['Face', 2, 'Orbicular da boca', 'Fóveas incisivas', [
    'Fóveas incisivas da maxila e mandíbula', 'Pele e mucosa dos lábios e septo nasal', 'Fechar a boca, comprimir os lábios contra os dentes e protrair os lábios', 'Ramo bucal']],
  ['Face', 2, 'Abaixador do ângulo da boca', 'Base externa', [
    'Base externa ou borda inferior da mandíbula, da região molar ao tubérculo mentoniano', 'Ângulo da boca', 'Abaixar o ângulo da boca e tracioná-lo levemente para fora', 'Ramo marginal da mandíbula']],
  ['Face', 3, 'Abaixador do lábio inferior', 'Linha oblíqua', [
    'Linha oblíqua ou base da mandíbula, acima da origem do abaixador do ângulo da boca', 'Lábio inferior', 'Abaixar o lábio inferior e tracioná-lo levemente para lateral', 'Ramo marginal da mandíbula']],
  ['Face', 3, 'Mentual', 'Fossa mentoniana', [
    'Fossa mentoniana e protuberância mentual', 'Pele do mento', 'Comprimir o mento contra a mandíbula, diminuir o fundo do vestíbulo inferior, enrugar a pele do mento e everter o lábio inferior', 'Ramo marginal da mandíbula']],
  ['Mastigação', 3, 'Temporal', 'Linha Temporal', [
    'Linha temporal inferior (Delane); soalho da fossa temporal e face interna da fáscia temporal (LACAPE/Madeira)',
    'Processo coronoide, borda anterior do ramo da mandíbula e trígono retromolar',
    'Fechamento leve e rápido da mandíbula, retração pelas fibras posteriores e auxílio à lateralização', 'Nervo temporal profundo, ramo mandibular do V']],
  ['Mastigação', 3, 'Masséter', 'Tuberosidade', [
    'Superficial: corpo do zigomático e três quartos anteriores da borda inferior do arco; profundo: face medial da metade posterior do arco zigomático',
    'Dois terços inferiores da face lateral do ramo mandibular; superficial: tuberosidade massetérica; profundo: face lateral do ramo; porção coronoide: processo coronoide',
    'Fechamento forte da mandíbula, protrusão e estabilização da ATM', 'Nervo massetérico, ramo mandibular do V']],
  ['Mastigação', 4, 'Pterigóideo medial', 'Feixe maior', [
    'Feixe maior: face medial da lâmina lateral do processo pterigóide e fossa pterigóidea; menor: processo piramidal do palatino e tuberosidade da maxila',
    'Tuberosidade pterigóidea', 'Elevar a mandíbula, realizar leve protrusão e auxiliar a lateralização do pterigóideo lateral', 'Nervo pterigóideo medial, ramo mandibular do V']],
  ['Mastigação', 4, 'Pterigóideo lateral', 'Infratemporal', [
    'Superior: superfície infratemporal da asa maior do esfenoide; inferior: face lateral da lâmina lateral do processo pterigóideo',
    'Superior: cápsula da ATM, borda anterior do disco e fóvea pterigóidea; inferior: fóvea pterigóidea',
    'Protrusão, lateralização, estabilização do disco e abertura máxima; superior: controle do retorno do disco; inferior: translação da ATM', 'Nervo pterigóideo lateral, ramo mandibular do V']],
  ['Língua e palato', 5, 'Genioglosso', 'Espinha geniana', [
    'Espinha geniana superior', 'Face inferior da língua', 'Abaixar a língua e retrair sua ponta', 'Nervo hipoglosso']],
  ['Língua e palato', 5, 'Hioglosso', 'Corno Maior e Corpo', [
    'Corno maior e corpo do hióide', 'Face lateral da língua', 'Abaixar e retrair a língua', 'Nervo hipoglosso']],
  ['Língua e palato', 5, 'Estiloglosso', 'Processo Estilóide', [
    'Processo estilóide', 'Face inferior, no aspecto posterolateral da língua', 'Retrair e tracionar o dorso da língua para cima', 'Nervo hipoglosso']],
  ['Língua e palato', 5, 'Palatoglosso', 'N. Vago', [
    'Aponeurose palatina', 'Face posterolateral da língua', 'Formar o arco palatoglosso e elevar o dorso da língua', 'Nervo vago']],
  ['Língua e palato', 5, 'Tensor do véu palatino', 'Fossa Escafóide', [
    'Fossa escafóide', 'Aponeurose palatina', 'Firmar o palato mole e abrir a tuba auditiva', 'Ramo mandibular do V']],
  ['Língua e palato', 5, 'Levantador do véu palatino', 'Porção petrosa', [
    'Porção petrosa do temporal e cartilagem da tuba auditiva', 'Aponeurose palatina', 'Elevar o palato mole e fechar o istmo faríngeo', 'Plexo faríngeo (X e XI pares, conforme o PDF)']],
  ['Língua e palato', 5, 'Palatofaríngeo', 'Paredes', [
    'Aponeurose palatina', 'Paredes posterolaterais da faringe', 'Formar os arcos palatofaríngeos', 'Plexo faríngeo (X e XI pares, conforme o PDF)']],
  ['Língua e palato', 5, 'Músculo da úvula', 'Espinha nasal', [
    'Espinha nasal posterior e aponeurose palatina', 'Mucosa da úvula', 'Elevar e retrair a úvula, ajudando a fechar o istmo orofaríngeo', 'Plexo faríngeo (X e XI pares, conforme o PDF)']],
  ['Hióide e deglutição', 5, 'Digástrico', 'incisura', [
    'Ventre posterior: incisura mastóidea, continuando pelo tendão intermediário como ventre anterior',
    'Fixação indireta ao hióide pelo tendão intermediário; ventre anterior dirigido à fossa digástrica da mandíbula',
    'Elevar o hióide e realizar a abertura inicial da boca', 'Anterior: nervo milo-hióideo (ramo mandibular); posterior: nervo facial']],
  ['Hióide e deglutição', 5, 'Estilo-hióideo', 'Corno Maior', [
    'Processo estilóide', 'Corno maior do hióide', 'Elevar e retrair o hióide', 'Nervo facial']],
  ['Hióide e deglutição', 5, 'Milo-hióideo', 'Linha Milo-Hióidea', [
    'Linha milo-hióidea da mandíbula e rafe milo-hióidea, conforme a coluna de origem do PDF', 'Corpo do hióide', 'Sustentar e elevar o assoalho da boca e elevar o hióide', 'Nervo milo-hióideo, ramo mandibular']],
  ['Hióide e deglutição', 6, 'Genio-hióideo', 'Espinha geniana', [
    'Espinha geniana inferior (Delane) ou tubérculo inferior da espinha mentual (LACAPE)', 'Metade superior do corpo do hióide', 'Elevar o hióide e o assoalho da boca durante a deglutição', 'Nervo hipoglosso, conforme o PDF']],
  ['Hióide e deglutição', 6, 'Esterno-hióideo', 'articulação', [
    'Manúbrio do esterno e articulação esternoclavicular', 'Corpo do hióide', 'Abaixar o hióide', 'Alça cervical (C1, C2 e C3)']],
  ['Hióide e deglutição', 6, 'Omo-hióideo', 'escápula', [
    'Ventre inferior: borda superior da escápula, seguindo pelo tendão intermediário', 'Ventre superior: corpo do hióide', 'Tracionar o hióide para baixo e ligeiramente para trás', 'Alça cervical (C1, C2 e C3)']],
  ['Hióide e deglutição', 6, 'Esterno-tireóideo', 'Manúbrio do Esterno', [
    'Manúbrio do esterno', 'Cartilagem tireóidea', 'Abaixar a cartilagem tireóidea', 'Alça cervical']],
  ['Hióide e deglutição', 6, 'Tireo-hióideo', 'Cartilagem Tireóidea', [
    'Cartilagem tireóidea', 'Osso hióide', 'Tracionar superiormente a cartilagem tireóidea', 'Nervo hipoglosso, conforme o PDF']],
  ['Pescoço', 6, 'Platisma', 'Peitoral Maior', [
    'Fáscia dos músculos peitoral maior e deltóide', 'Comissura oral (LACAPE) e pele da margem inferior da mandíbula',
    'Elevar e puxar para frente a pele do pescoço e ombro, auxiliando o retorno venoso ao diminuir a concavidade lateral do pescoço', 'Ramo cervical do VII']],
  ['Pescoço', 7, 'Esternocleidomastóideo', 'Manúbrio', [
    'Manúbrio do esterno e porção medial da clavícula', 'Processo mastóideo e metade lateral da linha superior da nuca',
    'Proteger os grandes vasos, inclinar a cabeça lateralmente e, em conjunto, levá-la ao manúbrio; auxiliar a inspiração elevando esterno e clavícula', 'Nervo acessório (XI)']],
  ['Pescoço', 7, 'Trapézio', 'acrômio', [
    'Linha nucal superior, protuberância occipital externa e processos espinhosos cervicais e torácicos', 'Clavícula, acrômio e espinha da escápula',
    'Elevar o ombro e retrair, fixar e abaixar a escápula', 'Nervo acessório e participação do plexo cervical (C5 a T1, conforme o PDF)']],
];

const labels = ['Origem', 'Inserção', 'Função', 'Inervação'];
const describe = fields => fields.map((value, i) => `${labels[i]}: ${value}.`).join(' ');
// Distratores são perfis de outros músculos já descritos na mesma fonte.
// Trocar o perfil completo evita tratar sinônimos ou descrições parciais como erros.
export const additional = muscleProfiles.map(([topic, page, muscle, evidence, fields], index) => {
  const peers = [...muscleProfiles.filter(profile => profile[0] === topic && profile[2] !== muscle),
    ...muscleProfiles.filter(profile => profile[0] !== topic)];
  const start = index % Math.max(1, peers.filter(profile => profile[0] === topic).length);
  const distractors = [0, 1, 2].map(offset => peers[(start + offset) % peers.length]);
  const options = [describe(fields), ...distractors.map(profile => describe(profile[4]))];
  const continuation = muscle === 'Masséter' ? ' A descrição da porção coronoide continua na página 4.' : muscle === 'Abaixador do ângulo da boca' ? ' A descrição continua na página 3.' : '';
  return [topic, [page, 'Difícil', evidence,
    `${muscle}: qual associação de origem, inserção, função e inervação corresponde ao PDF?`,
    options, `${muscle} — ${describe(fields)}${continuation}`]];
});
