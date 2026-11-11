import type { UtilityItem } from "@parnaibadigital/types";

/**
 * T055 / FR-016 — os 4 grupos de utilidade pública do protótipo.
 *
 * Os grupos são fechados pelo contrato (`UtilityGroup`): concursos, empregos, licitações e
 * editais. A tela renderiza uma aba por grupo e precisa mostrar **estado vazio por grupo**
 * (T072) — por isso a lista não é achatada num único array sem rótulo: sem o campo `group`
 * a tela não teria como distinguir "grupo sem item" de "grupo inexistente", e as duas coisas
 * pedem telas diferentes.
 *
 * `amount` fica em número; a formatação em reais é da tela. O protótipo escreve "R$ 2,4 mi"
 * e "R$ 3.2k" — abreviações de apresentação que, guardadas como texto, impediriam ordenar,
 * comparar ou somar qualquer coisa depois.
 */
export const utilities: readonly UtilityItem[] = Object.freeze([
  /* ——— Concursos ——— */
  {
    id: "util-concurso-01",
    group: "concursos",
    agency: "Prefeitura de Parnaíba",
    title: "Concurso público para 180 vagas na Educação",
    detail:
      "Professores, cuidadores e auxiliares administrativos. Provas em 27 de setembro, em Parnaíba.",
    amount: 2400,
    statusBadge: "Inscrições abertas",
  },
  {
    id: "util-concurso-02",
    group: "concursos",
    agency: "Governo do Piauí",
    title: "Seletivo da Sesapi para 64 vagas na região do litoral",
    detail: "Enfermeiros, técnicos e agentes de vigilância para Parnaíba e Luís Correia.",
    amount: 3200,
    statusBadge: "Inscrições abertas",
  },
  {
    id: "util-concurso-03",
    group: "concursos",
    agency: "Prefeitura de Luís Correia",
    title: "Resultado final do seletivo de salva-vidas sai nesta sexta",
    detail: "42 aprovados serão convocados antes do feriado do dia 15.",
    amount: 1800,
    statusBadge: "Resultado",
  },
  {
    id: "util-concurso-04",
    group: "concursos",
    agency: "Câmara de Parnaíba",
    title: "Concurso da Câmara homologa 12 aprovados",
    detail: "Convocação prevista para a primeira semana de setembro.",
    amount: 4000,
    statusBadge: "Homologado",
  },

  /* ——— Empregos ——— */
  {
    id: "util-emprego-01",
    group: "empregos",
    agency: "Sine Parnaíba",
    title: "Auxiliar de logística — Nossa Senhora de Fátima",
    detail: "Distribuidora Delta · escala 6x1, com vale-transporte e cesta básica.",
    amount: 1600,
    statusBadge: "8 vagas",
  },
  {
    id: "util-emprego-02",
    group: "empregos",
    agency: "Sine Parnaíba",
    title: "Recepcionista bilíngue — Centro",
    detail: "Pousada Porto das Barcas · inglês intermediário, turno de 12h.",
    amount: 1900,
    statusBadge: "2 vagas",
  },
  {
    id: "util-emprego-03",
    group: "empregos",
    agency: "Sine Luís Correia",
    title: "Garçom para a temporada de praia — Pedra do Sal",
    detail: "Contrato temporário de 90 dias, com possibilidade de efetivação.",
    amount: 1500,
    statusBadge: "14 vagas",
  },
  {
    id: "util-emprego-04",
    group: "empregos",
    agency: "Sine Parnaíba",
    title: "Vendedor externo — bairro Piauí",
    detail: "Casa do Construtor · exige CNH categoria B.",
    amount: 1400,
    statusBadge: "4 vagas",
  },

  /* ——— Licitações ——— */
  {
    id: "util-licitacao-01",
    group: "licitacoes",
    agency: "Prefeitura de Parnaíba",
    title: "Pregão eletrônico de 12 mil kits escolares",
    detail: "Sessão pública em 19 de agosto, às 09h, pelo portal de compras.",
    amount: 2_400_000,
    statusBadge: "Pregão",
  },
  {
    id: "util-licitacao-02",
    group: "licitacoes",
    agency: "Prefeitura de Ilha Grande",
    title: "Dragagem do canal de acesso ao Porto dos Tatus",
    detail: "Contrato de 120 dias com fiscalização da Secretaria de Infraestrutura.",
    amount: 890_000,
    statusBadge: "Dispensa",
  },
  {
    id: "util-licitacao-03",
    group: "licitacoes",
    agency: "Prefeitura de Luís Correia",
    title: "Locação de 6 ambulâncias para a temporada",
    detail: "Atendimento nas praias de Atalaia, Coqueiro e Pedra do Sal.",
    amount: 1_100_000,
    statusBadge: "Pregão",
  },

  /* ——— Editais ——— */
  {
    id: "util-edital-01",
    group: "editais",
    agency: "Fundação Municipal de Cultura",
    title: "Edital de fomento para 30 projetos culturais",
    detail: "Música, teatro, audiovisual e cultura popular do litoral.",
    amount: 40_000,
    statusBadge: "Cultura",
  },
  {
    id: "util-edital-02",
    group: "editais",
    agency: "Prefeitura de Parnaíba",
    title: "Cadastro habitacional para 240 unidades no Frei Higino",
    detail: "Atendimento por ordem de chegada na sede da secretaria.",
    statusBadge: "Habitação",
  },
  {
    id: "util-edital-03",
    group: "editais",
    agency: "Governo do Piauí",
    title: "Chamada pública de monitoramento do peixe-boi",
    detail: "Parceria com ICMBio para Cajueiro da Praia e Barra Grande.",
    amount: 320_000,
    statusBadge: "Meio ambiente",
  },
]);
