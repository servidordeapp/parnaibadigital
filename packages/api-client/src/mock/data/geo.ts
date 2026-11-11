import type { Neighborhood } from "@parnaibadigital/types";

/**
 * T053 / FR-021 — os 9 bairros do protótipo, **sempre qualificados pelo município**.
 *
 * `id` é composto (`{municipioSlug}:{bairroSlug}`) e não por gosto de formato: bairro
 * homônimo em municípios diferentes é o caso normal no litoral do Piauí, e um identificador
 * que fosse só o nome faria "Centro" de Parnaíba e "Centro" de Luís Correia colidirem sem
 * ninguém perceber — a matéria apareceria no bairro errado, com a geografia errada no
 * JSON-LD. O par município+bairro é a menor unidade que identifica sem ambiguidade.
 *
 * Nem todo município tem bairro aqui, e isso é fiel ao protótipo: Cajueiro da Praia e
 * Buriti dos Lopes aparecem com matéria de nível municipal. É o edge case de conteúdo sem
 * bairro (T066), não uma lacuna de dados.
 */
export const neighborhoods: readonly Neighborhood[] = Object.freeze([
  /* ——— Parnaíba (2207702) — 7 bairros ——— */
  {
    id: "parnaiba:centro",
    name: "Centro",
    slug: "centro",
    municipalityIbgeCode: "2207702",
  },
  {
    id: "parnaiba:sao-jose",
    name: "São José",
    slug: "sao-jose",
    municipalityIbgeCode: "2207702",
  },
  {
    id: "parnaiba:nossa-senhora-de-fatima",
    name: "Nossa Senhora de Fátima",
    slug: "nossa-senhora-de-fatima",
    municipalityIbgeCode: "2207702",
  },
  {
    id: "parnaiba:piaui",
    name: "Piauí",
    slug: "piaui",
    municipalityIbgeCode: "2207702",
  },
  {
    id: "parnaiba:frei-higino",
    name: "Frei Higino",
    slug: "frei-higino",
    municipalityIbgeCode: "2207702",
  },
  {
    id: "parnaiba:reis-veloso",
    name: "Reis Veloso",
    slug: "reis-veloso",
    municipalityIbgeCode: "2207702",
  },
  {
    id: "parnaiba:porto-das-barcas",
    name: "Porto das Barcas",
    slug: "porto-das-barcas",
    municipalityIbgeCode: "2207702",
  },

  /* ——— Luís Correia (2205805) ——— */
  {
    id: "luis-correia:pedra-do-sal",
    name: "Pedra do Sal",
    slug: "pedra-do-sal",
    municipalityIbgeCode: "2205805",
  },

  /* ——— Ilha Grande (2204550) ——— */
  {
    id: "ilha-grande:porto-dos-tatus",
    name: "Porto dos Tatus",
    slug: "porto-dos-tatus",
    municipalityIbgeCode: "2204550",
  },
]);
