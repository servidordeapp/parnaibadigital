import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoPath = (relative: string): string =>
  fileURLToPath(new URL(`../../${relative}`, import.meta.url));

/**
 * T140 / SC-014 / FR-036 / FR-037 — a documentação arquitetural como portão.
 *
 * Documentação que existe por convenção apodrece: alguém remove um arquivo numa limpeza,
 * ninguém percebe, e a próxima feature reabre uma decisão que já tinha sido tomada. Este
 * teste transforma "documentamos isso" em algo que reprova a construção.
 *
 * O que se verifica é presença e forma mínima, não qualidade de escrita — nenhum teste
 * consegue julgar a segunda. A forma mínima importa porque FR-037 é específico: cada decisão
 * precisa de PROBLEMA, ALTERNATIVAS REJEITADAS e CRITÉRIO DE REVERSÃO. Uma ADR sem critério
 * de reversão é uma decisão que ninguém sabe quando revisitar.
 */

/** As nove áreas exigidas nominalmente por FR-036. */
const DOC_AREAS = [
  "architecture",
  "frontend",
  "backend",
  "design-system",
  "seo",
  "performance",
  "editorial-pipeline",
  "ingestion",
  "infrastructure",
] as const;

/**
 * As ADRs exigidas. As cinco primeiras são as nominadas por FR-037; 0006 é exigida ao plano
 * pela Constituição (motor de busca, D-14) e 0007 registra as substituições sobre o DS
 * importado, sem a qual a exceção do Princípio VI ficaria sem rastro.
 */
const REQUIRED_ADRS = [
  "0001-backend-permanece-em-backend-api",
  "0002-organizacao-modular-do-dominio",
  "0003-fonte-unica-de-tokens",
  "0004-estrategia-de-dados-demonstrativos",
  "0005-taxonomia-geografica-de-dois-niveis",
  "0006-motor-de-busca-meilisearch",
  "0007-substituicoes-do-design-system",
] as const;

/**
 * Cada uma das três exigências de FR-037, com as grafias que contam como cumprimento.
 * Aceitar mais de uma grafia evita que o teste vire uma regra de estilo de cabeçalho — o
 * que ele cobra é a seção existir, não se chama-se "Problema" ou "Contexto e problema".
 */
const REQUIRED_SECTIONS: readonly { label: string; patterns: RegExp[] }[] = [
  { label: "problema", patterns: [/^#{2,3}\s+.*\bproblema\b/im, /^#{2,3}\s+.*\bcontexto\b/im] },
  {
    label: "alternativas rejeitadas",
    patterns: [
      /^#{2,3}\s+.*alternativas?\s+rejeitad/im,
      /^#{2,3}\s+.*alternativas?\s+consideradas/im,
    ],
  },
  {
    label: "critério de reversão",
    patterns: [/^#{2,3}\s+.*crit[ée]rios?\s+de\s+revers[ãa]o/im, /^#{2,3}\s+.*revers[ãa]o/im],
  },
];

const readDoc = (relative: string): string => readFileSync(repoPath(relative), "utf8");

describe("cobertura da documentação arquitetural (SC-014)", () => {
  it.each(DOC_AREAS)("docs/%s.md existe e não está vazio", (area) => {
    const relative = `docs/${area}.md`;
    expect(existsSync(repoPath(relative)), `${relative} não existe (FR-036)`).toBe(true);

    // 20 linhas é o limiar entre "documentado" e "arquivo criado para o teste passar".
    const lines = readDoc(relative).trim().split("\n");
    expect(
      lines.length,
      `${relative} tem ${String(lines.length)} linhas — cabeçalho não é documentação`,
    ).toBeGreaterThan(20);
  });

  it("as nove áreas de FR-036 estão cobertas, sem faltar nenhuma", () => {
    const missing = DOC_AREAS.filter((area) => !existsSync(repoPath(`docs/${area}.md`)));
    expect(missing).toEqual([]);
  });
});

describe("registros de decisão arquitetural (FR-037)", () => {
  it.each(REQUIRED_ADRS)("docs/decisions/%s.md existe", (slug) => {
    const relative = `docs/decisions/${slug}.md`;
    expect(existsSync(repoPath(relative)), `${relative} não existe (FR-037)`).toBe(true);
  });

  it.each(REQUIRED_ADRS)(
    "%s registra problema, alternativas rejeitadas e critério de reversão",
    (slug) => {
      const relative = `docs/decisions/${slug}.md`;
      const content = readDoc(relative);

      const missing = REQUIRED_SECTIONS.filter(
        ({ patterns }) => !patterns.some((pattern) => pattern.test(content)),
      ).map(({ label }) => label);

      expect(
        missing,
        `${relative} não registra: ${missing.join(", ")}. FR-037 exige as três seções.`,
      ).toEqual([]);
    },
  );

  it("toda ADR declara situação e data, para que uma decisão revogada seja legível como tal", () => {
    const semCabecalho = REQUIRED_ADRS.filter((slug) => {
      const content = readDoc(`docs/decisions/${slug}.md`);
      return !content.includes("**Situação**:") || !content.includes("**Data**:");
    });

    expect(semCabecalho).toEqual([]);
  });
});
