import type { DataClient } from "../ports";

/**
 * Transporte HTTP — declarado, não implementado (FR-038, SC-011).
 *
 * Existe agora por um motivo específico: provar que as portas de `ports/` são
 * implementáveis sobre HTTP sem mudar assinatura nenhuma. Se ele não existisse, só
 * descobriríamos na próxima fase que alguma porta assumia algo que só o `mock` consegue
 * entregar — e aí a troca custaria reescrever telas, que é justamente o que D-12 evita.
 *
 * Cada método falha explicitamente. Falhar alto é a escolha certa aqui: devolver lista
 * vazia faria uma página em branco parecer uma página sem notícias, e o erro só apareceria
 * na revisão visual.
 */

export interface HttpTransportOptions {
  /** Base absoluta da API, ex. `https://api.parnaibadigital.com.br/v1`. */
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
}

/**
 * Rejeita em vez de lançar de forma síncrona: as portas declaram `Promise`, e quem
 * consome escreve `await` ou `.catch()`. Um `throw` síncrono de um método tipado como
 * assíncrono escapa desses dois caminhos e derruba a construção num lugar sem contexto.
 */
function notImplemented(operation: string): Promise<never> {
  return Promise.reject(
    new Error(
      `Transporte HTTP não implementado nesta fase (FR-038): ${operation}. ` +
        "O contrato existe em contracts/openapi-v1.yaml e os tipos já são gerados dele; " +
        "a implementação entra com o primeiro endpoint real. Use PD_DATA_TRANSPORT=mock.",
    ),
  );
}

/**
 * Os parâmetros são nomeados mesmo sem uso: é assim que a aridade bate com a do transporte
 * `mock` e o teste de intercambialidade (V10) consegue comparar as duas superfícies.
 */
export function createHttpClient(_options: HttpTransportOptions): DataClient {
  return {
    news: {
      list: (_query) => notImplemented("news.list"),
      findBySlug: (_slug) => notImplemented("news.findBySlug"),
      listRecent: (_withinHours, _limit) => notImplemented("news.listRecent"),
      listAllSlugs: () => notImplemented("news.listAllSlugs"),
    },
    geo: {
      listMunicipalities: () => notImplemented("geo.listMunicipalities"),
      findMunicipalityBySlug: (_slug) => notImplemented("geo.findMunicipalityBySlug"),
      listNeighborhoods: (_ibgeCode) => notImplemented("geo.listNeighborhoods"),
      findNeighborhood: (_id) => notImplemented("geo.findNeighborhood"),
    },
    categories: {
      list: () => notImplemented("categories.list"),
      findBySlug: (_slug) => notImplemented("categories.findBySlug"),
    },
    authors: {
      list: () => notImplemented("authors.list"),
      findBySlug: (_slug) => notImplemented("authors.findBySlug"),
    },
    gazette: {
      list: () => notImplemented("gazette.list"),
      findById: (_id) => notImplemented("gazette.findById"),
    },
    events: { list: (_ibgeCode) => notImplemented("events.list") },
    companies: { list: (_neighborhoodId) => notImplemented("companies.list") },
    utilities: { list: (_group) => notImplemented("utilities.list") },
    search: { query: (_term) => notImplemented("search.query") },
  };
}
