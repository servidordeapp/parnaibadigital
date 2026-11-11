import { MUNICIPALITIES } from "@parnaibadigital/api-client";
import {
  categories,
  gazette,
  neighborhoods,
  news,
} from "@parnaibadigital/api-client/mock/data/index";
import type { OfficialGazetteDocument } from "@parnaibadigital/types";

/**
 * As 14 superfícies públicas de `contracts/routes.md`, num lugar só.
 *
 * Repetir a lista em cada spec garantiria que, com o tempo, um teste checasse 13 e outro 14
 * sem ninguém notar. Aqui uma rota nova é adicionada uma vez e passa a ser exigida por
 * superfície, tema, ausência de JavaScript, SEO e acessibilidade ao mesmo tempo.
 *
 * As rotas dinâmicas são **derivadas dos dados**, nunca escritas à mão — é a mesma regra
 * que SC-010 impõe à aplicação. Um teste com `/parnaiba` fixo continuaria passando depois
 * de o município sair do registro, e é justamente essa a falha que ele deveria pegar.
 */

export interface Surface {
  /** Nome como aparece em `contracts/routes.md`. */
  name: string;
  path: string;
  /** Tipos de JSON-LD exigidos pelo contrato (Princípio II). */
  schema: string[];
  /** `false` em `/busca`, único caso `noindex,follow` do portal público. */
  indexable: boolean;
}

/** Superfícies de rota fixa — existem com ou sem dado demonstrativo. */
export const STATIC_SURFACES: readonly Surface[] = [
  { name: "Home", path: "/", schema: ["WebSite", "Organization"], indexable: true },
  { name: "Busca", path: "/busca", schema: ["WebSite"], indexable: false },
  { name: "Eventos", path: "/eventos", schema: ["ItemList", "BreadcrumbList"], indexable: true },
  {
    name: "Utilidade pública",
    path: "/utilidade-publica",
    schema: ["CollectionPage"],
    indexable: true,
  },
  { name: "Diário Oficial", path: "/diario-oficial", schema: ["CollectionPage"], indexable: true },
  { name: "Empresas", path: "/empresas", schema: ["ItemList"], indexable: true },
  { name: "Anunciante", path: "/anuncie", schema: ["WebPage", "Organization"], indexable: true },
  { name: "Newsletter", path: "/newsletter", schema: ["WebPage"], indexable: true },
];

/**
 * Superfícies cujo endereço vem do conteúdo. Uma amostra por tipo basta ao percurso — a
 * cobertura exaustiva de cada artigo é do sitemap (T082), não deste teste.
 *
 * Retorna vazio enquanto os dados demonstrativos de T052–T055 não existirem, e é por isso
 * que `public-surfaces.spec.ts` afirma separadamente que as 14 superfícies foram alcançadas:
 * uma lista dinâmica vazia não pode passar por cobertura completa.
 */
export function dynamicSurfaces(): Surface[] {
  const surfaces: Surface[] = [];

  const article = news[0];
  if (article !== undefined) {
    surfaces.push({
      name: "Notícia",
      path: `/noticia/${article.slug}`,
      schema: ["NewsArticle", "BreadcrumbList"],
      indexable: true,
    });
    surfaces.push({
      name: "Autor",
      path: `/autor/${article.authorSlug}`,
      schema: ["ProfilePage", "Person"],
      indexable: true,
    });
  }

  const category = categories[0];
  if (category !== undefined) {
    surfaces.push({
      name: "Editoria",
      path: `/editoria/${category.slug}`,
      schema: ["CollectionPage", "BreadcrumbList"],
      indexable: true,
    });
  }

  const municipality = MUNICIPALITIES[0];
  if (municipality !== undefined) {
    surfaces.push({
      name: "Município (hub)",
      path: `/${municipality.slug}`,
      schema: ["Place", "CollectionPage", "BreadcrumbList"],
      indexable: true,
    });
  }

  const neighborhood = neighborhoods[0];
  const parent = MUNICIPALITIES.find((m) => m.ibgeCode === neighborhood?.municipalityIbgeCode);
  if (neighborhood !== undefined && parent !== undefined) {
    surfaces.push({
      name: "Bairro",
      path: `/${parent.slug}/${neighborhood.slug}`,
      schema: ["Place", "BreadcrumbList"],
      indexable: true,
    });
  }

  return surfaces;
}

export function publicSurfaces(): Surface[] {
  return [...STATIC_SURFACES, ...dynamicSurfaces()];
}

/** Quantas superfícies o contrato exige, sem a tela de erro, que não tem rota navegável. */
export const EXPECTED_PUBLIC_SURFACE_COUNT = 13;

/** Todo hub de município, para SC-010: nenhuma rota de município é codificada. */
export function municipalityPaths(): string[] {
  return MUNICIPALITIES.map((municipality) => `/${municipality.slug}`);
}

/**
 * Documentos oficiais sem matéria associada. `generatedNewsSlug` ausente é estado legítimo
 * (Princípio V): a tela precisa representá-lo sem inventar vínculo.
 */
export function orphanGazetteDocuments(): readonly OfficialGazetteDocument[] {
  return gazette.filter((document) => document.generatedNewsSlug === undefined);
}
