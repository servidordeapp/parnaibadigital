import type { Municipality } from "@parnaibadigital/types";

/**
 * D-13 / SC-009 / SC-010 — registro canônico de municípios.
 *
 * Este arquivo é o único lugar do repositório que sabe quais municípios existem.
 * `getStaticPaths()` do hub, os feeds RSS por município, o sitemap de lugares e a validação
 * de colisão de slug leem daqui. É isso que faz "acrescentar um município é editar um
 * registro e nada mais" (SC-010) ser verdade em vez de promessa — se alguma tela
 * codificasse `parnaiba` na rota, a promessa quebraria em silêncio.
 *
 * A identidade é o `ibgeCode`, nunca o slug: slug é endereço e pode mudar (com 301);
 * código IBGE é a identidade do município no Brasil e não muda.
 */
export const MUNICIPALITIES: readonly Municipality[] = Object.freeze([
  {
    ibgeCode: "2207702",
    name: "Parnaíba",
    slug: "parnaiba",
    state: "PI",
    newsCount: 0,
    latitude: -2.9055,
    longitude: -41.7767,
  },
  {
    ibgeCode: "2205805",
    name: "Luís Correia",
    slug: "luis-correia",
    state: "PI",
    newsCount: 0,
    latitude: -2.8792,
    longitude: -41.6669,
  },
  {
    ibgeCode: "2204550",
    name: "Ilha Grande",
    slug: "ilha-grande",
    state: "PI",
    newsCount: 0,
    latitude: -2.8419,
    longitude: -41.8253,
  },
  {
    ibgeCode: "2202101",
    name: "Buriti dos Lopes",
    slug: "buriti-dos-lopes",
    state: "PI",
    newsCount: 0,
    latitude: -3.1758,
    longitude: -41.8672,
  },
  {
    ibgeCode: "2202174",
    name: "Cajueiro da Praia",
    slug: "cajueiro-da-praia",
    state: "PI",
    newsCount: 0,
    latitude: -2.9333,
    longitude: -41.34,
  },
]);

/** Município padrão da home, conforme `contracts/routes.md`. */
export const DEFAULT_MUNICIPALITY_IBGE_CODE = "2207702";

/**
 * Rotas que o portal já ocupa. Um município cujo slug caia aqui tornaria a rota ambígua:
 * `/eventos` seria ao mesmo tempo a tela de eventos e o hub de um município chamado
 * "Eventos". A colisão reprova a construção (SC-009) em vez de escolher uma das duas.
 *
 * Fonte: `contracts/routes.md`, seção "Rotas reservadas".
 */
export const RESERVED_ROUTES: readonly string[] = Object.freeze([
  "noticia",
  "editoria",
  "busca",
  "eventos",
  "utilidade-publica",
  "diario-oficial",
  "empresas",
  "anuncie",
  "autor",
  "newsletter",
  "componentes",
  "rss",
  "robots.txt",
  "api",
  "_astro",
  "assets",
  "admin",
  "404",
]);

/** `sitemap-*` é família, não rota única — por isso prefixo, não igualdade. */
export const RESERVED_ROUTE_PREFIXES: readonly string[] = Object.freeze(["sitemap-", "sitemap."]);

export function isReservedRoute(slug: string): boolean {
  return (
    RESERVED_ROUTES.includes(slug) ||
    RESERVED_ROUTE_PREFIXES.some((prefix) => slug.startsWith(prefix))
  );
}

export function findMunicipalityBySlug(slug: string): Municipality | undefined {
  return MUNICIPALITIES.find((municipality) => municipality.slug === slug);
}

export function findMunicipalityByIbgeCode(ibgeCode: string): Municipality | undefined {
  return MUNICIPALITIES.find((municipality) => municipality.ibgeCode === ibgeCode);
}

export interface SlugConflict {
  slug: string;
  ibgeCode: string;
  reason: "rota-reservada" | "slug-duplicado" | "ibge-duplicado";
  message: string;
}

/**
 * SC-009 — a mensagem nomeia o slug **e** a rota conflitante. Um erro que só diz
 * "conflito de slug" obriga a pessoa a caçar qual; este diz onde olhar.
 */
export function findSlugConflicts(
  municipalities: readonly Municipality[] = MUNICIPALITIES,
): SlugConflict[] {
  const conflicts: SlugConflict[] = [];
  const seenSlugs = new Map<string, string>();
  const seenCodes = new Map<string, string>();

  for (const municipality of municipalities) {
    const { slug, ibgeCode, name } = municipality;

    if (isReservedRoute(slug)) {
      conflicts.push({
        slug,
        ibgeCode,
        reason: "rota-reservada",
        message: `o município "${name}" usa o slug "${slug}", que já é a rota /${slug} do portal — a URL ficaria ambígua`,
      });
    }

    const previousSlugOwner = seenSlugs.get(slug);
    if (previousSlugOwner !== undefined) {
      conflicts.push({
        slug,
        ibgeCode,
        reason: "slug-duplicado",
        message: `o slug "${slug}" é usado por "${name}" e por "${previousSlugOwner}" — dois municípios não podem dividir a raiz /${slug}`,
      });
    }
    seenSlugs.set(slug, name);

    const previousCodeOwner = seenCodes.get(ibgeCode);
    if (previousCodeOwner !== undefined) {
      conflicts.push({
        slug,
        ibgeCode,
        reason: "ibge-duplicado",
        message: `o código IBGE ${ibgeCode} aparece em "${name}" e em "${previousCodeOwner}" — a identidade canônica não pode repetir`,
      });
    }
    seenCodes.set(ibgeCode, name);
  }

  return conflicts;
}
