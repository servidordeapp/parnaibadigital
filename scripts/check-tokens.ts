/**
 * FR-004 / D-17 / Princípio VI — nenhum valor visual literal fora de token.
 *
 * Stylelint já cobre declarações CSS comuns, mas não vê duas coisas que este projeto
 * produz o tempo todo: valor literal dentro de atributo `style` de um `.astro`, e classe
 * utilitária arbitrária do Tailwind (`text-[#1257d6]`, `p-[13px]`, `gap-[7px]`) — que é
 * exatamente o caminho pelo qual um literal entra sem ninguém perceber.
 *
 * O diferencial deste verificador é que ele não só reprova: lê os tokens do DS vendorizado
 * e diz **qual token deveria ter sido usado**. Um erro que só diz "não faça isso" empurra
 * a pessoa a contornar; um que diz "use --pd-blue-600" é seguido.
 *
 * Uso: tsx scripts/check-tokens.ts [caminho...]
 */
import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const DS_TOKENS_DIR = join(
  REPO_ROOT,
  "packages/design-system/vendor/parna-badigital-design-system-fe257784-b721-4adc-b4cd-6b322b375c04/tokens",
);

const SCANNED_EXTENSIONS = new Set([".astro", ".ts", ".tsx", ".css", ".mjs"]);

/** Só código de interface entregue. `scripts/` é ferramenta e não pinta nada na tela. */
const SCAN_ROOTS = ["apps", "packages"];

/**
 * Zera comentários preservando as posições, para que linha e coluna do relatório continuem
 * apontando para o lugar certo. Sem isto, uma frase de documentação que *cita* um valor
 * ("12–14px em linha mono") seria reportada como violação — e um verificador que acusa a
 * própria explicação da regra é um verificador que as pessoas aprendem a ignorar.
 */
export function stripComments(source: string): string {
  let result = "";
  let index = 0;

  while (index < source.length) {
    const block = source.indexOf("/*", index);
    const line = source.indexOf("//", index);

    const isBlockFirst = block !== -1 && (line === -1 || block < line);
    const isLineFirst = line !== -1 && (block === -1 || line < block);

    if (isBlockFirst) {
      const end = source.indexOf("*/", block + 2);
      const stop = end === -1 ? source.length : end + 2;
      result += source.slice(index, block);
      // Preserva as quebras de linha do comentário: só elas mantêm a numeração.
      result += source.slice(block, stop).replace(/[^\n]/g, " ");
      index = stop;
    } else if (isLineFirst) {
      const end = source.indexOf("\n", line);
      const stop = end === -1 ? source.length : end;
      result += source.slice(index, line);
      result += " ".repeat(stop - line);
      index = stop;
    } else {
      result += source.slice(index);
      break;
    }
  }

  return result;
}

/**
 * Não varridos: o DS é intocável por contrato, e o gerado é reescrito do OpenAPI.
 *
 * Arquivos de teste também ficam de fora, e por um motivo que não é conveniência: os
 * casos que provam esta verificação precisam **conter** literais (`color: #123456` é o
 * cenário V4). Varrer o próprio teste faria a ferramenta reprovar a evidência de que
 * funciona. Nada em `tests/` chega ao navegador.
 */
const IGNORED_SEGMENTS = [
  "node_modules",
  "dist",
  ".astro",
  "packages/design-system/vendor",
  "packages/types/src/generated",
  "test-results",
  "playwright-report",
];

const TEST_FILE_PATTERN = /(?:^|[\\/])tests?[\\/]|\.(?:test|spec)\.[cm]?tsx?$/;

/**
 * Compara **segmentos** de caminho, nunca subcadeias.
 *
 * A versão anterior usava `relativePath.includes(segment)`, e o custo disso passou
 * despercebido porque o resultado era verde: `.astro` está na lista para pular o diretório
 * de cache `apps/web/.astro`, mas como subcadeia ele também casa com `Card.astro` — ou seja,
 * **todo arquivo `.astro` do repositório era ignorado**. Como o Stylelint só varre arquivos
 * `.css`, nenhum bloco `<style>` de componente era verificado por ninguém, e o portão de
 * FR-004 passava sem olhar justamente onde mora a interface.
 *
 * Entradas com separador (`packages/design-system/vendor`) continuam casando por prefixo,
 * que é o que se quer para uma subárvore inteira.
 */
