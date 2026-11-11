import rss from "@astrojs/rss";
import type { APIRoute } from "astro";

import { MUNICIPALITIES } from "@parnaibadigital/api-client";

import { absoluteUrl, client, newsHref, SITE_NAME, SITE_URL } from "../../lib/site";

/**
 * SC-010 — um feed por município do registro.
 *
 * Este arquivo é a prova mais direta de que a promessa "acrescentar um município é editar um
 * registro" se sustenta: nenhum slug aparece aqui. O feed do sexto município passa a existir
 * no mesmo commit que o acrescenta ao registro, sem tocar nesta rota.
 *
 * `secao` e `municipio` são rotas irmãs no mesmo diretório, então a ordem de resolução do
 * Astro poderia deixá-las ambíguas — não deixa, porque os conjuntos de slugs são disjuntos
 * por construção: `validate-slug-registry.ts` reprova a construção se um slug de município
 * colidir com rota reservada, e as editorias vivem no mesmo espaço de nome (SC-009).
 */
export function getStaticPaths() {
  return MUNICIPALITIES.map((municipality) => ({ params: { municipio: municipality.slug } }));
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.municipio ?? "";
  const municipality = MUNICIPALITIES.find((entry) => entry.slug === slug);
  const result = await client.news.list({
    municipalityIbgeCode: municipality?.ibgeCode,
    perPage: 50,
  });

  return rss({
    title: `${municipality?.name ?? slug} · ${SITE_NAME}`,
    description: `Notícias de ${municipality?.name ?? slug}, no litoral do Piauí, bairro a bairro.`,
    site: SITE_URL,
    trailingSlash: false,
    items: result.data.map((article) => ({
      title: article.headline,
      description: article.standfirst ?? "",
      link: absoluteUrl(newsHref(article.slug)),
      pubDate: new Date(article.publishedAt),
    })),
    customData: "<language>pt-BR</language>",
  });
};
