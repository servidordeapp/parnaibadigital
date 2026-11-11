import { expect, test } from "@playwright/test";

import {
  EXPECTED_PUBLIC_SURFACE_COUNT,
  municipalityPaths,
  publicSurfaces,
} from "../helpers/surfaces";

/**
 * T046 / SC-001 — as 14 superfícies de `contracts/routes.md` existem, respondem 200 e têm
 * endereço próprio.
 *
 * "Endereço próprio" é a parte que o teste realmente protege. Um protótipo reproduzido com
 * troca de tela por JavaScript passaria em qualquer verificação de conteúdo e falharia aqui:
 * sem URL distinta não há canônica, não há sitemap, não há link compartilhável e não há
 * indexação (Princípio II). Por isso cada superfície é alcançada por navegação direta, e não
 * a partir da home.
 *
 * O 404 é afirmado como **status**, não como aparência. Uma tela bonita devolvida com 200
 * ensina o rastreador que a página existe — é soft 404, e é erro de SEO, não de estilo.
 */

test.describe("@surfaces superfícies públicas", () => {
  const surfaces = publicSurfaces();

  test("o contrato de rotas está inteiramente coberto", () => {
    // Guarda contra o modo silencioso de falhar: se os dados demonstrativos sumirem, as
    // superfícies dinâmicas viram lista vazia e o `for` abaixo não roda nenhum caso —
    // a suíte ficaria verde sem ter testado nada.
    expect(surfaces.length).toBe(EXPECTED_PUBLIC_SURFACE_COUNT);
  });

  for (const surface of surfaces) {
    test(`${surface.name} responde 200 em ${surface.path}`, async ({ page }) => {
      const response = await page.goto(surface.path);

      expect(response, `sem resposta para ${surface.path}`).not.toBeNull();
      expect(response?.status(), `${surface.name} não respondeu 200`).toBe(200);

      // Uma superfície sem H1 é uma superfície sem assunto declarado — quebra o esboço do
      // documento (WCAG 1.3.1) e o entendimento da página pelo rastreador.
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main#conteudo")).toBeVisible();
    });
  }

  test("todo hub de município vem do registro, nenhum é codificado", async ({ page }) => {
    const paths = municipalityPaths();
    expect(paths.length).toBeGreaterThan(0);

    for (const path of paths) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} não respondeu 200`).toBe(200);
    }
  });

  test("endereço inexistente responde 404 real, não uma tela 200", async ({ page }) => {
    const response = await page.goto("/rua-que-nao-existe-no-delta");

    expect(response?.status()).toBe(404);
    // A tela de erro precisa oferecer saída: sem navegação de retorno o 404 é um beco.
    await expect(page.getByRole("link", { name: /ir para a home/i })).toBeVisible();
  });

  test("a busca é a única superfície pública não indexável", async ({ page }) => {
    for (const surface of surfaces) {
      await page.goto(surface.path);
      const robots = await page.locator('head meta[name="robots"]').getAttribute("content");

      if (surface.indexable) {
        expect(robots ?? "", `${surface.name} não deveria ser noindex`).not.toContain("noindex");
      } else {
        expect(robots ?? "", `${surface.name} deveria ser noindex`).toContain("noindex");
        // `follow` é deliberado: a busca não entra no índice, mas os links dela continuam
        // transmitindo descoberta para as matérias.
        expect(robots ?? "").toContain("follow");
      }
    }
  });
});
