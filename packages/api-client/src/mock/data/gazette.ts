import type { OfficialGazetteDocument } from "@parnaibadigital/types";

/**
 * T055 / FR-016 / Princípio V — os 6 documentos oficiais, **dois deles sem matéria
 * associada**.
 *
 * Os dois órfãos não são lacuna: são o edge case que a spec manda representar, e cada um
 * demonstra um motivo diferente e legítimo de um documento não ter virado texto.
 *   - `doc-03` está **publicado** e simplesmente não rendeu matéria. A tela precisa
 *     mostrá-lo assim, sem inventar vínculo.
 *   - `doc-04` está em **`fila_ia`**: ainda não passou pela revisão humana, e por isso
 *     ainda não pode ter matéria. Fabricar um link aqui seria representar a etapa de editor
 *     como se tivesse acontecido — exatamente o que o Princípio V proíbe.
 *
 * `sourceRef` nunca é opcional. Um resumo gerado por automação sem link para o original é
 * afirmação sem prova, e o produto inteiro se apoia no oposto disso.
 *
 * **Desvio consciente do protótipo**: o quinto documento do protótipo ("Resolução nº 22/2026",
 * audiências de mobilidade) nomeia uma matéria que não existe entre os 12 artigos. Mantê-lo
 * como está produziria um link para 404 — pior que o desvio. Ele foi trocado por uma portaria
 * do mesmo município que governa um fato **que existe** no conjunto (a coleta seletiva do
 * bairro Piauí), preservando a contagem de 6 documentos e os 2 órfãos exigidos.
 */
export const gazette: readonly OfficialGazetteDocument[] = Object.freeze([
  {
    id: "doc-01",
    number: "Portaria nº 412/2026",
    agency: "Prefeitura de Parnaíba",
    department: "Secretaria de Trânsito",
    publishedAt: "2026-08-04",
    type: "portaria",
    summary:
      "Autoriza a interdição parcial da Rua Grande, no Centro, entre os dias 4 e 8 de agosto, para obra de drenagem, com desvio obrigatório pela Duque de Caxias.",
    status: "publicado",
    sourceRef: {
      documentId: "PMP-2026-412",
      sourceUrl: "https://diariooficial.parnaiba.pi.gov.br.example.com/2026/portaria-412",
    },
    generatedNewsSlug: "centro-tem-bloqueio-na-rua-grande-ate-sexta-por-obra-de-drenagem",
  },
  {
    id: "doc-02",
    number: "Edital nº 07/2026",
    agency: "Prefeitura de Luís Correia",
    department: "Secretaria de Administração",
    publishedAt: "2026-08-04",
    type: "edital",
    summary:
      "Abre processo seletivo simplificado para 42 vagas temporárias de salva-vidas e agentes de apoio para a temporada de praia.",
    status: "em_revisao",
    sourceRef: {
      documentId: "PMLC-2026-07",
      sourceUrl: "https://diariooficial.luiscorreia.pi.gov.br.example.com/2026/edital-07",
    },
    generatedNewsSlug: "pedra-do-sal-tera-reforco-de-salva-vidas-no-feriado-do-dia-15",
  },
  {
    id: "doc-03",
    number: "Aviso de Licitação nº 118/2026",
    agency: "Prefeitura de Parnaíba",
    department: "Secretaria de Educação",
    publishedAt: "2026-08-03",
    type: "licitacao",
    summary:
      "Pregão eletrônico para aquisição de 12 mil kits escolares, com sessão pública em 19 de agosto, valor estimado de R$ 2,4 milhões.",
    status: "publicado",
    sourceRef: {
      documentId: "PMP-2026-118",
      sourceUrl: "https://diariooficial.parnaiba.pi.gov.br.example.com/2026/licitacao-118",
    },
    // Órfão 1 — publicado e sem matéria. Estado legítimo.
  },
  {
    id: "doc-04",
    number: "Decreto nº 3.981/2026",
    agency: "Governo do Piauí",
    department: "Casa Civil",
    publishedAt: "2026-08-03",
    type: "decreto",
    summary:
      "Declara situação de atenção hídrica em cinco municípios do litoral e libera o uso de recursos do fundo estadual de emergência.",
    status: "fila_ia",
    sourceRef: {
      documentId: "PI-2026-3981",
      sourceUrl: "https://diariooficial.pi.gov.br.example.com/2026/decreto-3981",
    },
    // Órfão 2 — ainda na fila, antes da revisão humana. Não pode ter matéria.
  },
  {
    id: "doc-05",
    number: "Portaria nº 388/2026",
    agency: "Prefeitura de Parnaíba",
    department: "Secretaria de Serviços Urbanos",
    publishedAt: "2026-08-02",
    type: "portaria",
    summary:
      "Reorganiza a coleta seletiva do bairro Piauí em dois turnos, com efeito a partir da segunda-feira seguinte à publicação.",
    status: "publicado",
    sourceRef: {
      documentId: "PMP-2026-388",
      sourceUrl: "https://diariooficial.parnaiba.pi.gov.br.example.com/2026/portaria-388",
    },
    generatedNewsSlug: "bairro-piaui-passa-a-ter-coleta-seletiva-em-dois-turnos",
  },
  {
    id: "doc-06",
    number: "Extrato de Contrato nº 55/2026",
    agency: "Prefeitura de Ilha Grande",
    department: "Secretaria de Infraestrutura",
    publishedAt: "2026-08-01",
    type: "contrato",
    summary:
      "Contrata serviço de dragagem do canal de acesso ao Porto dos Tatus, no valor de R$ 890 mil, com prazo de 120 dias.",
    status: "arquivado",
    sourceRef: {
      documentId: "PMIG-2026-55",
      sourceUrl: "https://diariooficial.ilhagrande.pi.gov.br.example.com/2026/contrato-55",
    },
    generatedNewsSlug: "ilha-grande-amplia-horario-do-ferry-para-o-porto-dos-tatus",
  },
]);
