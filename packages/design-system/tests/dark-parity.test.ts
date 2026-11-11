import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const DARK_CSS = fileURLToPath(new URL("../src/theme/dark.css", import.meta.url));
const PROTOTYPE = fileURLToPath(
  new URL("../vendor/prototype/ParnaibaDigital.dc.html", import.meta.url),
);

/**
 * Reduz `rgba(0, 0, 0, 0.5)` e `rgb(0 0 0 / 50%)` à mesma forma canônica. O protótipo é
 * escrito na notação herdada e `dark.css` na moderna, porque `stylelint-config-standard`
 * normaliza o repositório inteiro; a diferença é de escrita, não de cor, e comparar texto
 * cru transformaria uma regra de formatação em falso alarme de fidelidade visual.
 */
function canonicalizeColors(value: string): string {
  return value
    .replace(/rgba?\(([^)]+)\)/g, (_match, args: string) => {
      const [r = "0", g = "0", b = "0", a = "1"] = args.split(/[\s,/]+/).filter(Boolean);
      const alpha = a.endsWith("%") ? Number(a.slice(0, -1)) / 100 : Number(a);
      return `rgb(${r} ${g} ${b} / ${String(alpha)})`;
    })
    .toLowerCase();
}

/** Declarações `--prop: valor;` de um trecho de CSS, com o valor normalizado em espaços. */
function declarations(block: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const [, prop, value] of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    found.set(prop, value.replace(/\s+/g, " ").trim());
  }
  return found;
}

/** Corpo do primeiro bloco cujo seletor casa, contando chaves para não parar no aninhado. */
function blockBody(source: string, selector: string): string {
  const start = source.indexOf(selector);
  expect(start, `seletor ausente em dark.css: ${selector}`).toBeGreaterThanOrEqual(0);
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    else if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, i);
    }
  }
  throw new Error(`bloco não fechado para ${selector}`);
}

const css = readFileSync(DARK_CSS, "utf8");
const explicit = declarations(blockBody(css, ':root[data-theme="dark"]'));
const systemPref = declarations(blockBody(css, ':root:not([data-theme="light"])'));

/**
 * D-07 / T018 — a duplicação dos dois blocos é deliberada (um serve à escolha explícita do
 * leitor, o outro à preferência do sistema), mas duplicação sem verificação é dívida: basta
 * alguém corrigir uma cor num bloco e esquecer o outro para o tema divergir conforme a
 * origem da escolha. Este teste transforma a regra de manutenção em portão.
 */
describe("tema escuro — paridade entre os dois blocos", () => {
  it("declara exatamente as mesmas propriedades nos dois blocos", () => {
    expect([...systemPref.keys()].sort()).toEqual([...explicit.keys()].sort());
  });

  it("declara exatamente os mesmos valores nos dois blocos", () => {
    expect(Object.fromEntries(systemPref)).toEqual(Object.fromEntries(explicit));
  });

  it("declara `color-scheme: dark` nos dois blocos", () => {
    for (const body of [
      blockBody(css, ':root[data-theme="dark"]'),
      blockBody(css, ':root:not([data-theme="light"])'),
    ]) {
      expect(body).toMatch(/color-scheme:\s*dark;/);
    }
  });
});

/**
 * FR-002 — a paleta escura é extraída do protótipo, não desenhada aqui. Se alguém trocar um
 * valor por gosto, este teste acusa; se o protótipo for reimportado com outra paleta, ele
 * acusa também, e a divergência vira decisão consciente em vez de deriva silenciosa.
 */
describe("tema escuro — fidelidade ao protótipo aprovado", () => {
  const prototypeDark = declarations(
    blockBody(readFileSync(PROTOTYPE, "utf8"), '[data-pd-theme="dark"]'),
  );

  /** Corrigidos por acessibilidade — divergem do protótipo de propósito (D-07, regra 4). */
  const A11Y_OVERRIDES = new Set(["--focus-ring", "--text-urgent"]);

  it("extrai do protótipo toda declaração que ele faz no escuro", () => {
    const missing = [...prototypeDark.keys()].filter((prop) => !explicit.has(prop));
    expect(missing).toEqual([]);
  });

  it("reproduz os valores do protótipo sem alterar nenhum", () => {
    for (const [prop, value] of prototypeDark) {
      if (A11Y_OVERRIDES.has(prop)) continue;
      const ours = explicit.get(prop);
      expect(ours && canonicalizeColors(ours), `divergiu do protótipo: ${prop}`).toBe(
        canonicalizeColors(value),
      );
    }
  });

  it("só acrescenta ao protótipo o que a acessibilidade exigiu", () => {
    const extra = [...explicit.keys()].filter((prop) => !prototypeDark.has(prop));
    expect(extra.sort()).toEqual([...A11Y_OVERRIDES].sort());
  });
});
