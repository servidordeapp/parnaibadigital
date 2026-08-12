import type { APIRoute } from "astro";

import { absoluteUrl } from "../lib/site";
import { urlSet, xmlResponse } from "../lib/seo/xml";

/**
 * As superfícies fixas do portal. `/busca` e `/componentes` ficam de fora — o robots.txt já
 * os bloqueia, e listar no sitemap o que se pede para não indexar é um sinal contraditório
 * que o buscador registra como erro de configuração.
 */
const CORE_PATHS = [
  { path: "/", priority: 1, changefreq: "hourly" as const },
  { path: "/eventos", priority: 0.8, changefreq: "daily" as const },
  { path: "/utilidade-publica", priority: 0.8, changefreq: "daily" as const },
  { path: "/diario-oficial", priority: 0.8, changefreq: "daily" as const },
  { path: "/empresas", priority: 0.6, changefreq: "weekly" as const },
  { path: "/anuncie", priority: 0.4, changefreq: "monthly" as const },
  { path: "/newsletter", priority: 0.5, changefreq: "monthly" as const },
];

export const GET: APIRoute = () =>
  xmlResponse(
    urlSet(
      CORE_PATHS.map((entry) => ({
        loc: absoluteUrl(entry.path),
        changefreq: entry.changefreq,
        priority: entry.priority,
      })),
    ),
  );
