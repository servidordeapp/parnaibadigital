import type { APIRoute } from "astro";

import { SITE_URL } from "../lib/site";

/**
 * FR-030 / `contracts/routes.md` — o robots.txt é **gerado**, nunca mantido à mão.
 *
 * Um arquivo estático em `public/` divergiria do produto no dia em que uma rota nova
 * precisasse ser bloqueada, e ninguém notaria: robots errado não quebra nada visível, só
 * põe no índice o que deveria ficar fora (ou tira o que deveria entrar).
 *
 * Dois `Disallow`, ambos com razão declarada no contrato:
 *   - `/busca` produz conteúdo duplicado por definição — a mesma matéria em N consultas;
 *   - `/componentes` é superfície de desenvolvimento, não de produto (Assumption 4).
 */
export const GET: APIRoute = () => {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /busca",
    "Disallow: /componentes",
    "",
    `Sitemap: ${SITE_URL}/sitemap-index.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
