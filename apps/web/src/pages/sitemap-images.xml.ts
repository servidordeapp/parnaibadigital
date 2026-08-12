import type { APIRoute } from "astro";

import { absoluteUrl, client, newsHref } from "../lib/site";
import { escapeXml, xmlResponse } from "../lib/seo/xml";

/**
 * Uma entrada por `MediaRef` de conteúdo.
 *
 * Hoje o arquivo sai **válido e vazio**: nenhuma matéria demonstrativa tem imagem, porque o
 * produto não tem banco de fotos (Assumption 9) e inventar URLs criaria um sitemap que
 * aponta para 404 — pior que um sitemap sem imagens. A estrutura fica pronta; quando as
 * fotos existirem, nada aqui muda.
 */
export const GET: APIRoute = async () => {
  const result = await client.news.list({ perPage: 10_000 });

  const withImages = result.data.filter((article) => article.image !== undefined);

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...withImages.map((article) =>
      [
        "  <url>",
        `    <loc>${escapeXml(absoluteUrl(newsHref(article.slug)))}</loc>`,
        "    <image:image>",
        `      <image:loc>${escapeXml(article.image?.url ?? "")}</image:loc>`,
        `      <image:title>${escapeXml(article.image?.alt ?? "")}</image:title>`,
        "    </image:image>",
        "  </url>",
      ].join("\n"),
    ),
    "</urlset>",
    "",
  ].join("\n");

  return xmlResponse(body);
};
