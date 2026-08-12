/**
 * D-10 / Princípio VII — o contrato OpenAPI é a fonte de verdade dos tipos.
 *
 * Nada aqui é escrito à mão a partir do que uma tela precisa: os aliases abaixo são
 * reexportações do arquivo gerado por `pnpm types:generate`. Se o contrato mudar e alguém
 * esquecer de regerar, o teste de T025 reprova a construção.
 *
 * Quatro entidades NÃO vêm do contrato, e é deliberado: `AdSlot`, `PipelineStage`,
 * `AnalyticsMetric` e `User` não são recursos de leitura da API pública — são estruturas de
 * apresentação do painel, definidas em `data-model.md`. Colocá-las no OpenAPI declararia
 * uma superfície de API que esta fase não tem (FR-038) e que o Princípio VII não pede.
 */
import type { components } from "./generated/api-v1";

type Schemas = components["schemas"];

/* ————————————————— Eixo geográfico (FR-021) ————————————————— */

/** Município. Identidade canônica é o `ibgeCode` — nunca o slug, nunca o nome. */
export type Municipality = Schemas["Municipality"];

/** Bairro. `id` é composto e estável (`{municipalitySlug}:{slug}`), o que torna
 *  bairro homônimo em municípios diferentes distinguível sem ambiguidade. */
export type Neighborhood = Schemas["Neighborhood"];

/* ————————————————— Conteúdo editorial ————————————————— */

/** Notícia completa. `municipalityIbgeCode` é obrigatório: conteúdo sem vínculo
 *  geográfico primário não compila (User Story 3, cenário 3). */
export type News = Schemas["News"];

/** Projeção de listagem — o que card, hero e feed consomem. */
export type NewsSummary = Schemas["NewsSummary"];

export type Category = Schemas["Category"];
export type Author = Schemas["Author"];

/** Bloco tipado de corpo de matéria. Nunca HTML cru vindo do cliente. */
export type ContentBlock = Schemas["ContentBlock"];

/** Selo de curadoria — obrigatório em toda superfície de notícia (FR-018, Princípio V). */
export type CurationStamp = Schemas["CurationStamp"];

/** Atribuição legal. Obrigatória quando `curation.kind = "curated"`. */
export type Attribution = Schemas["Attribution"];

/** Referência de mídia. `alt`, `width` e `height` são obrigatórios — o primeiro por
 *  acessibilidade (Princípio III), os outros dois contra layout shift (Princípio I). */
export type MediaRef = Schemas["MediaRef"];

export type Tone = Schemas["Tone"];
export type Slug = Schemas["Slug"];

/* ————————————————— Diário Oficial ————————————————— */

/** Documento oficial. `sourceRef` nunca é opcional (Princípio V), e
 *  `generatedNewsSlug` ausente é estado legítimo — nem todo documento vira matéria. */
export type OfficialGazetteDocument = Schemas["OfficialGazetteDocument"];

/** Máquina de estados do documento. Não existe aresta de `fila_ia` para `publicado`:
 *  a revisão humana não é pulável nem na representação (Princípio V). */
export type GazetteStatus = Schemas["GazetteStatus"];
export type GazetteType = Schemas["GazetteType"];

/* ————————————————— Superfícies de serviço ————————————————— */

export type Event = Schemas["Event"];
export type Company = Schemas["Company"];
export type UtilityItem = Schemas["UtilityItem"];
export type UtilityGroup = Schemas["UtilityGroup"];
export type SearchResult = Schemas["SearchResult"];

/* ————————————————— Envelopes ————————————————— */

export type Paginated = Schemas["Paginated"];
export type Problem = Schemas["Problem"];

/* ———————— Estruturas de apresentação (fora do contrato, por desenho) ———————— */

/**
 * Slot de anúncio. Dimensões vêm sempre dos tokens `--ad-*` — é o que garante altura
 * reservada e zero layout shift (Princípio I, FR-032). Nenhuma rede real é associada
 * nesta fase (FR-038): o slot é uma caixa rotulada, não um anúncio.
 */
export interface AdSlot {
  placement: "top" | "in-feed" | "sidebar" | "in-article";
  format: "leaderboard" | "billboard" | "rectangle" | "halfpage" | "inread" | "mobileBanner";
  /** Largura em token CSS, ex. `var(--ad-rect-w)`. */
  width: string;
  /** Altura em token CSS, ex. `var(--ad-rect-h)`. */
  height: string;
  label: string;
  sticky?: boolean;
}

/**
 * Etapa do pipeline editorial. A ordem é fixa e a etapa 7 — "Editor, revisão humana
 * obrigatória" — nunca é omitida na renderização, mesmo durante a animação (Princípio V).
 */
export interface PipelineStage {
  order: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  key:
    | "documento-encontrado"
    | "analise"
    | "resumo"
    | "reescrita"
    | "seo"
    | "imagem"
    | "editor"
    | "publicado";
  label: string;
  /** Nome do glifo no vocabulário fixo do DS. */
  icon: string;
  description: string;
  /** `true` apenas na etapa "editor": marca o ponto que a automação não atravessa sozinha. */
  requiresHumanReview: boolean;
}

/** Métrica do Dashboard e do Analytics. Existe só para reproduzir as telas. */
export interface AnalyticsMetric {
  key: string;
  label: string;
  value: string;
  /** Variação no período, já formatada em pt-BR (ex.: "+12,4%"). */
  delta: string;
  period: string;
}

/**
 * Usuário do painel. **Sem autenticação, sem sessão, sem permissão efetiva** (FR-038):
 * `role` é rótulo exibido na tela de Usuários, não uma decisão de acesso.
 */
export interface User {
  id: string;
  name: string;
  role: "admin" | "editor" | "redator" | "revisor";
  status: "ativo" | "inativo";
}

/** Assinatura de newsletter. O formulário submete por HTML nativo e nada é enviado (FR-038). */
export interface NewsletterSubscription {
  channel: "email" | "whatsapp";
  destination: string;
}

export type { components, paths } from "./generated/api-v1";
