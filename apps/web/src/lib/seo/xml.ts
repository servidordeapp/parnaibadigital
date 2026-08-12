/**
 * Utilitários de XML para sitemaps e feeds.
 *
 * A escapada existe porque um `&` cru num título — "Cultura & Lazer" — torna o XML inválido,
 * e sitemap inválido é descartado inteiro pelo buscador, não parcialmente. O modo de falha é
 * silencioso: nada quebra em build, nada aparece na tela, e as URLs simplesmente não entram
 * no índice.
 */

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: "hourly" | "daily" | "weekly" | "monthly";
  priority?: number;
}

export function urlSet(entries: readonly UrlEntry[], extraNamespaces = ""): string {
  const body = entries
    .map((entry) => {
      const parts = [`    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod !== undefined) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      if (entry.changefreq !== undefined) {
        parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      }
      if (entry.priority !== undefined) {
        parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
      }
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${extraNamespaces}>`,
    body,
    "</urlset>",
    "",
  ].join("\n");
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
