import type { News } from "@parnaibadigital/types";

/**
 * T052 / FR-016 — os 12 artigos do protótipo.
 *
 * Três regras governam este arquivo, e todas vêm da spec, não de gosto:
 *
 * 1. **Manchete no padrão `[Bairro] + [fato]`** (DS, seção de voz). Não é estilo: é o que
 *    faz a listagem ser varrida pelo olho de quem procura a própria rua. Toda manchete
 *    abaixo começa pelo lugar.
 * 2. **`municipalityIbgeCode` sempre presente** (FR-021). Bairro é opcional — Cajueiro da
 *    Praia e Buriti dos Lopes entram com vínculo apenas municipal, como no protótipo — mas
 *    município nunca falta, porque é dele que saem canônica, `contentLocation` e feed.
 * 3. **`attribution` obrigatória quando `curation.kind = "curated"`** (Princípio V, FR-018).
 *    O conteúdo que nasce de fonte externa carrega a fonte junto; sem isso o produto se
 *    apropria de apuração alheia, que é o risco editorial que a Constituição nomeia.
 *
 * **Nenhum artigo tem `image`.** O `readme.md` do DS declara que o portal não tem banco de
 * imagens e que `PhotoFrame` é o substituto — inventar URLs de foto criaria um caminho que
 * quebra no primeiro build real. A ausência aqui é o que exercita o fallback de T085 nas 14
 * superfícies, em vez de deixá-lo sem cobertura.
 *
 * As datas são derivadas do instante da construção, e não fixadas em agosto de 2026. O
 * protótipo expressa tempo em "há N minutos"; uma data cravada faria o portal nascer com
 * conteúdo velho e esvaziaria o `sitemap-news.xml`, que só aceita as últimas 48 h.
 */

/** Instante de referência da construção. Os `minutes` abaixo são os do protótipo. */
const BUILD_TIME = Date.now();

function publishedMinutesAgo(minutes: number): string {
  return new Date(BUILD_TIME - minutes * 60_000).toISOString();
}

