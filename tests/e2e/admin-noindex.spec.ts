import { expect, test } from "@playwright/test";

import { adminSurfaces, adminUrl, ADMIN_BASE_URL } from "../helpers/admin";

/**
 * T091 / User Story 2, cenário 5 — o painel **não é exposto**: `noindex,nofollow` em toda
 * página e `Disallow: /` no robots.txt próprio.
 *
 * Isto é higiene de SEO, não segurança. O bloqueio real é na borda
 * (`infrastructure/_headers`), e é importante que a distinção fique registrada: um painel
 * sem autenticação que se apoia em `noindex` para não ser acessado está desprotegido, apenas
 * discreto.
 */
test.describe("@admin não-exposição do painel", () => {
  for (const surface of adminSurfaces()) {
    test(`${surface.name} declara noindex,nofollow`, async ({ page }) => {
      await page.goto(adminUrl(surface.path));

      const robots = await page.locator('head meta[name="robots"]').getAttribute("content");
      expect(robots ?? "", `${surface.name} sem meta robots`).toContain("noindex");
      expect(robots ?? "").toContain("nofollow");
    });
  }

  test("o robots.txt do painel bloqueia tudo", async ({ request }) => {
    const response = await request.get(`${ADMIN_BASE_URL}/robots.txt`);

    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("Disallow: /");
    // Nenhum sitemap: o painel não tem nenhum, e anunciar um seria contraditório.
    expect(body).not.toContain("Sitemap:");
  });

  test("o painel não publica sitemap", async ({ request }) => {
    for (const path of ["/sitemap-index.xml", "/sitemap.xml", "/sitemap-core.xml"]) {
      const response = await request.get(`${ADMIN_BASE_URL}${path}`);
      expect(response.status(), `${path} não deveria existir`).toBe(404);
    }
  });
});
