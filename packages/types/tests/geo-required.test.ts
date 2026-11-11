import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import type { Municipality, Neighborhood, News } from "../src/index";

const PACKAGE_DIR = fileURLToPath(new URL("..", import.meta.url));

/**
 * User Story 3, cenário 3 — "conteúdo sem vínculo geográfico não compila".
 *
 * O eixo geográfico é a espinha do produto: um portal hiperlocal em que uma matéria pode
 * existir sem município é um portal que já falhou. A spec não pede um aviso em revisão de
 * código; pede que o tipo torne o estado inválido inexprimível.
 *
 * A prova está nos `@ts-expect-error` abaixo. Eles não são decoração: se omitir
 * `municipalityIbgeCode` deixasse de ser erro, o TypeScript reportaria a diretiva como
 * não utilizada e `pnpm typecheck` reprovaria. O caso de teste executa `tsc` para que essa
 * garantia valha também em `pnpm test`, não só no portão de tipos.
 */

// —— Contraexemplos: cada um DEVE falhar a checagem de tipos ——

// @ts-expect-error — News sem municipalityIbgeCode: localização primária é obrigatória.
const semMunicipio: News = {
  id: "n1",
  slug: "sao-jose-ganha-faixa-elevada",
  headline: "São José ganha nova faixa elevada de pedestres",
  body: [],
  categorySlug: "transito",
  tone: "standard",
  authorSlug: "redacao-parnaibadigital",
  neighborhoodIds: [],
  publishedAt: "2026-08-04T09:00:00-03:00",
  updatedAt: "2026-08-04T09:00:00-03:00",
  curation: { kind: "original", reviewedByHuman: true, updatedAt: "2026-08-04T09:00:00-03:00" },
  sponsored: false,
};

// @ts-expect-error — Neighborhood sem municipalityIbgeCode: bairro nunca é órfão.
const bairroOrfao: Neighborhood = {
  id: "parnaiba:centro",
  name: "Centro",
  slug: "centro",
};

// @ts-expect-error — Municipality sem ibgeCode: a identidade canônica não é o slug.
const municipioSemIbge: Municipality = {
  name: "Parnaíba",
  slug: "parnaiba",
  state: "PI",
  newsCount: 0,
};

void semMunicipio;
void bairroOrfao;
void municipioSemIbge;

describe("vínculo geográfico obrigatório", () => {
  it("impede compilar conteúdo sem município primário (User Story 3, cenário 3)", () => {
    // `tsc` sai com zero só se TODAS as três diretivas acima corresponderem a erros reais.
    // Se qualquer campo virar opcional, a diretiva sobra e este comando falha.
    expect(() =>
      execFileSync("pnpm", ["exec", "tsc", "--noEmit"], {
        cwd: PACKAGE_DIR,
        encoding: "utf8",
        stdio: "pipe",
      }),
    ).not.toThrow();
  }, 120_000);
});
