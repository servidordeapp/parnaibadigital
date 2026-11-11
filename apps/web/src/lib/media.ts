import type { MediaRef } from "@parnaibadigital/types";

/**
 * T085 / Princípio I — as regras de imagem do portal, num lugar só.
 *
 * Quatro decisões, e nenhuma é preferência:
 *
 * 1. **AVIF com alternativa WebP.** AVIF entrega o mesmo quadro com menos bytes; WebP cobre
 *    o que não o suporta. A ordem no `<picture>` é a ordem de preferência do navegador — o
 *    primeiro formato aceito vence, e por isso AVIF vem antes.
 * 2. **`width`/`height` sempre escritos.** É deles que o navegador calcula a caixa antes do
 *    byte da imagem chegar. Sem eles, o texto abaixo salta quando a foto carrega — o
 *    layout shift que o orçamento de CLS (< 0,05) não absorve.
 * 3. **`loading="lazy"` fora da dobra, `fetchpriority="high"` só no LCP.** Marcar tudo como
 *    prioritário equivale a não marcar nada: o navegador perde a informação de qual imagem
 *    importa e o LCP piora em vez de melhorar.
 * 4. **Ausência de foto cai para o `PhotoFrame`, sem quebrar proporção** (edge case). O
 *    produto não tem banco de imagens (Assumption 9), então este é o caminho normal, não a
 *    exceção — e é por isso que a proporção precisa vir do chamador, não do arquivo.
 */

export type MediaRatio = "16/9" | "4/3" | "1/1" | "3/2";

/**
 * A imagem que é o LCP da página. **No máximo uma por tela** — marcar tudo como prioritário
 * equivale a não marcar nada: o navegador perde a informação de qual imagem importa e o LCP
 * piora em vez de melhorar.
 */
export interface PriorityDecision {
  priority: boolean;
  sizes: string;
}

/**
 * Largura anunciada ao navegador em cada contexto de layout.
 *
 * check-tokens-disable — `sizes` é atributo de rede, lido pelo pré-carregador **antes** de
 * qualquer CSS ser aplicado: `var(--content-measure)` ali não resolve, e o navegador
 * descartaria a dica inteira. Os números abaixo são os mesmos dos tokens de layout do DS
 * (`--content-measure` 680px, `--sidebar-width` 336px) e as larguras de virada do protótipo.
 */
export const SIZES = {
  /** Coluna principal de matéria — 680px a partir de 900px de viewport. */
  /* check-tokens-disable — atributo `sizes`, ver nota acima. */
  article: "(min-width: 900px) 680px, 100vw",
  /** Card do grid — meia coluna acima de 640px. */
  /* check-tokens-disable — atributo `sizes`, ver nota acima. */
  card: "(min-width: 900px) 420px, (min-width: 640px) 50vw, 100vw",
  /** Barra lateral, largura fixa do DS. */
  /* check-tokens-disable — atributo `sizes`, ver nota acima. */
  sidebar: "336px",
  /** Manchete, que ocupa a coluna inteira. */
  /* check-tokens-disable — atributo `sizes`, ver nota acima. */
  hero: "(min-width: 900px) 840px, 100vw",
} as const;

/**
 * Decide prioridade e `sizes` de uma imagem a partir do papel dela na página.
 *
 * A decisão mora aqui, e não no componente, porque é a **página** que sabe qual imagem está
 * acima da dobra — `PhotoFrame` só sabe desenhar. Deixar o componente adivinhar produziria
 * ou nenhuma prioridade (LCP lento) ou prioridade em todas (o mesmo efeito).
 */
export function roleOf(role: keyof typeof SIZES, isLcp = false): PriorityDecision {
  return { priority: isLcp, sizes: SIZES[role] };
}

/** Proporção como o CSS a espera, a partir das dimensões reais do arquivo. */
export function ratioOf(media: MediaRef): string {
  return `${String(media.width)} / ${String(media.height)}`;
}

/**
 * Texto alternativo de imagem decorativa.
 *
 * `alt=""` (vazio, não ausente) é o que retira a imagem da árvore de acessibilidade. `alt`
 * **ausente** faz o leitor de tela anunciar o nome do arquivo — o pior dos dois mundos.
 * O schema torna `alt` obrigatório justamente para que a decisão seja consciente.
 */
export const DECORATIVE_ALT = "";
