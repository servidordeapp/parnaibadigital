import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/**
 * D-19 / Princípio III — asserção de acessibilidade reutilizável por superfície e por tema.
 *
 * Existe como helper por um motivo concreto: são 25 superfícies × 2 temas. Repetir a
 * configuração do axe em cada arquivo garantiria que, com o tempo, uma tela passasse a
 * checar menos que as outras — e uma cobertura desigual é pior que nenhuma, porque dá a
 * impressão de estar coberta.
 *
 * Zero violação WCAG 2.1 AA é o critério (SC-004). Não há lista de exceções: uma exceção
 * aceita numa tela vira precedente para as próximas 24.
 */

export type Theme = "light" | "dark";

const WCAG_21_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/** Aplica o tema como a pessoa aplicaria — pelo mesmo `data-theme` que o site usa. */
export async function setTheme(page: Page, theme: Theme): Promise<void> {
  await page.emulateMedia({ colorScheme: theme });
  await page.evaluate((value) => {
    document.documentElement.setAttribute("data-theme", value);
  }, theme);
}

export interface AxeOptions {
  /** Restringe a análise a uma região — usado quando a tela embute um exemplo isolado. */
  include?: string;
}

/**
 * Espera as animações de entrada terminarem antes de medir.
 *
 * O pipeline do painel entra escalonado, uma etapa por vez (T100). Analisar no meio da
 * transição faz o axe medir contraste de um texto a meio caminho do `opacity: 0` — 1,66:1 de
 * um elemento que, parado, tem 12:1. Não é o defeito que se quer encontrar: o critério de
 * contraste é sobre o estado em repouso, e o comportamento sob `prefers-reduced-motion` tem
 * teste próprio. Sem esta espera, o portão vira sorteio.
 */
async function waitForAnimationsToSettle(page: Page): Promise<void> {
  await page
    .waitForFunction(
      () => document.getAnimations().every((animation) => animation.playState !== "running"),
      undefined,
      { timeout: 5000 },
    )
    .catch(() => {
      // Animação infinita (a varredura do Skeleton) nunca termina; seguir em frente é o
      // certo — ela não carrega texto.
    });
}

export async function expectNoAxeViolations(page: Page, options: AxeOptions = {}): Promise<void> {
  await waitForAnimationsToSettle(page);

  let builder = new AxeBuilder({ page }).withTags(WCAG_21_AA);
  if (options.include !== undefined) {
    builder = builder.include(options.include);
  }

  const results = await builder.analyze();

  // A mensagem lista regra, impacto e o seletor exato: sem isso, "3 violations" obriga a
  // reabrir o navegador para descobrir onde.
  const summary = results.violations
    .map(
      (violation) =>
        `  [${violation.impact ?? "n/d"}] ${violation.id}: ${violation.help}\n` +
        violation.nodes.map((node) => `      ${node.target.join(" ")}`).join("\n"),
    )
    .join("\n");

  expect(results.violations, `Violações WCAG 2.1 AA:\n${summary}`).toEqual([]);
}

/**
 * Roda a asserção nos dois temas. É o formato padrão de todo teste de a11y desta fase:
 * um tema aprovado não diz nada sobre o outro, e o tema escuro é justamente onde o
 * contraste costuma quebrar (D-07).
 */
export async function expectAccessibleInBothThemes(
  page: Page,
  url: string,
  options: AxeOptions = {},
): Promise<void> {
  for (const theme of ["light", "dark"] as const) {
    await page.goto(url);
    await setTheme(page, theme);
    await expectNoAxeViolations(page, options);
  }
}
