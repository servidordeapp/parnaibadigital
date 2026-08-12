import type {
  Author,
  Category,
  Event as PdEvent,
  Municipality,
  Neighborhood,
  News,
} from "@parnaibadigital/types";

import { absoluteUrl, DEFAULT_SHARE_IMAGE, SITE_NAME, SITE_TAGLINE, SITE_URL } from "../site";

/**
 * FR-029 / Princípio II — os schemas JSON-LD, por tipo de superfície.
 *
 * `contracts/routes.md` declara, tela por tela, qual schema é obrigatório. Este arquivo é a
 * outra ponta dessa declaração: cada função devolve exatamente o tipo que a tabela exige, e
 * o teste de T049 lê o `dist/` para confirmar que o que foi declarado foi emitido.
 *
 * A peça central do produto é `contentLocation` na matéria. É ela que liga cada texto ao
 * município — o vínculo de que depende a estratégia inteira de busca local. Sem ele, o
 * conteúdo é apenas mais uma notícia; com ele, é notícia *de um lugar*.
 */

export type JsonLd = Record<string, unknown>;

/* ————————————————— Blocos reutilizados ————————————————— */

export function organization(): JsonLd {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    logo: DEFAULT_SHARE_IMAGE,
    areaServed: { "@type": "AdministrativeArea", name: "Litoral do Piauí" },
  };
}

export function website(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "pt-BR",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      // O alvo aponta para a mesma rota que o formulário de `/busca` usa por `GET` — se
      // divergissem, o buscador ofereceria uma caixa de busca que leva a lugar nenhum.
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/busca?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function place(municipality: Municipality, neighborhood?: Neighborhood): JsonLd {
  const base: JsonLd = {
    "@type": "Place",
    name: neighborhood?.name ?? municipality.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: municipality.name,
      addressRegion: municipality.state,
      addressCountry: "BR",
    },
  };

  if (neighborhood === undefined) {
    // O código IBGE é a identidade do município; publicá-lo torna o vínculo verificável
    // por qualquer consumidor, não só pelo nome — que se repete pelo país inteiro.
    base.identifier = {
      "@type": "PropertyValue",
      propertyID: "IBGE",
      value: municipality.ibgeCode,
    };
    if (municipality.latitude !== undefined && municipality.longitude !== undefined) {
      base.geo = {
        "@type": "GeoCoordinates",
        latitude: municipality.latitude,
        longitude: municipality.longitude,
      };
    }
    return base;
  }

  base.containedInPlace = place(municipality);
  return base;
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbList(crumbs: readonly Crumb[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/* ————————————————— Por superfície ————————————————— */

export interface NewsArticleInput {
  article: News;
  author: Author | undefined;
  category: Category | undefined;
  municipality: Municipality | undefined;
  neighborhood: Neighborhood | undefined;
  path: string;
}

export function newsArticle(input: NewsArticleInput): JsonLd {
  const { article, author, category, municipality, neighborhood, path } = input;

  const node: JsonLd = {
    "@type": "NewsArticle",
    headline: article.headline,
    description: article.standfirst ?? "",
    url: absoluteUrl(path),
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: "pt-BR",
    isAccessibleForFree: true,
    publisher: { "@id": `${SITE_URL}/#organization` },
    image: article.image === undefined ? DEFAULT_SHARE_IMAGE : article.image.url,
  };

  if (author !== undefined) {
    node.author = {
      "@type": "Person",
      name: author.name,
      url: absoluteUrl(`/autor/${author.slug}`),
    };
  }

  if (category !== undefined) node.articleSection = category.name;

  if (municipality !== undefined) {
    node.contentLocation = place(municipality, neighborhood);
  }

  // Curadoria com atribuição: o schema também registra a origem, não só o rodapé visível.
  if (article.curation.kind === "curated" && article.attribution !== undefined) {
    node.citation = {
      "@type": "CreativeWork",
      name: article.attribution.sourceName,
      url: article.attribution.sourceUrl,
    };
  }

  return node;
}

export function collectionPage(name: string, description: string, path: string): JsonLd {
  return {
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "pt-BR",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

export function webPage(name: string, description: string, path: string): JsonLd {
  return {
    "@type": "WebPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "pt-BR",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

export function profilePage(author: Author, path: string): JsonLd {
  return {
    "@type": "ProfilePage",
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "Person",
      name: author.name,
      description: author.bio,
      url: absoluteUrl(path),
      worksFor: { "@id": `${SITE_URL}/#organization` },
    },
  };
}

export function eventItemList(
  events: readonly PdEvent[],
  municipalityOf: (event: PdEvent) => Municipality | undefined,
): JsonLd {
  return {
    "@type": "ItemList",
    itemListElement: events.map((event, index) => {
      const municipality = municipalityOf(event);
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Event",
          name: event.title,
          startDate: event.startsAt,
          ...(event.endsAt === undefined ? {} : { endDate: event.endsAt }),
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: event.venue,
            ...(municipality === undefined
              ? {}
              : {
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: municipality.name,
                    addressRegion: municipality.state,
                    addressCountry: "BR",
                  },
                }),
          },
          offers: {
            "@type": "Offer",
            price: event.price.free ? 0 : (event.price.amount ?? 0),
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
          },
        },
      };
    }),
  };
}

export interface BusinessListItem {
  name: string;
  path: string;
  neighborhoodName: string;
  municipality: Municipality | undefined;
  rating: number;
  reviewCount: number;
  phone?: string;
}

export function businessItemList(items: readonly BusinessListItem[]): JsonLd {
  return {
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "LocalBusiness",
        name: item.name,
        url: absoluteUrl(item.path),
        ...(item.phone === undefined ? {} : { telephone: item.phone }),
        address: {
          "@type": "PostalAddress",
          streetAddress: item.neighborhoodName,
          addressLocality: item.municipality?.name ?? "",
          addressRegion: item.municipality?.state ?? "PI",
          addressCountry: "BR",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: item.rating,
          reviewCount: item.reviewCount,
        },
      },
    })),
  };
}

/**
 * Empacota os nós num único `<script>` com `@graph`.
 *
 * Vários scripts JSON-LD na mesma página são aceitos, mas impedem que os nós se referenciem
 * por `@id` — e é a referência que evita repetir a organização inteira dentro de cada
 * matéria, de cada listagem e de cada breadcrumb.
 */
export function graph(nodes: readonly JsonLd[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  });
}
