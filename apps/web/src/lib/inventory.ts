import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

/**
 * T111 / T113 / FR-005 / FR-007 — o inventário de componentes, derivado do Design System.
 *
 * A lista dos 31 componentes publicados **não é escrita aqui**: sai do `_ds_manifest.json`
 * vendorizado. É o que torna a galeria uma verificação em vez de uma vitrine — se o DS
 * publicar um componente e `packages/ui` não o implementar, a galeria acusa a lacuna sozinha
 * em vez de deixar o inventário parecer completo.
 *
 * As 5 adições justificadas entram marcadas, com a justificativa de
 * `contracts/component-inventory.md` copiada junto. Adição sem justificativa visível é como
 * um Design System vira dois.
 */

const require = createRequire(import.meta.url);

interface DsManifest {
  components: { name: string; sourcePath: string }[];
}

export type InventoryStatus = "do-design-system" | "adicao-justificada";

export interface InventoryEntry {
  name: string;
  /** Grupo como na origem do DS: core, brand, news, navigation, widgets, tourism, ads… */
  group: string;
  status: InventoryStatus;
  /** Caminho em `packages/ui`, para quem for procurar a definição. */
  path: string;
  /** Obrigatória nas adições (FR-007); vazia nos componentes publicados pelo DS. */
  justification?: string;
  /** `false` enquanto a implementação não existir — a galeria mostra a lacuna. */
  implemented: boolean;
}

/** As 5 adições de `contracts/component-inventory.md`, com a justificativa junto. */
const ADDITIONS: Omit<InventoryEntry, "implemented">[] = [
  {
    name: "CommandPalette",
    group: "overlay",
    status: "adicao-justificada",
    path: "src/overlay/CommandPalette.astro",
    justification:
      "Índice de telas por Ctrl/Cmd+K, usado em todas as superfícies do protótipo; o DS não publica equivalente.",
  },
  {
    name: "NavDrawer",
    group: "overlay",
    status: "adicao-justificada",
    path: "src/overlay/NavDrawer.astro",
    justification:
      "Navegação móvel na virada para coluna única. O SiteHeader do DS não publica gaveta e o protótipo a implementa inline.",
  },
  {
    name: "Toast",
    group: "overlay",
    status: "adicao-justificada",
    path: "src/overlay/Toast.astro",
    justification:
      "Aviso temporário do painel. O readme.md do DS declara explicitamente que não foi criado.",
  },
  {
    name: "Skeleton",
    group: "feedback",
    status: "adicao-justificada",
    path: "src/feedback/Skeleton.astro",
    justification:
      "Estado de carregamento exigido por FR-014, com anúncio a tecnologia assistiva (Princípio III).",
  },
  {
    name: "DataTable",
    group: "data",
    status: "adicao-justificada",
    path: "src/data/DataTable.astro",
    justification:
      "Tabela de listagem do painel, com ordenação por link e estado vazio. Sem equivalente no DS.",
  },
];

/** Componentes de `packages/ui` que existem hoje — lido do próprio pacote, não declarado. */
function implementedComponents(): Set<string> {
  const barrel = readFileSync(require.resolve("@parnaibadigital/ui"), "utf8");
  const names = [...barrel.matchAll(/export \{ default as (\w+) \}/g)].map((match) => match[1]);
  return new Set(names.filter((name): name is string => name !== undefined));
}

function groupOf(sourcePath: string): string {
  return sourcePath.split("/")[1] ?? "core";
}

export function inventory(): InventoryEntry[] {
  const manifestPath =
    require.resolve("@parnaibadigital/design-system/vendor/parna-badigital-design-system-fe257784-b721-4adc-b4cd-6b322b375c04/_ds_manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as DsManifest;
  const implemented = implementedComponents();

  const fromDs: InventoryEntry[] = manifest.components.map((component) => ({
    name: component.name,
    group: groupOf(component.sourcePath),
    status: "do-design-system",
    path: component.sourcePath.replace(/^components/, "src").replace(/\.jsx$/, ".astro"),
    implemented: implemented.has(component.name),
  }));

  const additions: InventoryEntry[] = ADDITIONS.map((addition) => ({
    ...addition,
    implemented: implemented.has(addition.name),
  }));

  return [...fromDs, ...additions].sort(
    (a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name),
  );
}

export function groups(): string[] {
  return [...new Set(inventory().map((entry) => entry.group))].sort();
}
