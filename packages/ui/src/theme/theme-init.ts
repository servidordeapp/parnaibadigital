/**
 * D-07 / FR-009 — escolha de tema aplicada ANTES da primeira pintura.
 *
 * Este é o único script que precisa rodar de forma bloqueante no `<head>`. O motivo é
 * específico: se o tema fosse aplicado depois, quem escolheu escuro veria um lampejo branco
 * a cada navegação. Não é questão de gosto — é o `--surface-page` claro sendo pintado e
 * repintado, e num portal de notícias a pessoa navega o tempo todo.
 *
 * Por isso ele é minúsculo, síncrono e sem dependência: é inlinado pelo layout, não
 * carregado como módulo. Tudo o mais (o alternador) é adiado.
 */

export type ThemeChoice = "light" | "dark";

export const THEME_STORAGE_KEY = "pd-theme";

/**
 * Fonte da string inlinada no `<head>`. Mantida como template para que o conteúdo real
 * fique versionado e revisável junto do resto, em vez de virar HTML solto num layout.
 *
 * A ordem de decisão é: escolha explícita → preferência do sistema. Sem escolha, nada é
 * escrito em `data-theme`, e o CSS resolve por `prefers-color-scheme` — que é o que
 * permite ao aparelho trocar de tema ao anoitecer sem o site discordar.
 */
export const THEME_INIT_SNIPPET = `(function(){try{
var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}
}catch(e){}})();`;

/** Lê a escolha persistida. `undefined` significa "sem escolha", não "claro". */
export function readStoredTheme(): ThemeChoice | undefined {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : undefined;
  } catch {
    // Armazenamento bloqueado (navegação privada, política do navegador): o site continua
    // funcionando na preferência do sistema. Tema é conforto, não requisito de leitura.
    return undefined;
  }
}

/** Tema efetivamente em vigor agora — escolha explícita, ou o que o sistema pede. */
export function resolveActiveTheme(): ThemeChoice {
  const stored = readStoredTheme();
  if (stored !== undefined) return stored;
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: ThemeChoice): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Sem persistência a escolha vale só para esta página. Melhor que não alternar.
  }
}
