/**
 * Atalho `Ctrl/Cmd+K` para o índice de telas.
 *
 * O foco preso, o `Esc` e a semântica de modal vêm do `<dialog>` — este arquivo só liga o
 * atalho e filtra a lista. Menos código nosso aqui significa menos chance de errar
 * gerenciamento de foco, que é o defeito mais comum em sobreposição feita à mão.
 */

const PALETTE_SELECTOR = "[data-pd-palette]";

function matches(item: HTMLElement, term: string): boolean {
  if (term === "") return true;
  return item.textContent.toLowerCase().includes(term);
}

export function initCommandPalette(root: ParentNode = document): void {
  const palette = root.querySelector<HTMLDialogElement>(PALETTE_SELECTOR);
  if (palette === null) return;

  const input = palette.querySelector<HTMLInputElement>("[data-pd-palette-input]");
  const empty = palette.querySelector<HTMLElement>("[data-pd-palette-empty]");
  const items = [...palette.querySelectorAll<HTMLElement>("[data-pd-palette-item]")];

  document.addEventListener("keydown", (event) => {
    const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    if (!isShortcut) return;

    // O navegador usa Cmd/Ctrl+K para a barra de endereços em alguns casos; o produto
    // reivindica o atalho só quando o diálogo existe na página.
    event.preventDefault();

    if (palette.open) {
      palette.close();
      return;
    }

    palette.showModal();
    input?.focus();
  });

  input?.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    let visible = 0;

    for (const item of items) {
      const shown = matches(item, term);
      const entry = item.closest("li");
      if (entry !== null) entry.hidden = !shown;
      if (shown) visible += 1;
    }

    // Grupo sem nenhum item visível não deve continuar mostrando o próprio título.
    for (const group of palette.querySelectorAll<HTMLElement>(".pd-palette__group")) {
      const anyVisible = [...group.querySelectorAll("li")].some((entry) => !entry.hidden);
      group.hidden = !anyVisible;
    }

    if (empty !== null) empty.hidden = visible > 0;
  });
}
