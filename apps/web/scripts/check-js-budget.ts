import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * T142 / SC-006 / Princípio I — **50 KB de JavaScript comprimido por página**, no máximo.
 *
 * O orçamento é medido sobre o `dist/`, depois do build, e não estimado a partir do que se
 * pretendeu entregar. É a única medida honesta: uma dependência transitiva entra sem
 * ninguém decidir, e o custo dela só aparece no arquivo final.
 *
 * O que se mede é o **gzip**, porque é o que trafega. Comparar bytes crus superestimaria o
 * custo e faria o portão reprovar entregas que na rede cabem folgadas — um portão que
 * mente para o lado errado acaba desativado.
 *
 * A galeria de componentes (`/componentes`) fica fora da medição por decisão declarada em
 * `contracts/routes.md`: é superfície de desenvolvimento, não de produto.
 */

const DIST = fileURLToPath(new URL("../dist", import.meta.url));
const BUDGET_BYTES = 50 * 1024;

/** Superfícies excluídas do orçamento, com a razão registrada ao lado. */
const EXCLUDED = [
  { prefix: "componentes", reason: "inventário de desenvolvimento (contracts/routes.md)" },
];

interface PageReport {
  page: string;
  scripts: string[];
  gzipBytes: number;
}

function walk(dir: string): string[] {
  const found: string[] = [];

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...walk(full));
    } else if (extname(full) === ".html") {
      found.push(full);
    }
  }

  return found;
}

/** Scripts de módulo referenciados pela página, mais o que estiver embutido nela. */
function scriptsOf(html: string): { srcs: string[]; inlineBytes: number } {
  const srcs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((src): src is string => src !== undefined && !src.startsWith("http"));

  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1] ?? "")
    // JSON-LD é dado estrutural, não código executado: contá-lo como JavaScript inflaria o
    // orçamento com aquilo que o Princípio II justamente exige que exista.
    .filter(
      (_, index) =>
        !/type=["']application\/ld\+json["']/i.test(html.split("<script")[index + 1] ?? ""),
    )
    .join("");

  return { srcs, inlineBytes: gzipSync(Buffer.from(inline, "utf8")).byteLength };
}

const pages = walk(DIST);
if (pages.length === 0) {
  console.error(`Nenhum HTML em ${DIST}. Rode \`astro build\` antes deste verificador.`);
  process.exit(1);
}

const cache = new Map<string, number>();

function gzipBytesOf(assetPath: string): number {
  const cached = cache.get(assetPath);
  if (cached !== undefined) return cached;

  const file = join(DIST, assetPath.replace(/^\//, ""));
  let size = 0;
  try {
    size = gzipSync(readFileSync(file)).byteLength;
  } catch {
    // Ativo referenciado mas ausente: é defeito de build, e reportá-lo como zero esconderia
    // o problema atrás de um orçamento verde.
    console.error(`Ativo referenciado e ausente no dist: ${assetPath}`);
    process.exitCode = 1;
  }

  cache.set(assetPath, size);
  return size;
}

const reports: PageReport[] = [];

for (const page of pages) {
  const route = relative(DIST, page).replace(/(?:^|\/)index\.html$/, "") || "/";
  if (EXCLUDED.some((entry) => route.startsWith(entry.prefix))) continue;

  const html = readFileSync(page, "utf8");
  const { srcs, inlineBytes } = scriptsOf(html);

  const total = srcs.reduce((sum, src) => sum + gzipBytesOf(src), inlineBytes);
  reports.push({ page: route, scripts: srcs, gzipBytes: total });
}

const overBudget = reports.filter((report) => report.gzipBytes > BUDGET_BYTES);
const heaviest = [...reports].sort((a, b) => b.gzipBytes - a.gzipBytes)[0];

const kb = (bytes: number): string => `${(bytes / 1024).toFixed(1)} KB`;

if (overBudget.length > 0) {
  console.error(
    `\n${String(overBudget.length)} página(s) acima do orçamento de ${kb(BUDGET_BYTES)} gz:\n`,
  );
  for (const report of overBudget) {
    console.error(`  ${report.page} — ${kb(report.gzipBytes)}`);
    for (const script of report.scripts) console.error(`      ${script}`);
  }
  console.error(
    "\nPrincípio I: o orçamento é por página e é medido no que trafega. Se uma dependência " +
      "de cliente for mesmo necessária, ela precisa vir com o custo declarado em KB.\n",
  );
  process.exit(1);
}

console.log(
  `Orçamento de JavaScript respeitado — ${String(reports.length)} página(s) medidas, ` +
    `a mais pesada é ${heaviest?.page ?? "—"} com ${kb(heaviest?.gzipBytes ?? 0)} gz ` +
    `(orçamento: ${kb(BUDGET_BYTES)}).`,
);
