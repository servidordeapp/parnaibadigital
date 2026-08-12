import type { Company } from "@parnaibadigital/types";

/**
 * T055 / FR-016 — as 6 empresas do guia comercial do protótipo.
 *
 * A empresa se localiza por **bairro**, não por município: o município vem por
 * transitividade do registro de bairros (regra 1 de `data-model.md`). Guardar o município
 * também aqui criaria duas fontes para o mesmo fato, e a segunda seria a que ficaria
 * desatualizada.
 *
 * `openingStatus` é enumeração, não a frase do protótipo ("Aberto até 23h"). A frase é
 * apresentação e depende da hora de quem lê; o estado é dado. Traduzir um no outro é da
 * tela — FR-026 mantém regra fora do componente e, aqui, fora do dado também.
 */
export const companies: readonly Company[] = Object.freeze([
  {
    id: "company-01",
    slug: "restaurante-delta-mar",
    name: "Restaurante Delta Mar",
    categorySlug: "restaurante",
    neighborhoodId: "parnaiba:porto-das-barcas",
    rating: 4.8,
    reviewCount: 412,
    phone: "(86) 3322-7710",
    openingStatus: "aberto",
  },
  {
    id: "company-02",
    slug: "otica-visao-litoral",
    name: "Ótica Visão Litoral",
    categorySlug: "comercio",
    neighborhoodId: "parnaiba:centro",
    rating: 4.6,
    reviewCount: 128,
    phone: "(86) 3321-4502",
    openingStatus: "aberto",
  },
  {
    id: "company-03",
    slug: "auto-center-sao-jose",
    name: "Auto Center São José",
    categorySlug: "servicos",
    neighborhoodId: "parnaiba:sao-jose",
    rating: 4.4,
    reviewCount: 96,
    phone: "(86) 99811-2244",
    openingStatus: "fecha_em_breve",
  },
  {
    id: "company-04",
    slug: "clinica-vida-parnaiba",
    name: "Clínica Vida Parnaíba",
    categorySlug: "saude",
    neighborhoodId: "parnaiba:reis-veloso",
    rating: 4.9,
    reviewCount: 233,
    phone: "(86) 3323-1180",
    openingStatus: "aberto",
  },
  {
    id: "company-05",
    slug: "pousada-porto-das-barcas",
    name: "Pousada Porto das Barcas",
    categorySlug: "hospedagem",
    neighborhoodId: "parnaiba:centro",
    rating: 4.7,
    reviewCount: 182,
    phone: "(86) 3322-1180",
    openingStatus: "aberto",
  },
  {
    id: "company-06",
    slug: "mercado-boa-praca",
    name: "Mercado Boa Praça",
    categorySlug: "supermercado",
    neighborhoodId: "parnaiba:nossa-senhora-de-fatima",
    rating: 4.2,
    reviewCount: 341,
    phone: "(86) 3321-9977",
    openingStatus: "aberto",
  },
]);
