import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

import { computeDigests, readManifest, verifyIntegrity } from "../../../scripts/check-ds-integrity";

const STYLES_CSS = fileURLToPath(
  new URL(
    "../vendor/parna-badigital-design-system-fe257784-b721-4adc-b4cd-6b322b375c04/styles.css",
    import.meta.url,
  ),
);

/**
 * SC-017 / cenário V13 — a integridade do DS vendorizado é portão, não convenção.
 * Não basta o script existir: precisa REPROVAR quando alguém edita o original.
 */
describe("integridade do Design System vendorizado", () => {
  let original: string | undefined;

  afterEach(() => {
    if (original !== undefined) {
      writeFileSync(STYLES_CSS, original, "utf8");
      original = undefined;
    }
  });

  it("aprova o vendor/ importado como está", () => {
    const result = verifyIntegrity();
    expect(result.changed).toEqual([]);
    expect(result.missing).toEqual([]);
    expect(result.unexpected).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("cobre todo arquivo do vendor/ no MANIFEST — nenhum escapa do hash", () => {
    const digests = computeDigests();
    const manifest = readManifest();
    expect(digests.size).toBeGreaterThan(0);
    expect([...digests.keys()].sort()).toEqual([...manifest.keys()].sort());
  });

  it("reprova quando um arquivo vendorizado é editado (FR-001)", () => {
    original = readFileSync(STYLES_CSS, "utf8");
    writeFileSync(STYLES_CSS, `${original}\n/* edição indevida */\n`, "utf8");

    const result = verifyIntegrity();

    expect(result.ok).toBe(false);
    expect(result.changed).toContain(
      "vendor/parna-badigital-design-system-fe257784-b721-4adc-b4cd-6b322b375c04/styles.css",
    );
  });
});
