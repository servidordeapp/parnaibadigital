import { describe, expect, it } from "vitest";

import { loadTokenTable, scanSource } from "../check-tokens";

const tokens = loadTokenTable();

function scan(source: string) {
  return scanSource("temp/Exemplo.astro", source, tokens);
}

/**
 * Cenário V4 do quickstart — introduzir `color: #123456` reprova a construção, e a
 * mensagem nomeia o token que deveria ter sido usado.
 */
describe("check-tokens", () => {
  it("carrega a tabela de tokens do DS vendorizado", () => {
    expect(tokens.colors.size).toBeGreaterThan(20);
    expect(tokens.lengths.size).toBeGreaterThan(10);
    // A rampa vence o alias: é a rampa que se sugere.
    expect(tokens.colors.get("#1257d6")).toBe("--pd-blue-600");
    expect(tokens.lengths.get("16px")).toBe("--space-5");
  });

  it("reprova uma cor hexadecimal e nomeia arquivo, linha e token (cenário V4)", () => {
    const violations = scan(
      ["<style>", "  .card {", "    color: #123456;", "  }", "</style>"].join("\n"),
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({
      file: "temp/Exemplo.astro",
      line: 3,
      kind: "cor",
      literal: "#123456",
    });
    expect(violations[0]?.suggestion).toContain("alias semântico");
  });

  it("sugere o token exato quando o literal é um valor do DS", () => {
    const violations = scan(".acao { background: #1257D6; }");

    expect(violations).toHaveLength(1);
    expect(violations[0]?.suggestion).toBe("var(--pd-blue-600)");
  });

  it("pega literal escondido em classe utilitária arbitrária do Tailwind (D-17)", () => {
    const violations = scan('<div class="text-[#f58220] p-[13px]">Manchete</div>');

    expect(violations).toHaveLength(2);
    expect(violations.map((v) => v.literal).sort()).toEqual(["#f58220", "13px"]);
    expect(violations.find((v) => v.literal === "#f58220")?.suggestion).toBe("var(--pd-sun-500)");
  });

  it("sugere o degrau de espaçamento correto para um px conhecido", () => {
    const violations = scan(".secao { padding: 24px; }");

    expect(violations).toHaveLength(1);
    expect(violations[0]?.kind).toBe("espaçamento");
    expect(violations[0]?.suggestion).toBe("var(--space-7)");
  });

  it("pega rgb() e hsl() além do hexadecimal", () => {
    const violations = scan(".sombra { box-shadow: 0 1px 2px rgba(31, 28, 24, 0.06); }");

    expect(violations.some((v) => v.kind === "cor")).toBe(true);
  });

  it("aceita token — o caminho correto não gera ruído", () => {
    const violations = scan(
      [
        ".card {",
        "  background: var(--surface-card);",
        "  padding: var(--space-5);",
        "  border-radius: var(--radius-md);",
        "}",
      ].join("\n"),
    );

    expect(violations).toEqual([]);
  });

  it("respeita a desativação justificada — é assim que dark.css convive com a regra (D-07)", () => {
    const violations = scan(
      [
        "/* stylelint-disable-next-line scale-unlimited/declaration-strict-value */",
        "  --surface-page: #0b1220;",
      ].join("\n"),
    );

    expect(violations).toEqual([]);
  });

  it("ignora 0px e larguras de media query — reprovar isso seria ruído, não sinal", () => {
    const violations = scan(["@media (max-width: 900px) { .grid { gap: 0px; } }"].join("\n"));

    expect(violations).toEqual([]);
  });
});
