import rss from "@astrojs/rss";
import type { APIRoute } from "astro";

import { absoluteUrl, client, newsHref, SITE_NAME, SITE_URL } from "../../lib/site";

/**
 * FR-030 — um feed por editoria, **derivado dos dados**.
 *
 * A lista de editorias nunca é escrita aqui: sai de `getStaticPaths`, que lê o mesmo
 * repositório que alimenta a navegação e o sitemap de seções. Uma editoria nova ganha feed
 * sem que ninguém precise lembrar disso — que é a diferença entre descoberta gerada e
 * descoberta mantida à mão.
 */
export async function getStaticPaths() {
  const categories = await client.categories.list();
  return categories.map((category) => ({ params: { secao: category.slug } }));
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.secao ?? "";
  const category = await client.categories.findBySlug(slug);
  const result = await client.news.list({ categorySlug: slug, perPage: 50 });

  return rss({
    title: `${category?.name ?? slug} · ${SITE_NAME}`,
    description: `Últimas notícias da editoria ${category?.name ?? slug} no litoral do Piauí.`,
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
