import type { APIRoute } from "astro";

import { absoluteUrl, client, newsHref, SITE_NAME } from "../lib/site";
import { escapeXml, xmlResponse } from "../lib/seo/xml";

/**
 * News Sitemap — **somente as últimas 48 h, no máximo 1000 URLs**.
 *
 * Os dois limites são do Google, não escolhas nossas, e desrespeitá-los não gera aviso: o
 * arquivo passa a ser ignorado por inteiro. Manter o corte no código, em vez de confiar em
 * disciplina editorial, é o que garante que ele continue válido quando o volume crescer.
 */
const WINDOW_HOURS = 48;
const MAX_URLS = 1000;

export const GET: APIRoute = async () => {
  const recent = await client.news.listRecent(WINDOW_HOURS, MAX_URLS);

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
    ...recent.map((article) =>
      [
        "  <url>",
        `    <loc>${escapeXml(absoluteUrl(newsHref(article.slug)))}</loc>`,
        "    <news:news>",
        "      <news:publication>",
        `        <news:name>${escapeXml(SITE_NAME)}</news:name>`,
        "        <news:language>pt</news:language>",
        "      </news:publication>",
        `      <news:publication_date>${article.publishedAt}</news:publication_date>`,
        `      <news:title>${escapeXml(article.headline)}</news:title>`,
        "    </news:news>",
        "  </url>",
      ].join("\n"),
    ),
    "</urlset>",
    "",
  ].join("\n");

  return xmlResponse(body);
};
