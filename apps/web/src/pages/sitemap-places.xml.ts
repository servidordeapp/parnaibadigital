import type { APIRoute } from "astro";

import { MUNICIPALITIES } from "@parnaibadigital/api-client";

import { absoluteUrl, client, municipalityHref, neighborhoodHref } from "../lib/site";
import { urlSet, xmlResponse } from "../lib/seo/xml";

/**
 * SC-010 — a taxonomia geográfica inteira, derivada do registro.
 *
 * É o sitemap que carrega a aposta central do produto: cada município e cada bairro tem
 * endereço próprio e entra no índice. Escrever esta lista à mão significaria que o sexto
 * município nasceria invisível para a busca.
 */
export const GET: APIRoute = async () => {
  const entries = [];

  for (const municipality of MUNICIPALITIES) {
    entries.push({
      loc: absoluteUrl(municipalityHref(municipality)),
      changefreq: "daily" as const,
      priority: 0.9,
    });

    const neighborhoods = await client.geo.listNeighborhoods(municipality.ibgeCode);
    for (const neighborhood of neighborhoods) {
      entries.push({
        loc: absoluteUrl(neighborhoodHref(municipality, neighborhood)),
        changefreq: "daily" as const,
        priority: 0.7,
      });
    }
  }

  return xmlResponse(urlSet(entries));
};
