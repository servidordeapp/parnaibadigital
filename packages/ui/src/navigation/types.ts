import type { IconName } from "@parnaibadigital/design-system/icons";

/**
 * Formas de dado que os componentes de navegação recebem.
 *
 * Vivem num `.ts` e não dentro do `.astro` porque `tsc` só enxerga o `export default` de um
 * módulo `.astro` (ver `src/astro-shims.d.ts`): um `export interface` lá dentro compila nas
 * aplicações e quebra no `typecheck` do pacote. Separá-las também dá à tela um lugar para
 * importar o tipo sem arrastar o componente junto.
 */

export interface BreadcrumbItem {
  label: string;
  /** Ausente no último item, que é a página corrente e não deve ser link. */
  href?: string | undefined;
}

export interface TabItem {
  label: string;
  /** Endereço real — abas navegam, não trocam painel por script (Princípio XI). */
  href: string;
  /** Contagem opcional ao lado do rótulo, usada pelas listagens do painel. */
  count?: number | undefined;
}

export interface HeaderSection {
  label: string;
  href: string;
  active?: boolean | undefined;
}

export interface HeaderCity {
  name: string;
  href: string;
  count?: number | undefined;
}

/** Manchete da faixa urgente. Ausente quando não há matéria urgente — a faixa some. */
export interface UrgentHeadline {
  headline: string;
  href: string;
  publishedAt: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: readonly FooterLink[];
}

/** Item da navegação lateral do painel. */
export interface AdminNavItem {
  label: string;
  href: string;
  /** Glifo do vocabulário fechado do DS. */
  icon: IconName;
  active?: boolean | undefined;
  /** Contagem exibida à direita ("312", "4"). Já formatada pela tela. */
  badge?: string | undefined;
  /** Contagem que pede atenção — pintada em cor-de-sol. */
  hot?: boolean | undefined;
}