function isIgnoredPath(relativePath: string): boolean {
  const segments = relativePath.split(/[\\/]/);
  return IGNORED_SEGMENTS.some((ignored) =>
    ignored.includes("/") ? relativePath.startsWith(ignored) : segments.includes(ignored),
  );
}

export interface Violation {
  file: string;
  line: number;
  column: number;
  literal: string;
  kind: "cor" | "espaçamento";
  suggestion: string;
}

/* ————————————————— Mapa de valor literal → token ————————————————— */

interface TokenTable {
  colors: Map<string, string>;
  lengths: Map<string, string>;
}

function normalizeHex(hex: string): string {
  const value = hex.toLowerCase();
  if (value.length !== 4) return value;
  // #abc → #aabbcc, para que a busca não dependa da forma escrita.
  return `#${value[1]!}${value[1]!}${value[2]!}${value[2]!}${value[3]!}${value[3]!}`;
}

export function loadTokenTable(): TokenTable {
  const colors = new Map<string, string>();
  const lengths = new Map<string, string>();

  for (const file of readdirSync(DS_TOKENS_DIR)) {
    if (extname(file) !== ".css") continue;
    const source = readFileSync(join(DS_TOKENS_DIR, file), "utf8");

    for (const match of source.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) {
      const name = match[1]!;
      const value = match[2]!.trim();

      const hex = /^#[0-9a-fA-F]{3,8}$/.exec(value);
      if (hex) {
        // Primeira declaração vence: as rampas --pd-* vêm antes dos aliases nos arquivos
        // do DS, e é a rampa que queremos sugerir.
        if (!colors.has(normalizeHex(value))) colors.set(normalizeHex(value), name);
        continue;
      }

      const length = /^(\d+)px$/.exec(value);
      if (length && !lengths.has(value)) {
        lengths.set(value, name);
      }
    }
  }

  return { colors, lengths };
}

/* ————————————————————— Varredura ————————————————————— */

