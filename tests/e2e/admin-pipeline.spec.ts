import { expect, test } from "@playwright/test";

import { pipelineStages } from "@parnaibadigital/api-client/mock/data/index";

import { adminUrl } from "../helpers/admin";

/**
 * T088 / Princípio V — as 8 etapas avançam na ordem fixa e a etapa "Editor — revisão humana
 * obrigatória" **nunca é pulada**.
 *
 * Este é o teste mais importante do painel, e não por volume de código: ele é a tradução
 * executável de uma regra editorial. Se a representação do pipeline puder omitir a revisão
 * humana — por animação, por filtro, por espaço em tela —, o produto passa a descrever uma
 * automação que publica sozinha. A Constituição não admite isso nem na representação.
 */
test.describe("@admin pipeline editorial", () => {
  test("as 8 etapas aparecem na ordem fixa", async ({ page }) => {
    await page.goto(adminUrl("/pipeline"));

    const stages = page.locator("[data-pd-stage]");
    await expect(stages).toHaveCount(8);

    const keys = await stages.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-pd-stage") ?? ""),
    );

    const expected = [...pipelineStages].sort((a, b) => a.order - b.order).map((s) => s.key);
    expect(keys).toEqual(expected);
  });

  test("a etapa de revisão humana está presente e marcada como obrigatória", async ({ page }) => {
    await page.goto(adminUrl("/pipeline"));

    const editor = page.locator('[data-pd-stage="editor"]');
    await expect(editor).toBeVisible();
    await expect(editor).toContainText(/revisão humana obrigatória/i);
    await expect(editor).toContainText(/obrigatória/i);

    // Destaque visual próprio: a etapa que a automação não atravessa não pode parecer
    // igual às demais.
    await expect(editor).toHaveClass(/is-human/);
  });

  test("a revisão humana permanece durante toda a animação", async ({ page }) => {
    await page.goto(adminUrl("/pipeline"));

    // A entrada é escalonada; a etapa precisa estar no DOM desde o primeiro quadro e
    // continuar lá depois que a animação termina.
    await expect(page.locator('[data-pd-stage="editor"]')).toHaveCount(1);
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-pd-stage="editor"]')).toHaveCount(1);
    await expect(page.locator("[data-pd-stage]")).toHaveCount(8);
  });

  test("a animação é suprimida sob prefers-reduced-motion, sem perder etapa", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(adminUrl("/pipeline"));

    await expect(page.locator("[data-pd-stage]")).toHaveCount(8);
    await expect(page.locator('[data-pd-stage="editor"]')).toBeVisible();
  });

  // A tag restringe este caso ao projeto `no-js` (ver `playwright.config.ts`): rodá-lo com
  // script ativo passaria sem provar nada, porque é justamente a ausência de script que ele
  // verifica.
  test("o pipeline serve sem JavaScript", { tag: "@no-js" }, async ({ page }) => {
    await page.goto(adminUrl("/pipeline"));
    await expect(page.locator("[data-pd-stage]")).toHaveCount(8);
  });
});
