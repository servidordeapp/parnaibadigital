import { readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * T110 / SC-012 — **uma definição por componente**.
 *
 * A promessa de "zero duplicação" só vale se for verificável. Sem este teste, a segunda
 * definição de `NewsCard` — criada por pressa dentro de `apps/admin` — passaria em lint, em
 * typecheck e em build, e só apareceria meses depois como duas telas divergindo de aparência
 * sem que ninguém tivesse decidido isso.
 *
 * O que se verifica é o nome do arquivo de componente, não o conteúdo: dois `.astro` com o
 * mesmo nome em pacotes diferentes já são duas definições, ainda que hoje sejam idênticos.
 */

const REPO_ROOT = new URL("../../../", import.meta.url).pathname;

/** Onde um componente pode nascer. `packages/ui` é o único lugar legítimo. */
const SEARCH_ROOTS = ["packages/ui/src", "apps/web/src", "apps/admin/src"];

const IGNORED = new Set(["node_modules", "dist", ".astro"]);

function walk(dir: string): string[] {
  const found: string[] = [];

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return found; // diretório ainda não existe — não é falha deste teste
  }

  for (const entry of entries) {
    if (IGNORED.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...walk(full));
    } else if (extname(full) === ".astro") {
      found.push(full);
    }
  }

  return found;
}

/**
 * Layouts e páginas não são componentes: `BaseLayout` e `PortalLayout` são de cada
 * aplicação por desenho, e uma página é única por rota. Confundi-los com componentes faria
 * o teste reprovar a arquitetura correta.
 */
function isComponent(path: string): boolean {
  return !/[\\/](pages|layouts|components)[\\/]/.test(path);
}

describe("SC-012 — definição única por componente", () => {
  const files = SEARCH_ROOTS.flatMap((root) => walk(join(REPO_ROOT, root))).filter(isComponent);

  it("encontra os componentes de packages/ui", () => {
    // Guarda contra o teste virar vazio: se a varredura parar de achar arquivos, tudo
    // "passa" sem ter verificado nada.
    expect(files.length).toBeGreaterThan(20);
  });

  it("nenhum nome de componente tem duas definições", () => {
    const byName = new Map<string, string[]>();

    for (const file of files) {
      const name =
        file
          .split(/[\\/]/)
          .pop()
          ?.replace(/\.astro$/, "") ?? "";
      byName.set(name, [...(byName.get(name) ?? []), relative(REPO_ROOT, file)]);
    }

    const duplicates = [...byName.entries()]
      .filter(([, paths]) => paths.length > 1)
      .map(([name, paths]) => `  ${name}:\n${paths.map((path) => `      ${path}`).join("\n")}`);

    expect(
      duplicates,
      `Componentes com mais de uma definição — a fronteira é @parnaibadigital/ui (SC-012):\n${duplicates.join("\n")}`,
    ).toEqual([]);
  });

  it("nenhum componente vive fora de packages/ui", () => {
    const outside = files
      .filter((file) => !file.includes(join("packages", "ui", "src")))
      .map((file) => relative(REPO_ROOT, file));

    expect(
      outside,
      `Componentes fora de packages/ui — a próxima tela os duplicaria sem perceber:\n${outside.join("\n")}`,
    ).toEqual([]);
  });
});
