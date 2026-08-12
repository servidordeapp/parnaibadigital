import type { APIRoute } from "astro";

import { absoluteUrl, authorHref, client, newsHref } from "../lib/site";
import { urlSet, xmlResponse } from "../lib/seo/xml";

/** Todo o acervo de matérias e as páginas de autor — gerado do conteúdo, nunca à mão. */
export const GET: APIRoute = async () => {
  const result = await client.news.list({ perPage: 10_000 });
  const authors = await client.authors.list();

  return xmlResponse(
    urlSet([
      ...result.data.map((article) => ({
        loc: absoluteUrl(newsHref(article.slug)),
        lastmod: article.updatedAt,
        changefreq: "weekly" as const,
        priority: 0.8,
      })),
      ...authors.map((author) => ({
        loc: absoluteUrl(authorHref(author.slug)),
        changefreq: "weekly" as const,
        priority: 0.5,
      })),
    ]),
  );
};
