/**
 * SC-017 / FR-001 — o Design System importado é byte-idêntico ao original.
 *
 * O DS não é uma dependência que se edita: é um artefato vendorizado. As três correções
 * obrigatórias (tema escuro, fontes locais, ícones inlinados) vivem como overlay em
 * `src/theme/`, nunca por edição de `vendor/`. Este script é o que torna essa regra
 * verificável em vez de aspiracional — recalcula o SHA-256 de cada arquivo vendorizado e
 * reprova qualquer divergência, arquivo novo ou arquivo removido.
 *
 * Uso:
 *   tsx scripts/check-ds-integrity.ts            verifica (usado por `pnpm verify` e pela CI)
 *   tsx scripts/check-ds-integrity.ts --write    regrava o MANIFEST (só após reimportar o DS)
 *
 * Cenário V13 do quickstart: editar um byte de `vendor/**` faz este comando sair diferente
 * de zero, nomeando o arquivo.
 */
import { createHash } from "node:crypto";
import {
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const VENDOR_DIR = join(REPO_ROOT, "packages/design-system/vendor");
const MANIFEST_PATH = join(REPO_ROOT, "packages/design-system/MANIFEST.sha256");

/** Arquivos que não descrevem o DS e por isso não entram no hash. */
const EXCLUDED = new Set([".gitkeep", ".DS_Store", "Thumbs.db"]);

function walk(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...walk(full));
    } else if (!EXCLUDED.has(entry)) {
      found.push(full);
    }
  }
  return found;
}

/** Caminho POSIX relativo a `packages/design-system/`, para o manifesto ser estável entre SOs. */
function manifestKey(absolutePath: string): string {
  return relative(join(REPO_ROOT, "packages/design-system"), absolutePath).split(sep).join("/");
}

function sha256(absolutePath: string): string {
  return createHash("sha256").update(readFileSync(absolutePath)).digest("hex");
}

export interface IntegrityResult {
  ok: boolean;
  missing: string[];
  unexpected: string[];
  changed: string[];
  total: number;
}

export function computeDigests(): Map<string, string> {
  if (!existsSync(VENDOR_DIR)) return new Map();
  const digests = new Map<string, string>();
  for (const file of walk(VENDOR_DIR).sort()) {
    digests.set(manifestKey(file), sha256(file));
  }
  return digests;
}

export function readManifest(): Map<string, string> {
  if (!existsSync(MANIFEST_PATH)) return new Map();
  const entries = new Map<string, string>();
  for (const line of readFileSync(MANIFEST_PATH, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    // Formato sha256sum: "<hash>  <caminho>"
    const separator = trimmed.indexOf("  ");
    if (separator === -1) continue;
    entries.set(trimmed.slice(separator + 2), trimmed.slice(0, separator));
  }
  return entries;
}

export function verifyIntegrity(): IntegrityResult {
  const actual = computeDigests();
  const expected = readManifest();

  const missing = [...expected.keys()].filter((path) => !actual.has(path));
  const unexpected = [...actual.keys()].filter((path) => !expected.has(path));
  const changed = [...actual.entries()]
    .filter(([path, digest]) => expected.has(path) && expected.get(path) !== digest)
    .map(([path]) => path);

  return {
    ok: missing.length === 0 && unexpected.length === 0 && changed.length === 0,
    missing,
    unexpected,
    changed,
    total: actual.size,
  };
}

function writeManifest(): void {
  const digests = computeDigests();
  const header = [
    "# packages/design-system/MANIFEST.sha256",
    "#",
    "# SHA-256 de cada arquivo do Design System vendorizado (FR-001, SC-017).",
    "# Gerado por `tsx scripts/check-ds-integrity.ts --write` — NÃO editar à mão.",
    "# Regrave este arquivo apenas após reimportar o DS pelo MCP DesignSync.",
    "",
  ].join("\n");
  const body = [...digests.entries()].map(([path, digest]) => `${digest}  ${path}`).join("\n");
  writeFileSync(MANIFEST_PATH, `${header}${body}\n`, "utf8");
  console.log(`MANIFEST.sha256 regravado — ${String(digests.size)} arquivos.`);
}

function main(): void {
  if (process.argv.includes("--write")) {
    writeManifest();
    return;
  }

  const result = verifyIntegrity();

  if (result.total === 0) {
    console.error(
      "Nenhum arquivo em packages/design-system/vendor/. O Design System não foi importado (T013).",
    );
    process.exit(1);
  }

  if (result.ok) {
    console.log(`Design System íntegro — ${String(result.total)} arquivos conferem.`);
    return;
  }

  console.error("Integridade do Design System REPROVADA (FR-001, SC-017).\n");
  for (const path of result.changed) {
    console.error(`  alterado    ${path} — o original vendorizado nunca é editado.`);
  }
  for (const path of result.missing) {
    console.error(`  removido    ${path} — estava no MANIFEST e sumiu do vendor/.`);
  }
  for (const path of result.unexpected) {
    console.error(`  não listado ${path} — arquivo novo sem entrada no MANIFEST.`);
  }
  console.error(
    "\nCorrija revertendo a edição. Se o DS foi legitimamente reimportado, regrave com:" +
      "\n  pnpm exec tsx scripts/check-ds-integrity.ts --write",
  );
  process.exit(1);
}

// Só executa quando chamado como script — o teste de T016 importa `verifyIntegrity`.
const entrypoint = process.argv[1];
if (entrypoint !== undefined && realpathSync(entrypoint) === fileURLToPath(import.meta.url)) {
  main();
}
