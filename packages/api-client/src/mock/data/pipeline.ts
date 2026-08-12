import type { PipelineStage } from "@parnaibadigital/types";

/**
 * T092 / Princípio V — as 8 etapas do pipeline editorial, **na ordem fixa**.
 *
 * A etapa 7, "Editor", é o motivo de este arquivo existir como dado tipado e não como um
 * array solto dentro da tela: `requiresHumanReview` é `true` ali e em nenhum outro lugar, e
 * a tela do pipeline (T100) usa esse campo para garantir que a animação **nunca pule** a
 * revisão humana. Uma lista de rótulos não conseguiria sustentar essa garantia.
 *
 * O `order` é explícito e não implícito pelo índice do array: reordenar o array por engano
 * mudaria a sequência sem que nada acusasse, e a ordem aqui é regra editorial, não
 * apresentação.
 */
export const pipelineStages: readonly PipelineStage[] = Object.freeze([
  {
    order: 1,
    key: "documento-encontrado",
    label: "Documento encontrado",
    icon: "search",
    description: "Varredura dos diários oficiais e das fontes locais, a cada 30 minutos.",
    requiresHumanReview: false,
  },
  {
    order: 2,
    key: "analise",
    label: "Análise",
    icon: "sparkles",
    description: "Classificação de órgão, tipo de ato e relevância local.",
    requiresHumanReview: false,
  },
  {
    order: 3,
    key: "resumo",
    label: "Resumo",
    icon: "sparkles",
    description: "Resumo de três parágrafos em linguagem simples.",
    requiresHumanReview: false,
  },
  {
    order: 4,
    key: "reescrita",
    label: "Reescrita",
    icon: "sparkles",
    description: "Título no padrão [Bairro] + fato e lide de 20 palavras.",
    requiresHumanReview: false,
  },
  {
    order: 5,
    key: "seo",
    label: "SEO",
    icon: "search",
    description: "Slug, meta description e schema NewsArticle com vínculo geográfico.",
    requiresHumanReview: false,
  },
  {
    order: 6,
    key: "imagem",
    label: "Imagem",
    icon: "image",
    description: "Seleção no acervo local e crédito automático.",
    requiresHumanReview: false,
  },
  {
    // A única etapa que a automação não atravessa sozinha. Não é configurável.
    order: 7,
    key: "editor",
    label: "Editor — revisão humana obrigatória",
    icon: "badge-check",
    description:
      "Nenhum texto assistido por automação é publicado sem que uma pessoa da redação o aprove.",
    requiresHumanReview: true,
  },
  {
    order: 8,
    key: "publicado",
    label: "Publicado",
    icon: "external-link",
    description: "Publicação no portal, feeds RSS, newsletter e alertas.",
    requiresHumanReview: false,
  },
]);