const HEX_PATTERN = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?(?:[0-9a-fA-F]{2})?\b/g;
const FUNCTIONAL_COLOR_PATTERN = /\b(?:rgba?|hsla?)\(\s*[\d.]+/g;
const PIXEL_PATTERN = /(?<![\w-])(\d{1,4})px\b/g;

/**
 * Linhas com desativação justificada — a exceção confinada de `dark.css` (D-07).
 *
 * Vale a desativação na linha anterior (`*-disable-next-line`) e **na própria linha**
 * (`stylelint-disable-line`). A segunda forma não era reconhecida, e o efeito era perverso:
 * declarações que já traziam a justificativa escrita ao lado — a transparência sobre o
 * chrome azul do cabeçalho e do rodapé, declarada no `readme.md` do DS — apareciam como
 * violação. Quem escreveu a justificativa fez a coisa certa; era o verificador que não a lia.
 */
function isSuppressed(lines: string[], index: number): boolean {
  const previous = lines[index - 1] ?? "";
  const current = lines[index] ?? "";
  return (
    previous.includes("stylelint-disable-next-line") ||
    previous.includes("check-tokens-disable") ||
    current.includes("stylelint-disable-line") ||
    current.includes("check-tokens-disable-line")
  );
}

/**
 * O `0px` e o `1px` de borda hairline são ruído: `0` não é decisão visual e a hairline já
 * tem token (`--border-hair`), mas aparece tanto em contexto legítimo (media query,
 * `outline`) que reprovar produziria mais falso positivo que sinal.
 */
function isIgnorableLength(value: string, line: string): boolean {
  if (value === "0px") return true;
  // `sizes` descreve ao navegador qual largura a imagem ocupará em cada condição de mídia.
  // É a mesma natureza de um `@media`: não pinta nada, informa uma decisão de rede. Tratá-lo
  // como literal visual obrigaria a tokenizar uma dica de `srcset`, que nenhum token do DS
  // descreve.
  return /@media|@container|outline|vector-effect|\bsizes\s*=/.test(line);
}

export function scanSource(relativePath: string, source: string, tokens: TokenTable): Violation[] {
  const violations: Violation[] = [];
  // A supressão é lida do texto original; a varredura, do texto sem comentários.
  const originalLines = source.split("\n");
  const lines = stripComments(source).split("\n");

  lines.forEach((line, index) => {
    if (isSuppressed(originalLines, index)) return;

    for (const match of line.matchAll(HEX_PATTERN)) {
      const literal = match[0];
      const token = tokens.colors.get(normalizeHex(literal));
      violations.push({
        file: relativePath,
        line: index + 1,
        column: (match.index ?? 0) + 1,
        literal,
        kind: "cor",
        suggestion: token
          ? `var(${token})`
          : "um alias semântico de cor (--text-*, --surface-*, --border-*)",
      });
    }

    for (const match of line.matchAll(FUNCTIONAL_COLOR_PATTERN)) {
      violations.push({
        file: relativePath,
        line: index + 1,
        column: (match.index ?? 0) + 1,
        literal: `${match[0]}…)`,
        kind: "cor",
        suggestion:
          "um alias semântico de cor, ou um token de sombra/scrim (--shadow-*, --scrim-*)",
      });
    }

    for (const match of line.matchAll(PIXEL_PATTERN)) {
      const literal = `${match[1]!}px`;
      if (isIgnorableLength(literal, line)) continue;
      const token = tokens.lengths.get(literal);
      violations.push({
        file: relativePath,
        line: index + 1,
        column: (match.index ?? 0) + 1,
        literal,
        kind: "espaçamento",
        suggestion: token
          ? `var(${token})`
          : "o degrau mais próximo da escala de 4px (--space-*), ou um token de layout",
      });
    }
  });

  return violations;
}

function collectFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const relativePath = relative(REPO_ROOT, full);
    if (isIgnoredPath(relativePath)) continue;
    if (TEST_FILE_PATTERN.test(relativePath)) continue;

    if (statSync(full).isDirectory()) {
      found.push(...collectFiles(full));
    } else if (SCANNED_EXTENSIONS.has(extname(full))) {
      found.push(full);
    }
  }
  return found;
}

export function checkPaths(roots: string[]): Violation[] {
  const tokens = loadTokenTable();
  const violations: Violation[] = [];

  for (const root of roots) {
    const absolute = join(REPO_ROOT, root);
    let target: string[];
    try {
      target = statSync(absolute).isDirectory() ? collectFiles(absolute) : [absolute];
    } catch {
      continue; // diretório ainda não existe nesta fase
    }
    for (const file of target) {
      violations.push(...scanSource(relative(REPO_ROOT, file), readFileSync(file, "utf8"), tokens));
    }
  }

  return violations;
}

function main(): void {
  const roots = process.argv.slice(2);
  const violations = checkPaths(roots.length > 0 ? roots : SCAN_ROOTS);

  if (violations.length === 0) {
    console.log("Nenhum valor visual literal encontrado — tudo vem de token (FR-004).");
    return;
  }

  console.error(`${String(violations.length)} valor(es) literal(is) fora de token (FR-004):\n`);
  for (const violation of violations) {
    console.error(
      `  ${violation.file}:${String(violation.line)}:${String(violation.column)}\n` +
        `    ${violation.kind} literal \`${violation.literal}\` — use ${violation.suggestion}\n`,
    );
  }
  console.error(
    "O Design System é a fonte de verdade (Princípio VI). Se o token não existe, o pedido\n" +
      "volta ao projeto de design — não se resolve com um literal.",
  );
  process.exit(1);
}

const entrypoint = process.argv[1];
if (entrypoint !== undefined && realpathSync(entrypoint) === fileURLToPath(import.meta.url)) {
  main();
}
