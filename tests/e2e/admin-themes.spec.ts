import { expect, test } from "@playwright/test";

import { setTheme } from "../helpers/axe";
import { adminSurfaces, adminUrl } from "../helpers/admin";

/**
 * T089 / FR-009 — nenhuma tela do painel herda elemento do tema claro.
 *
 * O defeito que este teste persegue é específico e comum: uma superfície do painel que ficou
 * com fundo claro porque o componente usou uma rampa `--pd-*` em vez do alias semântico. Ela
 * passa despercebida em revisão — só aparece para quem usa o tema escuro o dia inteiro.
 */
test.describe("@admin temas do painel", () => {
  for (const surface of adminSurfaces()) {
    for (const theme of ["light", "dark"] as const) {
      test(`${surface.name} no tema ${theme}`, async ({ page }) => {
        await page.goto(adminUrl(surface.path));
        await setTheme(page, theme);

        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

        const luminance = await page.evaluate(() => {
          const value = getComputedStyle(document.body).backgroundColor;
          const parts = /rgba?\(([^)]+)\)/.exec(value)?.[1]?.split(/[\s,/]+/) ?? [];
          const [r = "0", g = "0", b = "0"] = parts;
          return (Number(r) * 299 + Number(g) * 587 + Number(b) * 114) / 1000;
        });

        // Escuro precisa ser escuro de fato; claro precisa ser claro. Um painel que herda o
        // fundo errado cai fora destes limites imediatamente.
        if (theme === "dark") {
          expect(luminance, `${surface.name} herdou fundo claro`).toBeLessThan(80);
        } else {
          expect(luminance, `${surface.name} herdou fundo escuro`).toBeGreaterThan(160);
        }
      });
    }
  }

  test("nenhuma superfície do painel transborda horizontalmente", async ({ page }) => {
    for (const surface of adminSurfaces()) {
      await page.goto(adminUrl(surface.path));

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );

      // A tabela do painel rola dentro do próprio container — a página, nunca.
      expect(overflow, `${surface.name} rola lateralmente`).toBeLessThanOrEqual(1);
    }
  });
});
