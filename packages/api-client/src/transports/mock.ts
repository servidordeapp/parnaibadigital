import type { News, NewsSummary, SearchResult } from "@parnaibadigital/types";

import { findMunicipalityBySlug, MUNICIPALITIES } from "../data/municipalities";
import * as data from "../mock/data";
import type { DataClient, NewsQuery, Page } from "../ports";

/**
 * Transporte demonstrativo. Lê módulos TypeScript tipados — sem banco, sem rede, sem
 * arquivo lido em runtime (FR-038). Tudo acontece em tempo de construção, o que é o que
 * permite o portal inteiro sair como HTML estático.
 */

function paginate<T>(items: readonly T[], page = 1, perPage = 12): Page<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  return {
    data: items.slice(start, start + perPage),
    meta: { page, perPage, total, totalPages },
  };
}

function toSummary(item: News): NewsSummary {
  // O corpo e a atribuição não viajam para a listagem: card e hero não os usam, e mandá-los
  // engordaria cada página de listagem sem ninguém ler.
  const { body: _body, attribution: _attribution, regionalContext: _context, ...summary } = item;
  return summary;
}

function byPublishedAtDesc(a: News, b: News): number {
  return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
}

export function createMockClient(): DataClient {
  const sortedNews = [...data.news].sort(byPublishedAtDesc);

  return {
    news: {
      // Parâmetro opcional, não com valor padrão: `Function.length` desconsidera o
      // parâmetro que tem default, e o teste de intercambialidade compara aridade.
      list(query?: NewsQuery) {
        const filter = query ?? {};
        const filtered = sortedNews.filter((item) => {
          if (filter.categorySlug !== undefined && item.categorySlug !== filter.categorySlug) {
            return false;
          }
          if (
            filter.municipalityIbgeCode !== undefined &&
            item.municipalityIbgeCode !== filter.municipalityIbgeCode
          ) {
            return false;
          }
          if (
            filter.neighborhoodId !== undefined &&
            !item.neighborhoodIds.includes(filter.neighborhoodId)
          ) {
            return false;
          }
          if (filter.authorSlug !== undefined && item.authorSlug !== filter.authorSlug) {
            return false;
          }
          return true;
        });

        return Promise.resolve(paginate(filtered.map(toSummary), filter.page, filter.perPage));
      },

      findBySlug(slug: string) {
        return Promise.resolve(sortedNews.find((item) => item.slug === slug));
      },

      listRecent(withinHours: number, limit: number) {
        const cutoff = Date.now() - withinHours * 60 * 60 * 1000;
        return Promise.resolve(
          sortedNews
            .filter((item) => Date.parse(item.publishedAt) >= cutoff)
            .slice(0, limit)
            .map(toSummary),
        );
      },

      listAllSlugs() {
        return Promise.resolve(sortedNews.map((item) => item.slug));
      },
    },

    geo: {
      listMunicipalities() {
        return Promise.resolve([...MUNICIPALITIES]);
      },
      findMunicipalityBySlug(slug: string) {
        return Promise.resolve(findMunicipalityBySlug(slug));
      },
      listNeighborhoods(municipalityIbgeCode: string) {
        return Promise.resolve(
          data.neighborhoods.filter((b) => b.municipalityIbgeCode === municipalityIbgeCode),
        );
      },
      findNeighborhood(id: string) {
        return Promise.resolve(data.neighborhoods.find((b) => b.id === id));
      },
    },

    categories: {
      list() {
        return Promise.resolve([...data.categories]);
      },
      findBySlug(slug: string) {
        return Promise.resolve(data.categories.find((c) => c.slug === slug));
      },
    },

    authors: {
      list() {
        return Promise.resolve([...data.authors]);
      },
      findBySlug(slug: string) {
        return Promise.resolve(data.authors.find((a) => a.slug === slug));
      },
    },

    gazette: {
      list() {
        return Promise.resolve([...data.gazette]);
      },
      findById(id: string) {
        return Promise.resolve(data.gazette.find((d) => d.id === id));
      },
    },

    events: {
      list(municipalityIbgeCode?: string) {
        return Promise.resolve(
          municipalityIbgeCode === undefined
            ? [...data.events]
            : data.events.filter((e) => e.municipalityIbgeCode === municipalityIbgeCode),
        );
      },
    },

    companies: {
      list(neighborhoodId?: string) {
        return Promise.resolve(
          neighborhoodId === undefined
            ? [...data.companies]
            : data.companies.filter((c) => c.neighborhoodId === neighborhoodId),
        );
      },
    },

    utilities: {
      list(group?: string) {
        return Promise.resolve(
          group === undefined
            ? [...data.utilities]
            : data.utilities.filter((u) => u.group === group),
        );
      },
    },

    search: {
      query(term: string) {
        // Casca deliberada: o motor real fica atrás da porta `SearchEngine` do backend
        // (D-14). Aqui a busca é textual e ingênua, só para a tela ter comportamento.
        const needle = term.trim().toLowerCase();
        if (needle === "") return Promise.resolve([]);

        const results: SearchResult[] = sortedNews
          .filter((item) => item.headline.toLowerCase().includes(needle))
          .map((item) => ({
            type: "news",
            slug: item.slug,
            title: item.headline,
            // `exactOptionalPropertyTypes` distingue "sem linha de apoio" de "linha de
            // apoio indefinida"; a chave só entra quando há valor.
            ...(item.standfirst === undefined ? {} : { excerpt: item.standfirst }),
            municipalityIbgeCode: item.municipalityIbgeCode,
          }));

        return Promise.resolve(results);
      },
    },
  };
}
