/**
 * Enriquecimento da gaveta de navegação. Tudo o que ela precisa para funcionar já está no
 * HTML (`<details>`); este arquivo só acrescenta o que a marcação não oferece.
 *
 * Se este script não chegar, a gaveta continua abrindo, fechando e navegando — só não
 * fecha com `Esc` nem ao clicar fora. Essa é a fronteira certa entre requisito e conforto
 * (Princípio XI).
 */

const DRAWER_SELECTOR = "[data-pd-drawer]";

export function initNavDrawer(root: ParentNode = document): void {
  const drawers = root.querySelectorAll<HTMLDetailsElement>(DRAWER_SELECTOR);
  if (drawers.length === 0) return;

  for (const drawer of drawers) {
    // Fechar com Esc é expectativa de qualquer sobreposição; sem isso a pessoa que navega
    // por teclado fica presa tendo que tabular de volta até o gatilho.
    drawer.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !drawer.open) return;

      drawer.open = false;
      drawer.querySelector("summary")?.focus();
    });

    // Clique fora fecha. O `composedPath` cobre o caso de o alvo estar dentro de um
    // componente aninhado, em que `event.target` não é filho direto da gaveta.
    document.addEventListener("click", (event) => {
      if (!drawer.open) return;
      if (event.composedPath().includes(drawer)) return;

      drawer.open = false;
    });
  }
}
