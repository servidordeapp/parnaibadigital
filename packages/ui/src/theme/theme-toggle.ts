import { applyTheme, resolveActiveTheme, type ThemeChoice } from "./theme-init";

/**
 * Alternador de tema. Enriquecimento, não requisito (Princípio XI): sem JavaScript a
 * página continua legível no tema do sistema, e o botão simplesmente não aparece — em vez
 * de aparecer e não fazer nada, que é pior do que não existir.
 *
 * O elemento é marcado por `data-pd-theme-toggle`; o layout o entrega em `pending`, com a
 * caixa já reservada e `visibility: hidden`, e este script o promove a `ready`. A distinção
 * importa: revelá-lo com o atributo `hidden` o devolvia ao fluxo depois da primeira pintura
 * e empurrava a página inteira para baixo — 0,086 de CLS em toda superfície.
 */

const TOGGLE_SELECTOR = "[data-pd-theme-toggle]";

function labelFor(theme: ThemeChoice): string {
  // A ação, não o estado: o botão diz o que vai acontecer se for acionado.
  return theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro";
}

function syncToggle(button: HTMLElement, theme: ThemeChoice): void {
  button.setAttribute("aria-pressed", String(theme === "dark"));
  button.setAttribute("aria-label", labelFor(theme));
  button.setAttribute("title", labelFor(theme));
}

export function initThemeToggle(root: ParentNode = document): void {
  const buttons = root.querySelectorAll<HTMLElement>(TOGGLE_SELECTOR);
  if (buttons.length === 0) return;

  let current = resolveActiveTheme();

  for (const button of buttons) {
    button.dataset.pdThemeToggle = "ready";
    syncToggle(button, current);

    button.addEventListener("click", () => {
      current = current === "dark" ? "light" : "dark";
      applyTheme(current);
      for (const other of buttons) syncToggle(other, current);
    });
  }

  // Enquanto a pessoa não escolher explicitamente, o site acompanha o aparelho — inclusive
  // se ele virar para escuro com a página aberta.
  globalThis.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    if (document.documentElement.hasAttribute("data-theme")) return;
    current = event.matches ? "dark" : "light";
    for (const button of buttons) syncToggle(button, current);
  });
}
