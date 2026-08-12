import { expect, type Page, test } from "@playwright/test";

import { setTheme } from "../helpers/axe";
import { publicSurfaces } from "../helpers/surfaces";

/**
 * T047 / SC-002 / FR-009 — cada superfície pública serve nos dois temas e nas duas larguras.
 *
 * O teste roda nos projetos `chromium-360` e `chromium-1280` do Playwright, então a largura
 * não aparece aqui: ela é a matriz de execução. O que aparece é o que a largura não prova
 * sozinha — que o tema escuro é aplicado de fato, que ninguém ficou com fundo claro herdado,
 * que o contraste do corpo de texto se sustenta e que a escolha atravessa a navegação.
 *
 * Contraste é medido, não presumido. Um tema escuro montado só com sobrescrita de fundo
 * passa em qualquer inspeção visual rápida e reprova em 4,5:1 — que é o critério de SC-002.
 */

const MIN_CONTRAST_BODY_TEXT = 4.5;

/** Converte a cor computada do navegador (`rgb()`/`rgba()`) em luminância relativa (WCAG). */
async function relativeLuminance(page: Page, selector: string, property: string): Promise<number> {
  return page.evaluate(
    ([sel, prop]) => {
      const element = document.querySelector(sel);
      if (element === null) throw new Error(`seletor sem correspondência: ${sel}`);

      const value = getComputedStyle(element).getPropertyValue(prop);
      const parts = /rgba?\(([^)]+)\)/.exec(value)?.[1]?.split(/[\s,/]+/) ?? [];
      const channels = parts.slice(0, 3).map((part) => Number(part) / 255);

      const linear = channels.map((channel) =>
        channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
      );

      return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
    },
    [selector, property] as const,
  );
}

function contrastRatio(a: number, b: number): number {
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

test.describe("@themes temas e larguras", () => {
  for (const surface of publicSurfaces()) {
    for (const theme of ["light", "dark"] as const) {
      test(`${surface.name} no tema ${theme}`, async ({ page }) => {
        await page.goto(surface.path);
        await setTheme(page, theme);

        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

        const foreground = await relativeLuminance(page, "main#conteudo", "color");
        const background = await relativeLuminance(page, "body", "background-color");
        const ratio = contrastRatio(foreground, background);

        expect(
          ratio,
          `${surface.name} (${theme}) tem contraste de corpo ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(MIN_CONTRAST_BODY_TEXT);
      });
    }
  }

  test("nenhuma superfície pública transborda horizontalmente", async ({ page }) => {
    // Em 360px é onde o vazamento aparece — uma tabela, um grid fixo ou uma imagem sem
    // `max-width` empurram a página e obrigam a rolagem lateral, que é o defeito mais
    // comum de layout mobile-first mal terminado.
    for (const surface of publicSurfaces()) {
      await page.goto(surface.path);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );

      expect(overflow, `${surface.name} rola lateralmente`).toBeLessThanOrEqual(1);
    }
  });

  test("a escolha de tema persiste entre telas", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /alternar tema|tema (claro|escuro)/i });
    await toggle.click();

    const chosen = await page.locator("html").getAttribute("data-theme");
    expect(chosen).not.toBeNull();

    // Navegação real, não `page.evaluate`: o que se está provando é que o tema sobrevive a
    // um documento novo, que é justamente o caso em que um site estático costuma piscar.
    await page
      .getByRole("link", { name: /eventos/i })
      .first()
      .click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", chosen ?? "");
  });
});
