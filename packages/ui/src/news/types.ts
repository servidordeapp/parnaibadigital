/**
 * Formas de dado dos componentes do grupo `news`.
 *
 * Vivem num `.ts` pelo mesmo motivo de `navigation/types.ts`: `tsc` só enxerga o
 * `export default` de um módulo `.astro`, então um `export interface` dentro do componente
 * compila nas aplicações e reprova no `typecheck` do pacote.
 */

export interface NeighborhoodLink {
  name: string;
  /** `/{municipio}/{bairro}` — destino real e indexável, nunca filtro por script. */
  href: string;
  count?: number | undefined;
  active?: boolean | undefined;
}

export interface ContextItem {
  label: string;
  value: string;
}

export interface ContextLink {
  label: string;
  href: string;
}
