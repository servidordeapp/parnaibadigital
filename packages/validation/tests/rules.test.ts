import { describe, expect, it } from "vitest";

import { assertDatasetIsValid, validateDataset, type Dataset } from "../src/rules";

/* ————————————————— Base válida ————————————————— */

const PARNAIBA = "2207702";
const LUIS_CORREIA = "2205805";

const baseline: Dataset = {
  municipalities: [
    { ibgeCode: PARNAIBA, name: "Parnaíba", slug: "parnaiba", state: "PI", newsCount: 8 },
    {
      ibgeCode: LUIS_CORREIA,
      name: "Luís Correia",
      slug: "luis-correia",
      state: "PI",
      newsCount: 2,
    },
  ],
  neighborhoods: [
    { id: "parnaiba:centro", name: "Centro", slug: "centro", municipalityIbgeCode: PARNAIBA },
    { id: "parnaiba:sao-jose", name: "São José", slug: "sao-jose", municipalityIbgeCode: PARNAIBA },
    // Homônimo legítimo: "Centro" existe nos dois municípios e só o id os distingue.
    {
      id: "luis-correia:centro",
      name: "Centro",
      slug: "centro",
      municipalityIbgeCode: LUIS_CORREIA,
    },
  ],
  news: [
    {
      id: "n1",
      slug: "sao-jose-ganha-faixa-elevada",
      headline: "São José ganha nova faixa elevada de pedestres na Av. São Sebastião",
      body: [{ type: "paragraph", text: "A Secretaria informou que a faixa entra em operação." }],
      categorySlug: "transito",
      tone: "standard",
      authorSlug: "redacao-parnaibadigital",
      municipalityIbgeCode: PARNAIBA,
      neighborhoodIds: ["parnaiba:sao-jose"],
      publishedAt: "2026-08-04T09:00:00-03:00",
      updatedAt: "2026-08-04T09:12:00-03:00",
      curation: { kind: "original", reviewedByHuman: true, updatedAt: "2026-08-04T09:12:00-03:00" },
      sponsored: false,
    },
  ],
  events: [],
  companies: [],
  gazette: [
    {
      id: "g1",
      number: "1.204/2026",
      agency: "Prefeitura Municipal de Parnaíba",
      publishedAt: "2026-08-03",
      type: "portaria",
      summary: "Nomeia servidores para a comissão de licitação.",
      status: "em_revisao",
      sourceRef: {
        documentId: "DOM-2026-08-03-1204",
        sourceUrl: "https://diariooficial.parnaiba.pi.gov.br/2026/08/03/1204",
      },
    },
  ],
};

function withNews(...overrides: Partial<Dataset["news"][number]>[]): Dataset {
  return {
    ...baseline,
    news: overrides.map((override, index) => ({
      ...baseline.news[0]!,
      id: `n${String(index + 1)}`,
      ...override,
    })),
  };
}

/* ————————————————— Casos ————————————————— */

describe("regras transversais de data-model.md", () => {
  it("aprova um conjunto coerente", () => {
    expect(validateDataset(baseline)).toEqual([]);
    expect(() => {
      assertDatasetIsValid(baseline);
    }).not.toThrow();
  });

  it("regra 1 — reprova matéria em município fora do registro", () => {
    // `neighborhoodIds` vazio isola a regra 1: com bairro, o município inexistente também
    // dispara a regra 2, porque o bairro passa a não pertencer ao município declarado.
    const violations = validateDataset(
      withNews({ municipalityIbgeCode: "9999999", neighborhoodIds: [] }),
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ rule: 1, entity: "News" });
    expect(violations[0]?.message).toContain("não existe no registro canônico");
  });

  it("regra 1 + regra 2 — município inexistente também orfana o bairro citado", () => {
    const violations = validateDataset(withNews({ municipalityIbgeCode: "9999999" }));

    expect(violations.map((v) => v.rule).sort()).toEqual([1, 2]);
  });

  it("regra 2 — reprova bairro de outro município, mesmo com nome idêntico", () => {
    // "Centro" existe em Parnaíba e em Luís Correia. Apontar para o Centro errado é
    // precisamente o edge case que o id composto existe para pegar.
    const violations = validateDataset(
      withNews({ municipalityIbgeCode: PARNAIBA, neighborhoodIds: ["luis-correia:centro"] }),
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]?.rule).toBe(2);
    expect(violations[0]?.message).toContain("bairro homônimo não é o mesmo bairro");
  });

  it("regra 3 — reprova matéria curada sem atribuição (Princípio V)", () => {
    const violations = validateDataset(
      withNews({
        curation: {
          kind: "curated",
          reviewedByHuman: true,
          updatedAt: "2026-08-04T09:12:00-03:00",
        },
      }),
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]?.rule).toBe(3);
    expect(violations[0]?.message).toContain("contrato de confiança");
  });

  it("regra 3 — reprova atribuição com URL relativa", () => {
    const violations = validateDataset(
      withNews({
        curation: {
          kind: "curated",
          reviewedByHuman: true,
          updatedAt: "2026-08-04T09:12:00-03:00",
        },
        attribution: { sourceName: "Diário do Litoral", sourceUrl: "/fonte/original" },
      }),
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]?.rule).toBe(3);
    expect(violations[0]?.message).toContain("não é absoluta");
  });

  it("regra 4 — reprova documento oficial sem referência absoluta ao original", () => {
    const violations = validateDataset({
      ...baseline,
      gazette: [
        {
          ...baseline.gazette[0]!,
          sourceRef: { documentId: "DOM-2026-08-03-1204", sourceUrl: "/dom/1204" },
        },
      ],
    });

    expect(violations).toHaveLength(1);
    expect(violations[0]?.rule).toBe(4);
  });

  it("regra 5 — reprova imagem de conteúdo com alt vazio", () => {
    const violations = validateDataset(
      withNews({
        image: {
          url: "https://cdn.parnaibadigital.com.br/f.avif",
          alt: "  ",
          width: 1200,
          height: 675,
        },
      }),
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]?.rule).toBe(5);
    expect(violations[0]?.message).toContain("WCAG");
  });

  it("regra 5 — aceita ausência de foto: cai para PhotoFrame, não é erro", () => {
    expect(validateDataset(withNews({ image: undefined }))).toEqual([]);
  });

  it("regra 6 — reprova slug de notícia duplicado", () => {
    const violations = validateDataset(withNews({}, {}));

    expect(violations).toHaveLength(1);
    expect(violations[0]?.rule).toBe(6);
    expect(violations[0]?.message).toContain("duplicado");
  });

  it("regra 6 — aceita bairros homônimos em municípios diferentes", () => {
    // O baseline já tem dois "centro". Se a regra fosse global, isto reprovaria.
    expect(validateDataset(baseline).filter((v) => v.rule === 6)).toEqual([]);
  });

  it("regra 7 — falha reprova a construção, não gera aviso", () => {
    expect(() => {
      assertDatasetIsValid(withNews({ municipalityIbgeCode: "9999999" }));
    }).toThrow(/regra 1/);
  });
});
