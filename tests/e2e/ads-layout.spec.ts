import { expect, test } from "@playwright/test";

import { publicSurfaces } from "../helpers/surfaces";

/**
 * T051 / FR-032 / Princípio I — o slot de anúncio reserva espaço antes de existir conteúdo.
 *
 * O defeito que este arquivo persegue é concreto: publicidade inserida sem altura reservada
 * empurra o texto para baixo depois da primeira pintura, a pessoa perde a linha que estava
 * lendo e o CLS estoura o orçamento (< 0,05). Reservar altura por token `--ad-*` é a
 * correção; medir a altura antes de qualquer carga é a prova.
 *
 * Nenhuma rede real participa (FR-038). O slot aqui é caixa rotulada — e é justamente por
 * isso que a geometria dele pode ser verificada de forma determinística.
 */

const MAX_SLOTS_ABOVE_THE_FOLD = 3;

test.describe("@ads geometria dos slots de anúncio", () => {
  test("todo slot tem altura reservada e rótulo antes de qualquer carga", async ({ page }) => {
    for (const surface of publicSurfaces()) {
      await page.goto(surface.path);

      const slots = page.locator("[data-pd-ad-slot]");
      const count = await slots.count();

      for (let index = 0; index < count; index += 1) {
        const slot = slots.nth(index);
        const box = await slot.boundingBox();

        expect(box, `${surface.name}: slot ${String(index)} sem caixa`).not.toBeNull();
        expect(
          box?.height ?? 0,
          `${surface.name}: slot ${String(index)} sem altura reservada`,
        ).toBeGreaterThan(0);

        // Rótulo visível: a pessoa precisa saber que aquilo é publicidade, e não conteúdo
        // editorial disfarçado (Princípio V).
        await expect(slot).toContainText(/anúncio/i);
      }
    }
  });

  test("nenhum conteúdo editorial se desloca por causa dos slots", async ({ page }) => {
    for (const surface of publicSurfaces()) {
      await page.goto(surface.path);

      const before = await page.locator("main#conteudo h1").boundingBox();
      // Espera além do primeiro quadro: se alguma altura fosse definida tarde, é aqui que
      // o deslocamento apareceria.
      await page.waitForTimeout(400);
      const after = await page.locator("main#conteudo h1").boundingBox();

      expect(after?.y, `${surface.name}: o título se moveu`).toBeCloseTo(before?.y ?? 0, 0);
    }
  });

  test("no máximo três slots acima da dobra", async ({ page }) => {
    for (const surface of publicSurfaces()) {
      await page.goto(surface.path);

      const viewportHeight = page.viewportSize()?.height ?? 0;
      const slots = page.locator("[data-pd-ad-slot]");
      const boxes = await slots.evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect().top),
      );

      const aboveFold = boxes.filter((top) => top < viewportHeight).length;
      expect(
        aboveFold,
        `${surface.name} tem ${String(aboveFold)} slots acima da dobra`,
      ).toBeLessThanOrEqual(MAX_SLOTS_ABOVE_THE_FOLD);
    }
  });

  test("nunca dois slots consecutivos sem conteúdo entre eles", async ({ page }) => {
    for (const surface of publicSurfaces()) {
      await page.goto(surface.path);

      // A regra do FR-032 é sobre o que o leitor encontra ENTRE dois anúncios, não sobre
      // parentesco no DOM. Comparar irmãos reprovava `/anuncie`, onde cada espécime de
      // formato vem com título e explicação próprios — conteúdo de verdade entre um slot e
      // o seguinte. O que se mede aqui é o texto que existe no intervalo entre eles.
      const adjacent = await page.evaluate(() => {
        const slots = [...document.querySelectorAll("[data-pd-ad-slot]")];

        return slots.filter((slot, index) => {
          const next = slots[index + 1];
          if (next === undefined) return false;

          const between = document.createRange();
          between.setStartAfter(slot);
          between.setEndBefore(next);

          return between.toString().trim().length === 0;
        }).length;
      });

      expect(adjacent, `${surface.name} empilha slots sem conteúdo entre eles`).toBe(0);
    }
  });

  test("a zona de anúncio permanece visualmente distinta do editorial nos dois temas", async ({
    page,
  }) => {
    for (const theme of ["light", "dark"] as const) {
      await page.goto("/");
      await page.evaluate((value) => {
        document.documentElement.setAttribute("data-theme", value);
      }, theme);

      const slot = page.locator("[data-pd-ad-slot]").first();
      if ((await slot.count()) === 0) continue;

      const [adBackground, cardBackground] = await page.evaluate(() => {
        const ad = document.querySelector("[data-pd-ad-slot]");
        const card = document.querySelector(".pd-card");
        return [
          ad === null ? "" : getComputedStyle(ad).backgroundColor,
          card === null ? "" : getComputedStyle(card).backgroundColor,
        ];
      });

      // O cinza frio `--pd-ad-*` existe para que publicidade nunca se confunda com card
      // editorial — inclusive no tema escuro, que é o caso que costuma passar batido.
      expect(adBackground, `tema ${theme}: slot sem fundo próprio`).not.toBe("");
      expect(adBackground, `tema ${theme}: slot com o mesmo fundo do card`).not.toBe(
        cardBackground,
      );
    }
  });
});
