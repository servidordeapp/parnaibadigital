import { expect, test, type Page } from "@playwright/test";

import { publicSurfaces } from "../helpers/surfaces";

/**
 * T146 / Princípio XI / Princípio III — a página continua legível quando o terceiro cai.
 *
 * O edge case é o da fonte e do ícone indisponíveis. Ele merece teste próprio porque as duas
 * defesas desta fase são *estruturais* e, por isso mesmo, silenciosas: as famílias entram
 * auto-hospedadas (D-08) e cada glifo Lucide é inlinado em build (D-09). Nada disso aparece
 * numa tela verde — e a regressão que reintroduz um `@import` de CDN ou uma `mask-image`
 * remota também não apareceria, até o dia em que o host externo ficasse fora do ar.
 *
 * Os três defeitos concretos perseguidos aqui:
 *
 * 1. o texto some ou fica sem caixa quando o arquivo de fonte não chega (falta de fallback);
 * 2. o botão só de ícone fica sem rótulo nenhum quando o glifo não chega — clicável, mas
 *    ininteligível para quem vê e para quem ouve a tela;
 * 3. algum recurso de terceiro voltou ao caminho crítico sem ninguém notar.
 *
 * O bloqueio é feito por rota, não por desligar a rede: o objetivo é derrubar exatamente a
 * classe de recurso em questão e deixar o resto do documento intacto, que é como a falha
 * acontece na vida real.
 */

/** Tudo que a página pode buscar de fora do próprio documento e que este teste derruba. */
const ASSET_PATTERNS = ["**/*.woff", "**/*.woff2", "**/*.ttf", "**/*.otf", "**/*.svg"];

/** Origens do próprio produto. Qualquer outra é terceiro. */
const OWN_ORIGINS = ["http://localhost:4321", "http://localhost:4322"];

async function blockFontsAndIcons(page: Page): Promise<void> {
  for (const pattern of ASSET_PATTERNS) {
    await page.route(pattern, (route) => route.abort());
  }
}

test.describe("@degradacao fonte e ícone indisponíveis", () => {
  test("o conteúdo permanece legível sem os arquivos de fonte", async ({ page }) => {
    await blockFontsAndIcons(page);

    for (const surface of publicSurfaces()) {
      await page.goto(surface.path);

      const heading = page.locator("main#conteudo h1").first();
      await expect(heading, `${surface.name}: título ausente sem as fontes`).toBeVisible();

      // Caixa com altura real prova que a pilha de fallback assumiu. Um `font-display`
      // errado deixaria o texto invisível ("flash of invisible text") sem apagar o nó do
      // DOM — `toBeVisible()` sozinho não pegaria isso, a medida pega.
      const box = await heading.boundingBox();
      expect(box?.height ?? 0, `${surface.name}: título sem altura sem as fontes`).toBeGreaterThan(
        0,
      );

      const text = ((await heading.textContent()) ?? "").trim();
      expect(text.length, `${surface.name}: título vazio sem as fontes`).toBeGreaterThan(0);

      // A família resolvida precisa manter um genérico no fim da pilha; sem ele, o navegador
      // cai na fonte padrão do sistema por acidente e não por projeto.
      const family = await heading.evaluate((node) => getComputedStyle(node).fontFamily);
      expect(family, `${surface.name}: pilha de fonte sem genérico final`).toMatch(
        /sans-serif|serif|monospace|system-ui/,
      );
    }
  });

  test("nenhum controle fica sem rótulo acessível sem os glifos", async ({ page }) => {
    await blockFontsAndIcons(page);

    for (const surface of publicSurfaces()) {
      await page.goto(surface.path);

      const controls = page.locator("button, a[href], summary, [role='button']");

      // Só os controles sem texto próprio interessam: são exatamente os que dependeriam do
      // glifo para significar alguma coisa. Um botão com rótulo escrito sobrevive à queda do
      // ícone por construção, e verificá-lo só tornaria o teste mais lento.
      //
      // A visibilidade entra no filtro porque nome acessível de elemento fora da árvore é ""
      // por definição, não por defeito: o gatilho da gaveta é `display: none` acima de 900px
      // e reprovaria em 1280px mesmo tendo `aria-label`. O projeto de 360px é quem o exibe —
      // e é lá que a asserção sobre ele tem sentido.
      const iconOnly = await controls.evaluateAll((nodes) =>
        nodes
          .map((node, index) => ({
            index,
            text: node.textContent.trim(),
            visible: node.checkVisibility(),
          }))
          .filter((entry) => entry.visible && entry.text.length === 0)
          .map((entry) => entry.index),
      );

      for (const index of iconOnly) {
        await expect(
          controls.nth(index),
          `${surface.name}: controle ${String(index)} sem rótulo acessível sem o glifo`,
        ).not.toHaveAccessibleName("");
      }
    }
  });

  test("nenhuma superfície pública busca recurso de terceiro", async ({ page }) => {
    const external: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (url.startsWith("data:") || url.startsWith("blob:")) return;
      if (OWN_ORIGINS.some((origin) => url.startsWith(origin))) return;
      external.push(`${request.resourceType()} ${url}`);
    });

    for (const surface of publicSurfaces()) {
      await page.goto(surface.path);
      await page.waitForLoadState("networkidle");
    }

    // FR-038 e Princípio I: nem fonte, nem ícone, nem rede de anúncio. Se esta lista deixar
    // de ser vazia, o teste anterior passou a medir a degradação de algo que, em produção,
    // já estaria fora do controle deste repositório.
    expect(external, `recursos de terceiro requisitados:\n${external.join("\n")}`).toEqual([]);
  });
});
