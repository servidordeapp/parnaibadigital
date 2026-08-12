import { expect, test } from "@playwright/test";

import { expectAccessibleInBothThemes } from "../helpers/axe";
import { adminSurfaces, adminUrl } from "../helpers/admin";

/**
 * T090 / SC-004 — axe-core nas 11 superfícies do painel, nos dois temas.
 *
 * O painel costuma receber menos atenção de acessibilidade que o portal, com o argumento de
 * que "só a redação usa". O argumento não se sustenta: a redação usa esta interface o dia
 * inteiro, todos os dias, e é justamente quem mais paga por uma tabela sem cabeçalho ou por
 * um estado anunciado só por cor.
 */
test.describe("acessibilidade do painel", () => {
  for (const surface of adminSurfaces()) {
    test(`${surface.name} sem violações WCAG 2.1 AA`, async ({ page }) => {
      await expectAccessibleInBothThemes(page, adminUrl(surface.path));
    });
  }

  test("a tabela de listagem é uma tabela de verdade", async ({ page }) => {
    await page.goto(adminUrl("/noticias"));

    const table = page.locator("table.pd-table").first();
    await expect(table).toBeVisible();
    // `<caption>` e `<th scope>` são o que faz leitor de tela anunciar linha e coluna.
    await expect(table.locator("caption")).not.toBeEmpty();
    expect(await table.locator('th[scope="col"]').count()).toBeGreaterThan(0);
  });

  test("a hierarquia de títulos do painel não pula nível", async ({ page }) => {
    for (const surface of adminSurfaces()) {
      await page.goto(adminUrl(surface.path));

      const levels = await page
        .locator("main h1, main h2, main h3")
        .evaluateAll((nodes) => nodes.map((node) => Number(node.tagName.slice(1))));

      let previous = levels[0] ?? 1;
      expect(previous, `${surface.name} não começa em h1`).toBe(1);

      for (const level of levels.slice(1)) {
        expect(
          level - previous,
          `${surface.name}: salto de h${String(previous)} para h${String(level)}`,
        ).toBeLessThanOrEqual(1);
        previous = level;
      }
    }
  });
});
