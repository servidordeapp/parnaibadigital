import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL("../src", import.meta.url));
const BARREL = join(SRC, "index.ts");

function astroFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...astroFiles(full));
    else if (entry.endsWith(".astro")) found.push(full);
  }
  return found;
}

/** Só o frontmatter — o `---` fecha antes da marcação, e é lá que a tipagem vive. */
function frontmatter(source: string): string {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  return match?.[1] ?? "";
}

/** Sem comentários: `any` citado numa justificativa não é `any` no tipo. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

const components = astroFiles(SRC).map((path) => ({
  path,
  id: relative(SRC, path).split(sep).join("/"),
  source: readFileSync(path, "utf8"),
}));

const barrel = readFileSync(BARREL, "utf8");

/**
 * Contrato do inventário de componentes, item 1: "Props tipadas por `interface Props`, sem
 * `any`". A regra existe porque `any` num componente compartilhado não falha nele — falha
 * na tela que o consome, meses depois, sem que o compilador avise. É o tipo de erosão que
 * só um portão pega, porque nenhuma revisão humana lê 36 componentes toda vez.
 */
describe("contrato de props de `packages/ui`", () => {
  it("encontrou componentes para verificar", () => {
    expect(components.length).toBeGreaterThan(0);
  });

  it.each(components.map((c) => c.id))("%s declara `interface Props`", (id) => {
    const component = components.find((c) => c.id === id);
    expect(frontmatter(component?.source ?? "")).toMatch(/interface Props\s*\{/);
  });

  it.each(components.map((c) => c.id))("%s não usa `any` em posição de tipo", (id) => {
    const component = components.find((c) => c.id === id);
    const code = stripComments(frontmatter(component?.source ?? ""));

    // `: any`, `<any>`, `any[]`, `as any`, `| any` — as formas em que ele realmente aparece.
    expect(code, `\`any\` em ${id}`).not.toMatch(/(?::|<|\||\bas)\s*any\b|\bany\s*\[\]/);
  });

  it.each(components.map((c) => c.id))("%s não usa `@ts-ignore`", (id) => {
    const component = components.find((c) => c.id === id);
    // `@ts-expect-error` é aceitável — falha se o erro sumir. `@ts-ignore` silencia para sempre.
    expect(component?.source).not.toMatch(/@ts-ignore/);
  });
});

/**
 * SC-012 — uma definição por componente, alcançada por uma fronteira só. Um componente que
 * existe em `src/` mas não sai pelo barril convida a tela a importar o caminho interno, e
 * é assim que a segunda definição nasce.
 */
describe("barril de exportação", () => {
  it.each(components.map((c) => c.id))("%s é exportado por `src/index.ts`", (id) => {
    expect(barrel).toContain(`"./${id}"`);
  });
});
