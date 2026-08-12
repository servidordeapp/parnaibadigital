import type { APIRoute } from "astro";

import { SITE_URL } from "../lib/site";
import { xmlResponse } from "../lib/seo/xml";

/**
 * Índice de sitemaps. Separar por seção não é organização estética: news sitemap tem regra
 * própria (48 h, ≤ 1000 URLs), o de imagens tem namespace próprio, e o de artigos cresce
 * sem limite. Num arquivo só, a regra mais restritiva contaminaria o resto.
 */
const SITEMAPS = [
  "sitemap-core.xml",
  "sitemap-articles.xml",
  "sitemap-sections.xml",
  "sitemap-places.xml",
  "sitemap-news.xml",
  "sitemap-images.xml",
];

export const GET: APIRoute = () => {
  const now = new Date().toISOString();
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...SITEMAPS.map(
      (file) =>
        `  <sitemap>\n    <loc>${SITE_URL}/${file}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`,
    ),
    "</sitemapindex>",
    "",
  ].join("\n");

  return xmlResponse(body);
};
