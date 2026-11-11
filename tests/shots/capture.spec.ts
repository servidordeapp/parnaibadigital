import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

import { test, type Page } from "@playwright/test";

import { ADMIN_BASE_URL, adminSurfaces } from "../helpers/admin";
import { publicSurfaces } from "../helpers/surfaces";

/**
 * T143 / cenário V2 do quickstart — as capturas que a revisão visual lado a lado consome.
 *
 * Não é um teste: não afirma nada e não reprova nada. É ferramenta, e mora aqui pelo mesmo
 * motivo que economiza um segundo servidor de pré-visualização e uma segunda lista de rotas:
 * a configuração do Playwright já sobe as duas aplicações e já define as duas larguras que a
 * revisão exige. Reimplementar isso num script solto significaria manter duas listas de
 * superfície e vê-las divergirem.
 *
 * A paridade com o protótipo é **julgamento humano** (SC-002). O que a máquina faz é
 * garantir que as 25 superfícies sejam capturadas nas 4 combinações, sempre, sem depender de
 * alguém lembrar de uma delas — que é justamente como uma tela escapa da revisão.
 *
 * Saída: `.shots/{tema}/{largura}/{superfície}.png`, ignorada pelo Git.
 */

const OUTPUT_ROOT = ".shots";

async function capture(page: Page, url: string, file: string): Promise<void> {
  for (const theme of ["light", "dark"] as const) {
    await page.goto(url);
    await page.emulateMedia({ colorScheme: theme });
    await page.evaluate((value) => {
      document.documentElement.setAttribute("data-theme", value);
    }, theme);

    // O pipeline do painel entra escalonado e o hero tem transição de entrada; capturar no
    // meio produz uma imagem que não corresponde a nenhum estado real e faz a revisão
    // discutir um artefato de timing em vez do desenho.
    await page
      .waitForFunction(
        () => document.getAnimations().every((animation) => animation.playState !== "running"),
        undefined,
        { timeout: 5000 },
      )
      .catch(() => {
        /* animação infinita (a varredura do Skeleton) nunca termina — seguir é o certo */
      });

    const width = page.viewportSize()?.width ?? 0;
    const path = join(OUTPUT_ROOT, theme, String(width), `${file}.png`);
    await mkdir(dirname(path), { recursive: true });
    await page.screenshot({ path, fullPage: true });
  }
}

/** Nome de arquivo estável a partir da rota, para que a revisão compare sempre o mesmo par. */
function fileNameFor(path: string): string {
  const cleaned = path.replace(/^\//, "").replace(/\/$/, "");
  return cleaned === "" ? "home" : cleaned.replace(/\//g, "__");
}

/**
 * Um caso por superfície, e não um laço dentro de um caso só.
 *
 * A diferença é prática: a captura de página inteira nos dois temas leva alguns segundos por
 * tela, e 14 delas em sequência estouram o tempo limite padrão. Como caso independente, cada
 * superfície roda em paralelo e uma tela que falhe não leva junto as capturas das outras — a
 * revisão continua tendo o que olhar.
 */
test.describe("@shots capturas para a revisão visual", () => {
  for (const surface of publicSurfaces()) {
    test(`portal — ${surface.name}`, async ({ page }) => {
      await capture(page, surface.path, fileNameFor(surface.path));
    });
  }

  // A tela de erro não aparece em `publicSurfaces()` porque não é navegável, mas a revisão
  // precisa dela: é a 14ª superfície pública do contrato.
  test("portal — Erro 404", async ({ page }) => {
    await capture(page, "/rota-que-nao-existe", "404");
  });

  for (const surface of adminSurfaces()) {
    test(`painel — ${surface.name}`, async ({ page }) => {
      await capture(
        page,
        `${ADMIN_BASE_URL}${surface.path}`,
        `admin__${fileNameFor(surface.path)}`,
      );
    });
  }
});
