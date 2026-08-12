import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

import { expectAccessibleInBothThemes, setTheme } from "../helpers/axe";

/**
 * T109 / FR-005 — a galeria mostra todo componente do inventário, com variantes e estados,
 * nos dois temas.
 *
 * O teste não confere aparência: confere **presença e funcionamento**. Um inventário que
 * lista todos os componentes e renderiza a metade é pior que nenhum, porque dá a impressão
 * de cobertura — e é exatamente essa impressão que faz alguém montar a próxima tela
 * copiando HTML.
 *
 * O total esperado é **lido do `_ds_manifest.json`**, e não escrito à mão: um número fixo
 * aqui envelhece na primeira reimportação do Design System, e o modo como ele falha é o pior
 * possível — o teste reprova uma entrega correta, alguém corrige o número sem investigar, e
 * o portão deixa de significar qualquer coisa.
 */

const GROUPS = ["core", "brand", "news", "navigation", "widgets", "tourism", "ads", "overlay"];

/**
 * Lido do arquivo vendorizado, e não importado por nome de pacote: a raiz do monorepo não
 * declara `@parnaibadigital/design-system` como dependência, e declará-la só para um teste
 * criaria um vínculo que nada mais usa.
 */
const manifest = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL(
        "../../packages/design-system/vendor/parna-badigital-design-system-fe257784-b721-4adc-b4cd-6b322b375c04/_ds_manifest.json",
        import.meta.url,
      ),
    ),
    "utf8",
  ),
) as { components: unknown[] };

/** FR-007 — o que o protótipo exercita e o Design System ainda não publica. */
const JUSTIFIED_ADDITIONS = ["CommandPalette", "NavDrawer", "Toast", "Skeleton", "DataTable"];

test.describe("@inventory galeria de componentes", () => {
  test("o índice lista todo componente do manifesto", async ({ page }) => {
    await page.goto("/componentes");

    const cards = page.locator("[data-pd-gallery-item]");
    // Os componentes publicados pelo DS + as 5 adições justificadas
    // (contracts/component-inventory.md).
    await expect(cards).toHaveCount(manifest.components.length + JUSTIFIED_ADDITIONS.length);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/inventário/i);
  });

  test("a busca filtra por nome e por função", async ({ page }) => {
    await page.goto("/componentes");

    const search = page.getByLabel(/buscar por nome ou função/i);

    await search.fill("button");
    await expect(page.locator("[data-pd-gallery-item]:visible")).toHaveCount(2);

    // Por função: quem procura "anúncio" precisa achar AdSlot sem saber o nome dele.
    await search.fill("navegação móvel");
    await expect(page.locator("[data-pd-gallery-item]:visible")).toHaveCount(1);
    await expect(page.locator("[data-pd-gallery-item]:visible")).toContainText("NavDrawer");
  });

  test("cada grupo tem página própria com os componentes renderizados", async ({ page }) => {
    for (const group of GROUPS) {
      const response = await page.goto(`/componentes/${group}`);
      expect(response?.status(), `grupo ${group}`).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(group);
      await expect(page.locator(".pd-item").first()).toBeVisible();
    }
  });

  test("as adições justificadas aparecem marcadas, com a justificativa", async ({ page }) => {
    await page.goto("/componentes");

    const additions = page.locator("[data-pd-gallery-item]", { hasText: "Adição" });
    await expect(additions).toHaveCount(JUSTIFIED_ADDITIONS.length);

    for (const name of JUSTIFIED_ADDITIONS) {
      const card = page.locator("[data-pd-gallery-item]", { hasText: name }).first();
      await expect(card).toContainText("Adição");
      // FR-007: adição sem justificativa visível é como um Design System vira dois.
      await expect(card.locator("p").last()).not.toBeEmpty();
    }
  });

  test("os estados de `core` renderizam nos dois temas", async ({ page }) => {
    for (const theme of ["light", "dark"] as const) {
      await page.goto("/componentes/core");
      await setTheme(page, theme);

      await expect(page.getByRole("button", { name: "Primário" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Desabilitado" })).toBeDisabled();
      // `exact` porque a galeria também mostra o IconButton "Buscar", e um rótulo por
      // correspondência parcial casaria com os dois.
      await expect(page.getByLabel("Busca", { exact: true })).toBeVisible();
      await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
    }
  });

  test("a galeria é acessível nos dois temas", async ({ page }) => {
    await expectAccessibleInBothThemes(page, "/componentes");
    await expectAccessibleInBothThemes(page, "/componentes/core");
  });

  test("a galeria fica fora do índice", async ({ page }) => {
    await page.goto("/componentes");
    const robots = await page.locator('head meta[name="robots"]').getAttribute("content");
    expect(robots ?? "").toContain("noindex");
  });
});
