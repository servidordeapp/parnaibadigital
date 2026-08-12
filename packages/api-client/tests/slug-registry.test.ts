import type { Municipality } from "@parnaibadigital/types";
import { describe, expect, it } from "vitest";

import {
  findMunicipalityByIbgeCode,
  findMunicipalityBySlug,
  findSlugConflicts,
  isReservedRoute,
  MUNICIPALITIES,
} from "../src/data/municipalities";

function municipality(overrides: Partial<Municipality>): Municipality {
  return {
    ibgeCode: "2200000",
    name: "Município de Teste",
    slug: "municipio-de-teste",
    state: "PI",
    newsCount: 0,
    ...overrides,
  };
}

describe("registro canônico de municípios", () => {
  it("traz os 5 municípios com os códigos IBGE corretos", () => {
    expect(MUNICIPALITIES.map((m) => [m.slug, m.ibgeCode])).toEqual([
      ["parnaiba", "2207702"],
      ["luis-correia", "2205805"],
      ["ilha-grande", "2204550"],
      ["buriti-dos-lopes", "2202101"],
      ["cajueiro-da-praia", "2202174"],
    ]);
  });

  it("o registro entregue está limpo — nenhum conflito hoje", () => {
    expect(findSlugConflicts()).toEqual([]);
  });

  it("resolve município por slug e por código IBGE", () => {
    expect(findMunicipalityBySlug("parnaiba")?.name).toBe("Parnaíba");
    expect(findMunicipalityByIbgeCode("2204550")?.name).toBe("Ilha Grande");
    expect(findMunicipalityBySlug("inexistente")).toBeUndefined();
  });

  /**
   * Cenário V8 — introduzir o slug `eventos` reprova, com mensagem nomeando o conflito.
   * É o caso que a spec descreve literalmente.
   */
  it("reprova o slug `eventos`, que já é rota do portal (cenário V8)", () => {
    const conflicts = findSlugConflicts([
      ...MUNICIPALITIES,
      municipality({ ibgeCode: "2201000", name: "Eventos", slug: "eventos" }),
    ]);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.reason).toBe("rota-reservada");
    expect(conflicts[0]?.slug).toBe("eventos");
    // A mensagem precisa dizer QUAL rota conflita — senão obriga a caçar.
    expect(conflicts[0]?.message).toContain("/eventos");
    expect(conflicts[0]?.message).toContain("Eventos");
  });

  it("reprova qualquer rota reservada, não só `eventos`", () => {
    for (const reserved of ["busca", "admin", "rss", "autor", "componentes", "_astro"]) {
      const conflicts = findSlugConflicts([municipality({ slug: reserved })]);
      expect(conflicts.map((c) => c.reason)).toContain("rota-reservada");
    }
  });

  it("trata `sitemap-*` como família reservada, não como rota única", () => {
    expect(isReservedRoute("sitemap-news")).toBe(true);
    expect(isReservedRoute("sitemap-places")).toBe(true);
    expect(isReservedRoute("sitemapa")).toBe(false);
  });

  it("reprova dois municípios disputando a mesma raiz", () => {
    const conflicts = findSlugConflicts([
      municipality({ ibgeCode: "2201000", name: "Primeiro", slug: "litoral" }),
      municipality({ ibgeCode: "2201001", name: "Segundo", slug: "litoral" }),
    ]);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.reason).toBe("slug-duplicado");
    expect(conflicts[0]?.message).toContain("Primeiro");
    expect(conflicts[0]?.message).toContain("Segundo");
  });

  it("reprova código IBGE repetido — a identidade canônica não duplica", () => {
    const conflicts = findSlugConflicts([
      municipality({ ibgeCode: "2207702", name: "Um", slug: "um" }),
      municipality({ ibgeCode: "2207702", name: "Outro", slug: "outro" }),
    ]);

    expect(conflicts.map((c) => c.reason)).toContain("ibge-duplicado");
  });
});
