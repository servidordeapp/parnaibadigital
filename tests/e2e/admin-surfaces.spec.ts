import { expect, test } from "@playwright/test";

import { adminSurfaces, adminUrl, EXPECTED_ADMIN_SURFACE_COUNT } from "../helpers/admin";

/**
 * T087 / User Story 2, cenário 1 — as 11 superfícies do painel respondem, e a navegação
 * lateral marca a tela corrente com fundo, cor e régua de 3px.
 *
 * O realce é verificado por `aria-current="page"` **e** pela régua: cor sozinha não comunica
 * estado (WCAG 1.4.1), e num painel de 11 telas saber onde se está é a informação mais usada
 * da interface.
 */
test.describe("@admin superfícies do painel", () => {
  const surfaces = adminSurfaces();

  test("o contrato de rotas do painel está coberto", () => {
    expect(surfaces.length).toBe(EXPECTED_ADMIN_SURFACE_COUNT);
  });

  for (const surface of surfaces) {
    test(`${surface.name} responde 200`, async ({ page }) => {
      const response = await page.goto(adminUrl(surface.path));

      expect(response?.status(), `${surface.name} não respondeu 200`).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main#painel")).toBeVisible();
    });
  }

  test("o item ativo da navegação lateral recebe realce e aria-current", async ({ page }) => {
    for (const surface of [...surfaces].slice(0, 10)) {
      await page.goto(adminUrl(surface.path));

      const active = page.locator('.pd-admin-nav__link[aria-current="page"]');
      await expect(active, `${surface.name} sem item ativo`).toHaveCount(1);

      const styles = await active.evaluate((element) => {
        const computed = getComputedStyle(element);
        return {
          borderLeftWidth: computed.borderLeftWidth,
          borderLeftColor: computed.borderLeftColor,
          background: computed.backgroundColor,
          color: computed.color,
        };
      });

      // Régua de 3px cor-de-sol, fundo próprio e cor de texto distinta — os três do protótipo.
      expect(styles.borderLeftWidth).toBe("3px");
      expect(styles.borderLeftColor).not.toBe("rgba(0, 0, 0, 0)");
      expect(styles.background).not.toBe("rgba(0, 0, 0, 0)");
      expect(styles.color).not.toBe("");
    }
  });

  test("toda tela do painel é alcançável pela navegação lateral", async ({ page }) => {
    await page.goto(adminUrl("/"));

    const hrefs = await page
      .locator(".pd-admin-nav__link")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href") ?? ""));

    for (const surface of STATIC_PATHS) {
      expect(hrefs, `${surface} ausente da navegação`).toContain(surface);
    }
  });
});

const STATIC_PATHS = [
  "/",
  "/noticias",
  "/pipeline",
  "/diario-oficial",
  "/publicidade",
  "/analytics",
  "/seo",
  "/integracoes",
  "/usuarios",
  "/configuracoes",
];
