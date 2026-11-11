import { describe, expect, it } from "vitest";

import type { DataClient } from "../src/ports";
import { createHttpClient } from "../src/transports/http";
import { createMockClient } from "../src/transports/mock";

/**
 * Cenário V10 / SC-011 — trocar o transporte não altera a assinatura que as telas consomem.
 *
 * A prova não é "os dois compilam": é que os dois expõem exatamente as mesmas portas com
 * a mesma aridade. Se alguém acrescentar um método só no `mock` — o caminho natural quando
 * uma tela precisa de algo e o HTTP "ainda não existe" —, as telas passam a depender de um
 * método que o transporte real não tem, e a troca prometida por D-12 deixa de valer em
 * silêncio. Este teste é o que faz esse deslize aparecer no mesmo dia.
 */

const PORTS = [
  "news",
  "geo",
  "categories",
  "authors",
  "gazette",
  "events",
  "companies",
  "utilities",
  "search",
] as const satisfies readonly (keyof DataClient)[];

function shapeOf(client: DataClient): Record<string, Record<string, number>> {
  const shape: Record<string, Record<string, number>> = {};
  for (const port of PORTS) {
    const repository = client[port] as unknown as Record<string, (...args: unknown[]) => unknown>;
    shape[port] = Object.fromEntries(
      Object.keys(repository)
        .sort()
        .map((method) => [method, repository[method]!.length]),
    );
  }
  return shape;
}

describe("intercambialidade dos transportes", () => {
  const mock = createMockClient();
  const http = createHttpClient({ baseUrl: "https://api.parnaibadigital.com.br/v1" });

  it("expõe as 9 portas nos dois transportes", () => {
    for (const port of PORTS) {
      expect(mock[port], `mock.${port}`).toBeDefined();
      expect(http[port], `http.${port}`).toBeDefined();
    }
  });

  it("mock e http têm métodos e aridade idênticos (cenário V10)", () => {
    expect(shapeOf(http)).toEqual(shapeOf(mock));
  });

  it("o transporte mock responde às portas de leitura", async () => {
    const municipalities = await mock.geo.listMunicipalities();
    expect(municipalities).toHaveLength(5);

    const page = await mock.news.list();
    expect(page.meta).toMatchObject({ page: 1, perPage: 12 });

    // O que se afirma aqui é a **forma** da resposta, não o conteúdo: um número fixo de
    // matérias amarraria este teste aos dados demonstrativos e ele passaria a reprovar a
    // cada artigo acrescentado — reportando como falha de transporte algo que é conteúdo.
    expect(page.data.length).toBe(page.meta.total);
    expect(page.meta.total).toBeGreaterThan(0);

    // Ordenação por publicação, do mais recente para o mais antigo.
    const dates = page.data.map((item) => Date.parse(item.publishedAt));
    expect([...dates].sort((a, b) => b - a)).toEqual(dates);

    // A projeção de listagem não carrega corpo nem atribuição — é o que mantém a página de
    // listagem leve (ver `toSummary` no transporte).
    for (const item of page.data) {
      expect(item).not.toHaveProperty("body");
      expect(item).not.toHaveProperty("attribution");
    }
  });

  it("o transporte http falha alto em vez de fingir lista vazia", async () => {
    await expect(http.news.list()).rejects.toThrow(/não implementado nesta fase/);
  });
});
