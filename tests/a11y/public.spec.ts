import { expect, test } from "@playwright/test";

import { expectAccessibleInBothThemes, setTheme } from "../helpers/axe";
import { publicSurfaces } from "../helpers/surfaces";

/**
 * T050 / SC-004 / Princípio III — axe-core em cada superfície pública, nos dois temas,
 * zero violação WCAG 2.1 AA.
 *
 * Rodar nos dois temas não é zelo excessivo: o tema escuro deste produto foi extraído do
 * protótipo (D-07) e é exatamente onde o contraste tende a quebrar. Duas correções já
 * nasceram desse cuidado em T018 (`--focus-ring` e `--text-urgent`), e foram encontradas
 * porque o teste olha os dois.
 *
 * axe cobre o que é automatizável. O que ele não cobre — ordem de leitura, rótulo que faz
 * sentido, foco que vai para onde a pessoa espera — entra como asserção explícita abaixo.
 */

test.describe("acessibilidade das superfícies públicas", () => {
  for (const surface of publicSurfaces()) {
    test(`${surface.name} sem violações WCAG 2.1 AA`, async ({ page }) => {
      await expectAccessibleInBothThemes(page, surface.path);
    });
  }

  test("todo botão só de ícone tem nome acessível", async ({ page }) => {
    for (const surface of publicSurfaces()) {
      await page.goto(surface.path);

      const buttons = page.locator("button, a[role='button']");
      const count = await buttons.count();

      for (let index = 0; index < count; index += 1) {
        const button = buttons.nth(index);
        const name = (
          (await button.getAttribute("aria-label")) ?? (await button.innerText())
        ).trim();

        expect(name, `${surface.name}: controle ${String(index)} sem nome acessível`).not.toBe("");
      }
    }
  });

  test("o salto para o conteúdo é o primeiro alvo de tabulação", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const focused = await page.evaluate(() => ({
      text: document.activeElement?.textContent.trim() ?? "",
      href: document.activeElement?.getAttribute("href") ?? "",
    }));

    expect(focused.href).toBe("#conteudo");
    expect(focused.text).toMatch(/ir para o conteúdo/i);
  });

  test("o foco permanece visível nos dois temas", async ({ page }) => {
    for (const theme of ["light", "dark"] as const) {
      await page.goto("/");
      await setTheme(page, theme);
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      const outline = await page.evaluate(() => {
        const element = document.activeElement;
        if (element === null) return "";
        const style = getComputedStyle(element);
        return `${style.outlineStyle} ${style.outlineWidth}`;
      });

      // WCAG 2.4.11: o indicador de foco precisa existir. Um `outline: none` sem
      // substituto some justamente para quem navega só por teclado.
      expect(outline, `foco invisível no tema ${theme}`).not.toContain("none");
    }
  });

  test("a hierarquia de títulos não pula nível", async ({ page }) => {
    for (const surface of publicSurfaces()) {
      await page.goto(surface.path);

      const levels = await page
        .locator("main h1, main h2, main h3, main h4")
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
