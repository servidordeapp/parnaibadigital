/**
 * Controle do aviso temporário.
 *
 * `showToast` é a única porta de entrada; a região viva já está no documento e este módulo
 * só troca o texto dela. Nenhuma tela cria elemento de aviso por conta própria — dois
 * mecanismos de aviso na mesma página produzem anúncios sobrepostos e ilegíveis.
 */

const TOAST_SELECTOR = "[data-pd-toast]";
const DEFAULT_DURATION = 2800;

let hideTimer: number | undefined;

export function showToast(message: string, duration = DEFAULT_DURATION): void {
  const toast = document.querySelector<HTMLElement>(TOAST_SELECTOR);
  const target = toast?.querySelector<HTMLElement>("[data-pd-toast-message]");
  if (toast === null || target === null || target === undefined) return;

  target.textContent = message;
  toast.hidden = false;

  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, duration);
}

/**
 * Liga os gatilhos declarativos: qualquer elemento com `data-pd-toast-trigger="mensagem"`
 * dispara o aviso ao ser acionado.
 *
 * O atributo é o contrato porque o painel desta fase não persiste nada (FR-038) — o aviso é
 * a única resposta a uma ação, e declará-lo no HTML mantém a tela legível sem caçar o
 * manipulador correspondente em outro arquivo.
 */
export function initToast(root: ParentNode = document): void {
  for (const trigger of root.querySelectorAll<HTMLElement>("[data-pd-toast-trigger]")) {
    trigger.addEventListener("click", (event) => {
      const message = trigger.dataset.pdToastTrigger ?? "";
      if (message === "") return;

      // Só previne o padrão em controle sem destino real: um link precisa continuar
      // navegando (Princípio XI).
      if (trigger.tagName === "BUTTON") event.preventDefault();
      showToast(message);
    });
  }
}
