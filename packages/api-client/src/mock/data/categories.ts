import type { Category } from "@parnaibadigital/types";

/**
 * T054 / FR-016 — as 12 editorias do protótipo.
 *
 * `tone` não é enfeite: é o que decide a cor do kicker no card e no cabeçalho de seção. O DS
 * define quatro tons e apenas quatro (`urgent`, `brand`, `highlight`, `standard`), e a
 * distribuição abaixo é a do protótipo — "Urgente" é o único tom vermelho, e o laranja
 * (`highlight`) fica reservado às editorias de litoral, Delta e cultura, que são as que a
 * marca trata como calor local.
 *
 * Editoria nova entra aqui e aparece sozinha na navegação, no sitemap de seções e no RSS
 * por editoria — nenhuma dessas listas é escrita à mão (FR-030).
 */
export const categories: readonly Category[] = Object.freeze([
  { slug: "urgente", name: "Urgente", tone: "urgent" },
  { slug: "transito", name: "Trânsito", tone: "brand" },
  { slug: "litoral", name: "Litoral", tone: "highlight" },
  { slug: "saude", name: "Saúde", tone: "brand" },
  { slug: "servicos", name: "Serviços", tone: "brand" },
  { slug: "educacao", name: "Educação", tone: "brand" },
  { slug: "economia", name: "Economia", tone: "brand" },
  { slug: "delta", name: "Delta", tone: "highlight" },
  { slug: "meio-ambiente", name: "Meio ambiente", tone: "brand" },
  { slug: "politica", name: "Política", tone: "brand" },
  { slug: "cultura", name: "Cultura", tone: "highlight" },
  { slug: "emprego", name: "Emprego", tone: "standard" },
]);
