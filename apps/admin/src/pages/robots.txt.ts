import type { APIRoute } from "astro";

/**
 * T108 / User Story 2, cenário 5 — o painel **não é indexável**, e o robots.txt diz isso da
 * forma mais direta possível.
 *
 * Três camadas independentes, e nenhuma substitui as outras:
 *   1. `noindex,nofollow` incondicional no `AdminLayout`;
 *   2. este `Disallow: /`, que impede o rastreamento antes da leitura da meta;
 *   3. bloqueio de acesso na borda, documentado em `infrastructure/_headers` — a única das
 *      três que é segurança de fato (Princípio IV). As duas primeiras são higiene de SEO.
 *
 * Nenhum sitemap é referenciado, deliberadamente: o painel não tem nenhum.
 */
export const GET: APIRoute = () =>
  new Response(["User-agent: *", "Disallow: /", ""].join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
