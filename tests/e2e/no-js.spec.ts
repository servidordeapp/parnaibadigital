import { expect, test } from "@playwright/test";

import { news } from "@parnaibadigital/api-client/mock/data/index";

import { publicSurfaces } from "../helpers/surfaces";

/**
 * T048 / SC-007 / Princípio XI — o portal serve sem JavaScript.
 *
 * Só roda no projeto `no-js`, onde o Playwright desliga o motor de script. Não é uma
 * hipótese acadêmica: é a condição real de rede móvel ruim, de rastreador que não executa
 * script e de qualquer falha de entrega de bundle. Se o conteúdo editorial depender de JS,
 * o produto some justamente para quem ele existe para atender.
 *
 * A regra que este arquivo aplica: enriquecimento pode faltar, conteúdo e navegação não.
 */

// A tag `@no-js` no nome do describe é o que restringe este arquivo ao projeto sem
// JavaScript — ver `grep`/`grepInvert` em `playwright.config.ts`.
test.describe("@no-js portal sem JavaScript", () => {
  test("a matéria entrega texto, data, autor, geografia, curadoria e atribuição", async ({
    page,
  }) => {
    const article = news.find((item) => item.curation.kind === "curated");
    expect(
      article,
      "os dados demonstrativos precisam de ao menos uma matéria curada",
    ).toBeDefined();
    if (article === undefined) return;

    await page.goto(`/noticia/${article.slug}`);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(article.headline);

    if (article.standfirst !== undefined) {
      await expect(page.locator("main")).toContainText(article.standfirst);
    }

    // Corpo: ao menos o primeiro parágrafo precisa estar no HTML entregue.
    const firstParagraph = article.body.find((block) => block.type === "paragraph");
    expect(firstParagraph).toBeDefined();
    if (firstParagraph?.type === "paragraph") {
      await expect(page.locator("article")).toContainText(firstParagraph.text.slice(0, 60));
    }

    // Data legível por máquina — `<time datetime>`, não texto solto.
    await expect(page.locator("article time[datetime]").first()).toBeVisible();

    // Autor com destino real, não um nome inerte.
    // Pelo `href`, não pelo texto: a assinatura mostra o NOME do autor ("Marina Sousa"),
    // enquanto `authorSlug` é a forma de endereço ("marina-sousa"). Casar rótulo com slug
    // procurava algo que a página nunca deveria escrever.
    await expect(page.locator(`a[href="/autor/${article.authorSlug}"]`).first()).toBeVisible();

    // Vínculo geográfico: município sempre; bairro quando a matéria tem um.
    await expect(page.locator('article a[href^="/"]').first()).toBeVisible();
    await expect(page.locator("[data-pd-municipality]")).toHaveCount(1);

    // Selo de curadoria e rodapé de atribuição — Princípio V e FR-018.
    await expect(page.locator("[data-pd-curation]")).toBeVisible();
    await expect(page.locator("[data-pd-attribution]")).toContainText(
      /informações originais publicadas por/i,
    );
  });

  test("a navegação principal funciona por link real", async ({ page }) => {
    await page.goto("/");

    const links = page.locator("header nav a[href]");
    expect(await links.count()).toBeGreaterThan(0);

    // Nenhum destino pode depender de manipulador de evento (contracts/routes.md, regra 5).
    const hrefs = await links.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("href") ?? ""),
    );
    for (const href of hrefs) {
      expect(href, "link de navegação sem destino resolvível").not.toBe("");
      expect(href).not.toBe("#");
    }
  });

  test("a busca opera por GET nativo", async ({ page }) => {
    await page.goto("/busca");

    const form = page.locator("form[action='/busca']");
    await expect(form).toHaveAttribute("method", /get/i);

    await page.getByRole("searchbox").fill("centro");
    await page.getByRole("button", { name: /buscar/i }).click();

    await expect(page).toHaveURL(/\/busca\?.*q=centro/);
    // Sem resultado ou com resultado, o estado precisa ser anunciado a tecnologia assistiva.
    await expect(page.locator("[role='status']").first()).toBeVisible();
  });

  test("a paginação avança por link, não por script", async ({ page }) => {
    await page.goto("/");

    const next = page.getByRole("link", { name: /próxima|página 2/i }).first();
    if ((await next.count()) === 0) {
      // Com poucos dados demonstrativos pode não haver segunda página; o que não pode
      // existir é paginação implementada como botão sem destino.
      await expect(page.locator("nav[aria-label='Paginação'] button")).toHaveCount(0);
      return;
    }

    await next.click();
    await expect(page).toHaveURL(/page=2/);
  });

  test("a newsletter submete por POST nativo", async ({ page }) => {
    await page.goto("/newsletter");

    const form = page.locator("form[data-pd-newsletter]");
    await expect(form).toHaveAttribute("method", /post/i);
    await expect(form.locator('input[type="email"]')).toBeVisible();
  });

  test("toda superfície pública entrega conteúdo sem script", async ({ page }) => {
    for (const surface of publicSurfaces()) {
      await page.goto(surface.path);

      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const text = (await page.locator("main#conteudo").innerText()).trim();
      expect(text.length, `${surface.name} veio vazia sem JavaScript`).toBeGreaterThan(80);
    }
  });
});