export const news: readonly News[] = Object.freeze([
  {
    id: "news-01",
    slug: "centro-tem-bloqueio-na-rua-grande-ate-sexta-por-obra-de-drenagem",
    headline: "Centro tem bloqueio na Rua Grande até sexta por obra de drenagem",
    standfirst:
      "Trecho de 300 metros fica interditado das 7h às 18h; o desvio oficial é pela Duque de Caxias.",
    categorySlug: "urgente",
    tone: "urgent",
    authorSlug: "marina-sousa",
    municipalityIbgeCode: "2207702",
    neighborhoodIds: ["parnaiba:centro"],
    publishedAt: publishedMinutesAgo(3),
    updatedAt: publishedMinutesAgo(3),
    curation: { kind: "curated", reviewedByHuman: true, updatedAt: publishedMinutesAgo(3) },
    sponsored: false,
    viewCount: 18_400,
    commentCount: 42,
    gazetteDocumentId: "doc-01",
    regionalContext:
      "A Rua Grande concentra o comércio histórico do Centro e liga a Praça da Graça à Avenida Getúlio Vargas. É o terceiro trecho do bairro a receber substituição de galeria desde o início do ano.",
    attribution: {
      sourceName: "Diário do Litoral",
      sourceUrl: "https://diariodolitoral.example.com/rua-grande-drenagem",
    },
    body: [
      {
        type: "paragraph",
        text: "A Rua Grande, no Centro de Parnaíba, ficará interditada entre a Praça da Graça e a Avenida Getúlio Vargas de quarta a sexta-feira, das 7h às 18h. A Secretaria Municipal de Trânsito informou que a intervenção substitui 300 metros de galeria de drenagem instalada há mais de trinta anos.",
      },
      {
        type: "paragraph",
        text: "O desvio oficial é pela Rua Duque de Caxias, com retorno pela Avenida Chagas Rodrigues. Seis agentes permanecem no local durante todo o horário de obra e as linhas de ônibus 02 e 07 seguem itinerário alternativo, sem alteração de tarifa.",
      },
      { type: "heading", level: 2, text: "O que muda para quem circula pelo Centro" },
      {
        type: "paragraph",
        text: "Comerciantes da via foram notificados sobre a suspensão temporária das vagas de estacionamento. Carga e descarga precisa de autorização, solicitada pelo portal da prefeitura ou pelo telefone da secretaria.",
      },
      {
        type: "quote",
        text: "A obra era prevista para janeiro, mas foi antecipada por causa do volume de água acumulado nas últimas chuvas.",
        attribution: "Secretaria Municipal de Trânsito de Parnaíba, em nota",
      },
    ],
  },

  {
    id: "news-02",
    slug: "sao-jose-ganha-nova-faixa-elevada-de-pedestres-na-av-sao-sebastiao",
    headline: "São José ganha nova faixa elevada de pedestres na Av. São Sebastião",
    standfirst: "Intervenção começa na segunda e muda o fluxo em dois cruzamentos do bairro.",
    categorySlug: "transito",
    tone: "brand",
    authorSlug: "rafael-coelho",
    municipalityIbgeCode: "2207702",
    neighborhoodIds: ["parnaiba:sao-jose"],
    publishedAt: publishedMinutesAgo(12),
    updatedAt: publishedMinutesAgo(12),
    curation: { kind: "original", reviewedByHuman: true, updatedAt: publishedMinutesAgo(12) },
    sponsored: false,
    viewCount: 12_100,
    commentCount: 28,
    regionalContext:
      "A Avenida São Sebastião é o principal acesso ao bairro São José e concentra duas escolas municipais e a feira semanal.",
    body: [
      {
        type: "paragraph",
        text: "A Avenida São Sebastião, no bairro São José, recebe uma faixa elevada de pedestres a partir de segunda-feira. A obra altera o fluxo em dois cruzamentos e reduz a velocidade máxima do trecho enquanto durar a execução.",
      },
      {
        type: "paragraph",
        text: "A escolha do ponto levou em conta a proximidade de duas escolas municipais e o volume de travessia no horário de entrada e saída de alunos.",
      },
      {
        type: "list",
        items: [
          "Cruzamento com a Rua Tiradentes: mão única durante a obra",
          "Cruzamento com a Rua Manoel Cavalcante: travessia desviada para a esquina seguinte",
          "Velocidade máxima reduzida no trecho enquanto durar a execução",
        ],
      },
    ],
  },

  {
    id: "news-03",
    slug: "pedra-do-sal-tera-reforco-de-salva-vidas-no-feriado-do-dia-15",
    headline: "Pedra do Sal terá reforço de salva-vidas no feriado do dia 15",
    standfirst:
      "Prefeitura confirma oito agentes por turno entre sábado e segunda, com posto móvel na entrada da praia e ambulância de plantão.",
    categorySlug: "litoral",
    tone: "highlight",
    authorSlug: "ana-beatriz-melo",
    municipalityIbgeCode: "2205805",
    neighborhoodIds: ["luis-correia:pedra-do-sal"],
    publishedAt: publishedMinutesAgo(5),
    updatedAt: publishedMinutesAgo(5),
    curation: { kind: "curated", reviewedByHuman: true, updatedAt: publishedMinutesAgo(5) },
    sponsored: false,
    viewCount: 9_700,
    commentCount: 17,
    gazetteDocumentId: "doc-02",
    regionalContext:
      "A Pedra do Sal é a praia mais movimentada de Luís Correia em feriados prolongados e concentra o maior número de ocorrências de banho em área de correnteza no litoral piauiense.",
    attribution: {
      sourceName: "Diário do Litoral",
      sourceUrl: "https://diariodolitoral.example.com/pedra-do-sal-salva-vidas",
    },
    body: [
      {
        type: "paragraph",
        text: "A Prefeitura de Luís Correia confirmou oito salva-vidas por turno na Pedra do Sal entre sábado e segunda-feira do feriado do dia 15. O efetivo é o dobro do escalado em fins de semana comuns.",
      },
      {
        type: "paragraph",
        text: "Um posto móvel será instalado na entrada da praia, com ambulância de plantão durante todo o período. A escala vale das 8h às 18h e cobre também o trecho da Barra Grande.",
      },
      {
        type: "paragraph",
        text: "A convocação vem do processo seletivo simplificado aberto pelo Edital nº 07/2026, que ofertou 42 vagas temporárias para a temporada de praia.",
      },
    ],
  },

  {
    id: "news-04",
    slug: "fatima-recebe-mutirao-de-exames-na-ubs-no-proximo-sabado",
    headline: "Fátima recebe mutirão de exames na UBS no próximo sábado",
    standfirst: "Atendimento por ordem de chegada, das 8h às 14h, com 300 vagas.",
    categorySlug: "saude",
    tone: "brand",
    authorSlug: "marina-sousa",
    municipalityIbgeCode: "2207702",
    neighborhoodIds: ["parnaiba:nossa-senhora-de-fatima"],
    publishedAt: publishedMinutesAgo(26),
    updatedAt: publishedMinutesAgo(26),
    curation: { kind: "original", reviewedByHuman: true, updatedAt: publishedMinutesAgo(26) },
    sponsored: false,
    viewCount: 7_300,
    commentCount: 11,
    body: [
      {
        type: "paragraph",
        text: "A Unidade Básica de Saúde do bairro Nossa Senhora de Fátima realiza mutirão de exames no próximo sábado, das 8h às 14h. São 300 vagas distribuídas por ordem de chegada.",
      },
      {
        type: "paragraph",
        text: "É preciso levar documento com foto e cartão do SUS. O resultado fica disponível na própria unidade em até quinze dias.",
      },
      {
        type: "list",
        items: [
          "Glicemia capilar",
          "Aferição de pressão arterial",
          "Coleta de preventivo",
          "Atualização da caderneta de vacinação",
        ],
      },
    ],
  },

  {
    id: "news-05",
    slug: "bairro-piaui-passa-a-ter-coleta-seletiva-em-dois-turnos",
    headline: "Bairro Piauí passa a ter coleta seletiva em dois turnos",
    standfirst: "Mudança vale a partir de segunda e atende 4 mil domicílios.",
    categorySlug: "servicos",
    tone: "brand",
    authorSlug: "rafael-coelho",
    municipalityIbgeCode: "2207702",
    neighborhoodIds: ["parnaiba:piaui"],
    publishedAt: publishedMinutesAgo(41),
    updatedAt: publishedMinutesAgo(41),
    curation: { kind: "curated", reviewedByHuman: true, updatedAt: publishedMinutesAgo(41) },
    sponsored: false,
    viewCount: 6_800,
    commentCount: 9,
    gazetteDocumentId: "doc-05",
    attribution: {
      sourceName: "Portal da Prefeitura de Parnaíba",
      sourceUrl: "https://parnaiba.pi.gov.br.example.com/coleta-seletiva-piaui",
    },
    body: [
      {
        type: "paragraph",
        text: "A coleta seletiva no bairro Piauí passa a operar em dois turnos a partir de segunda-feira, atendendo cerca de 4 mil domicílios. Antes, o serviço acontecia apenas pela manhã, duas vezes por semana.",
      },
      {
        type: "paragraph",
        text: "A Secretaria de Serviços Urbanos informou que a mudança acompanha o crescimento do volume de material reciclável entregue nos pontos de entrega voluntária do bairro.",
      },
    ],
  },

  {
    id: "news-06",
    slug: "frei-higino-escola-municipal-abre-matriculas-para-o-2-semestre",
    headline: "Frei Higino: escola municipal abre matrículas para o 2º semestre",
    standfirst: "São 180 vagas do 1º ao 5º ano, com inscrição presencial.",
    categorySlug: "educacao",
    tone: "brand",
    authorSlug: "ana-beatriz-melo",
    municipalityIbgeCode: "2207702",
    neighborhoodIds: ["parnaiba:frei-higino"],
    publishedAt: publishedMinutesAgo(58),
    updatedAt: publishedMinutesAgo(58),
    curation: { kind: "original", reviewedByHuman: true, updatedAt: publishedMinutesAgo(58) },
    sponsored: false,
    viewCount: 5_200,
    commentCount: 6,
    body: [
      {
        type: "paragraph",
        text: "A escola municipal do Frei Higino abre 180 vagas do 1º ao 5º ano para o segundo semestre. A inscrição é presencial, na secretaria da unidade, das 8h às 17h.",
      },
      {
        type: "paragraph",
        text: "São exigidos certidão de nascimento, comprovante de residência do bairro e histórico escolar de quem vem de outra unidade.",
      },
    ],
  },

  {
    id: "news-07",
    slug: "reis-veloso-tera-feira-de-empreendedores-no-fim-de-semana",
    headline: "Reis Veloso terá feira de empreendedores no fim de semana",
    standfirst: "Sessenta expositores confirmados na praça central do bairro.",
    categorySlug: "economia",
    tone: "brand",
    authorSlug: "marina-sousa",
    municipalityIbgeCode: "2207702",
    neighborhoodIds: ["parnaiba:reis-veloso"],
    publishedAt: publishedMinutesAgo(76),
    updatedAt: publishedMinutesAgo(76),
    curation: { kind: "original", reviewedByHuman: true, updatedAt: publishedMinutesAgo(76) },
    sponsored: false,
    viewCount: 4_900,
    commentCount: 14,
    body: [
      {
        type: "paragraph",
        text: "A praça central do Reis Veloso recebe no fim de semana uma feira com sessenta expositores de artesanato, alimentação e serviços do próprio bairro.",
      },
      {
        type: "paragraph",
        text: "A programação vai das 16h às 22h nos dois dias, com espaço para apresentação de grupos culturais no fim da tarde.",
      },
    ],
  },

  {
    id: "news-08",
    slug: "ilha-grande-amplia-horario-do-ferry-para-o-porto-dos-tatus",
    headline: "Ilha Grande amplia horário do ferry para o Porto dos Tatus",
    standfirst: "Duas travessias extras passam a operar às 18h30 e às 20h a partir de segunda.",
    categorySlug: "delta",
    tone: "highlight",
    authorSlug: "rafael-coelho",
    municipalityIbgeCode: "2204550",
    neighborhoodIds: ["ilha-grande:porto-dos-tatus"],
    publishedAt: publishedMinutesAgo(92),
    updatedAt: publishedMinutesAgo(92),
    curation: { kind: "curated", reviewedByHuman: true, updatedAt: publishedMinutesAgo(92) },
    sponsored: false,
    viewCount: 4_100,
    commentCount: 8,
    gazetteDocumentId: "doc-06",
    regionalContext:
      "O Porto dos Tatus é o principal acesso fluvial ao Delta do Parnaíba e concentra a saída dos passeios para os lençóis e para a foz.",
    attribution: {
      sourceName: "Diário do Litoral",
      sourceUrl: "https://diariodolitoral.example.com/ferry-porto-dos-tatus",
    },
    body: [
      {
        type: "paragraph",
        text: "O ferry que liga Ilha Grande ao Porto dos Tatus passa a ter duas travessias extras, às 18h30 e às 20h, a partir de segunda-feira. O horário anterior encerrava às 17h.",
      },
      {
        type: "paragraph",
        text: "A ampliação atende a demanda de moradores que trabalham em Parnaíba e dependem da travessia no fim do expediente.",
      },
    ],
  },

  {
    id: "news-09",
    slug: "cajueiro-da-praia-registra-12-peixes-boi-na-temporada-de-monitoramento",
    headline: "Cajueiro da Praia registra 12 peixes-boi na temporada de monitoramento",
    standfirst: "Projeto do ICMBio confirma dois filhotes na área de Barra Grande.",
    categorySlug: "meio-ambiente",
    tone: "brand",
    authorSlug: "ana-beatriz-melo",
    municipalityIbgeCode: "2202174",
    // Sem bairro: o vínculo é municipal, como no protótipo. A matéria precisa renderizar
    // corretamente assim (edge case de T066).
    neighborhoodIds: [],
    publishedAt: publishedMinutesAgo(130),
    updatedAt: publishedMinutesAgo(130),
    curation: { kind: "original", reviewedByHuman: true, updatedAt: publishedMinutesAgo(130) },
    sponsored: false,
    viewCount: 3_800,
    commentCount: 21,
    body: [
      {
        type: "paragraph",
        text: "O monitoramento do peixe-boi marinho em Cajueiro da Praia registrou 12 animais nesta temporada, dois deles filhotes, na área de Barra Grande.",
      },
      {
        type: "paragraph",
        text: "O levantamento é feito por sobrevoo e por observação de superfície, em parceria entre o ICMBio e pesquisadores da região.",
      },
    ],
  },

  {
    id: "news-10",
    slug: "buriti-dos-lopes-aprova-reajuste-do-piso-dos-agentes-de-saude",
    headline: "Buriti dos Lopes aprova reajuste do piso dos agentes de saúde",
    standfirst: "Texto passou por 9 votos a 2 e vale a partir da folha de setembro.",
    categorySlug: "politica",
    tone: "brand",
    authorSlug: "marina-sousa",
    municipalityIbgeCode: "2202101",
    neighborhoodIds: [],
    publishedAt: publishedMinutesAgo(165),
    updatedAt: publishedMinutesAgo(165),
    curation: { kind: "original", reviewedByHuman: true, updatedAt: publishedMinutesAgo(165) },
    sponsored: false,
    viewCount: 3_200,
    commentCount: 33,
    body: [
      {
        type: "paragraph",
        text: "A Câmara de Buriti dos Lopes aprovou por 9 votos a 2 o reajuste do piso dos agentes comunitários de saúde do município. A mudança vale a partir da folha de setembro.",
      },
      {
        type: "paragraph",
        text: "O texto seguiu para sanção do Executivo, que tem quinze dias úteis para publicá-lo no Diário Oficial do município.",
      },
    ],
  },

  {
    id: "news-11",
    slug: "porto-das-barcas-tera-feira-noturna-fixa-nas-sextas-de-agosto",
    headline: "Porto das Barcas terá feira noturna fixa nas sextas de agosto",
    standfirst: "Trinta expositores e programação musical das 18h à meia-noite.",
    categorySlug: "cultura",
    tone: "highlight",
    authorSlug: "ana-beatriz-melo",
    municipalityIbgeCode: "2207702",
    neighborhoodIds: ["parnaiba:porto-das-barcas"],
    publishedAt: publishedMinutesAgo(190),
    updatedAt: publishedMinutesAgo(190),
    curation: { kind: "original", reviewedByHuman: true, updatedAt: publishedMinutesAgo(190) },
    sponsored: false,
    viewCount: 2_900,
    commentCount: 5,
    body: [
      {
        type: "paragraph",
        text: "Os armazéns do Porto das Barcas passam a receber feira noturna em todas as sextas-feiras de agosto, das 18h à meia-noite, com trinta expositores.",
      },
      {
        type: "paragraph",
        text: "A programação musical fica a cargo de grupos locais e ocupa o palco do pátio central a partir das 19h30.",
      },
    ],
  },

  {
    id: "news-12",
    slug: "sine-de-parnaiba-abre-74-vagas-com-carteira-assinada-nesta-semana",
    headline: "Sine de Parnaíba abre 74 vagas com carteira assinada nesta semana",
    standfirst: "Maioria para comércio e logística; atendimento por ordem de chegada.",
    categorySlug: "emprego",
    tone: "standard",
    authorSlug: "rafael-coelho",
    municipalityIbgeCode: "2207702",
    neighborhoodIds: ["parnaiba:centro"],
    publishedAt: publishedMinutesAgo(210),
    updatedAt: publishedMinutesAgo(210),
    curation: { kind: "original", reviewedByHuman: true, updatedAt: publishedMinutesAgo(210) },
    sponsored: false,
    viewCount: 2_400,
    commentCount: 12,
    body: [
      {
        type: "paragraph",
        text: "O Sine de Parnaíba divulgou 74 vagas com carteira assinada nesta semana, a maior parte para comércio e logística. O atendimento é por ordem de chegada, das 7h30 às 13h.",
      },
      {
        type: "paragraph",
        text: "É preciso levar carteira de trabalho, documento com foto e comprovante de residência. Vagas que exigem CNH estão sinalizadas no painel da unidade.",
      },
    ],
  },
]);
