/** Formas de dado da tabela de listagem do painel. */

export interface DataColumn {
  key: string;
  label: string;
  /** Coluna ordenável — vira link, nunca `onclick` (Princípio XI). */
  sortable?: boolean | undefined;
  /** Alinha à direita valores numéricos, como o DS faz nas colunas de métrica. */
  numeric?: boolean | undefined;
}

export interface DataRow {
  id: string;
  /** Célula por chave de coluna. Já formatada pela tela (FR-026). */
  cells: Record<string, string>;
  /** Destino da linha inteira, quando ela é navegável. */
  href?: string | undefined;
  /** Rótulo de estado exibido como badge na primeira coluna. */
  badge?:
    | { label: string; tone: "urgent" | "brand" | "hot" | "utility" | "soft" | "neutral" }
    | undefined;
}
