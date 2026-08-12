import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { MUNICIPALITIES } from "@parnaibadigital/api-client";
import { categories, news } from "@parnaibadigital/api-client/mock/data/index";

/**
 * T049 / SC-008 / Princípio II — as asserções de SEO rodam sobre o `dist/`, não sobre o
 * servidor de desenvolvimento.
 *
 * A diferença importa: é o HTML publicado que o rastreador lê. Uma canônica montada em
 * runtime, um JSON-LD injetado por ilha ou uma meta escrita por script passariam num teste
 * de navegador e chegariam vazias ao arquivo entregue. Aqui o arquivo é lido do disco.
 *
 * Cada asserção corresponde a uma coluna de `contracts/routes.md`. A tabela é a declaração;
 * este arquivo é a cobrança dela.
 */

const DIST = resolve(import.meta.dirname, "../../apps/web/dist");
const SITE = "https://parnaibadigital.com.br";

function htmlFor(route: string): string {
  const relative = route === "/" ? "index.html" : `${route.replace(/^\//, "")}/index.html`;
  const file = join(DIST, relative);

  if (!existsSync(file)) {
    throw new Error(
      `Sem HTML construído para "${route}" (${file}). Rode \`pnpm build\` antes de \`pnpm test:seo\`.`,
    );
  }

  return readFileSync(file, "utf8");
}

function metaContent(html: string, name: string): string | undefined {
  const pattern = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const alternate = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`,
    "i",
  );
  return pattern.exec(html)?.[1] ?? alternate.exec(html)?.[1];
}

function canonical(html: string): string | undefined {
  return /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i.exec(html)?.[1];
}

function jsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(pattern)) {
    const raw = match[1];
    if (raw === undefined) continue;
    // Falha de parse é falha do teste, e deliberadamente: JSON-LD inválido é ignorado
    // silenciosamente pelo buscador — o pior modo de erro possível, porque nada avisa.
    blocks.push(JSON.parse(raw));
  }

  return blocks;
}

function schemaTypes(html: string): string[] {
  const types: string[] = [];

  const collect = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) collect(item);
      return;
    }
    if (typeof node !== "object" || node === null) return;

    const record = node as Record<string, unknown>;
    if (typeof record["@type"] === "string") types.push(record["@type"]);

    // Desce por todo o objeto, não só por `@graph`: tipos legítimos vivem aninhados —
    // `Person` dentro de `mainEntity`, `Place` dentro de `contentLocation`, `Event` dentro
    // de `itemListElement`. Olhar só o nível raiz reprovaria schema correto.
    for (const value of Object.values(record)) collect(value);
  };

  collect(jsonLdBlocks(html));
  return types;
}

/** Rotas fixas + uma amostra derivada dos dados — nunca endereço escrito à mão. */
const ROUTES: { name: string; route: string; schema: string[]; indexable: boolean }[] = [
  { name: "Home", route: "/", schema: ["WebSite", "Organization"], indexable: true },
  { name: "Busca", route: "/busca", schema: ["WebSite"], indexable: false },
  { name: "Eventos", route: "/eventos", schema: ["ItemList"], indexable: true },
  {
    name: "Utilidade pública",
    route: "/utilidade-publica",
    schema: ["CollectionPage"],
    indexable: true,
  },
  {
    name: "Diário Oficial",
    route: "/diario-oficial",
    schema: ["CollectionPage"],
    indexable: true,
  },
  { name: "Empresas", route: "/empresas", schema: ["ItemList"], indexable: true },
  { name: "Anunciante", route: "/anuncie", schema: ["WebPage", "Organization"], indexable: true },
  { name: "Newsletter", route: "/newsletter", schema: ["WebPage"], indexable: true },
];

const firstArticle = news[0];
if (firstArticle !== undefined) {
  ROUTES.push({
    name: "Notícia",
    route: `/noticia/${firstArticle.slug}`,
    schema: ["NewsArticle", "BreadcrumbList"],
    indexable: true,
  });
  ROUTES.push({
    name: "Autor",
    route: `/autor/${firstArticle.authorSlug}`,
    schema: ["ProfilePage", "Person"],
    indexable: true,
  });
}

const firstCategory = categories[0];
if (firstCategory !== undefined) {
  ROUTES.push({
    name: "Editoria",
    route: `/editoria/${firstCategory.slug}`,
    schema: ["CollectionPage", "BreadcrumbList"],
    indexable: true,
  });
}

const firstMunicipality = MUNICIPALITIES[0];
if (firstMunicipality !== undefined) {
  ROUTES.push({
    name: "Município",
    route: `/${firstMunicipality.slug}`,
    schema: ["Place", "CollectionPage", "BreadcrumbList"],
    indexable: true,
  });
}

describe("declaração de SEO por superfície (contracts/routes.md)", () => {
  it("cobre as superfícies do contrato, não uma amostra que encolheu sozinha", () => {
    expect(ROUTES.length).toBe(12);
  });

  describe.each(ROUTES)("$name", ({ route, schema, indexable }) => {
    it("emite canônica absoluta e própria", () => {
      const href = canonical(htmlFor(route));

      expect(href, "sem <link rel=canonical>").toBeDefined();
      // Canônica relativa é ignorada por parte dos rastreadores e quebra em cópia de
      // conteúdo; a regra do contrato é "absoluta", e absoluta é verificável.
      expect(href).toMatch(/^https:\/\//);
      expect(href).toBe(`${SITE}${route === "/" ? "/" : route}`);
    });

    it("declara Open Graph e Twitter Cards completos", () => {
      const html = htmlFor(route);

      for (const property of ["og:title", "og:description", "og:url", "og:type", "og:image"]) {
        expect(metaContent(html, property), `sem ${property}`).toBeTruthy();
      }
      for (const name of ["twitter:card", "twitter:title", "twitter:description"]) {
        expect(metaContent(html, name), `sem ${name}`).toBeTruthy();
      }

      expect(metaContent(html, "og:url")).toBe(canonical(html));
    });

    it("emite o JSON-LD declarado para o tipo de superfície", () => {
      const types = schemaTypes(htmlFor(route));
      for (const expected of schema) {
        expect(types, `sem @type ${expected}`).toContain(expected);
      }
    });

    it("respeita a indexabilidade declarada", () => {
      const robots = metaContent(htmlFor(route), "robots") ?? "";
      if (indexable) {
        expect(robots).not.toContain("noindex");
      } else {
        expect(robots).toContain("noindex");
        expect(robots).toContain("follow");
      }
    });
  });

  it("a matéria carrega vínculo geográfico no JSON-LD", () => {
    if (firstArticle === undefined) throw new Error("sem matéria demonstrativa");

    const blocks = jsonLdBlocks(htmlFor(`/noticia/${firstArticle.slug}`));
    const serialized = JSON.stringify(blocks);

    // `contentLocation` → `Place` do município primário. É o que liga a matéria à
    // taxonomia geográfica, e é a coluna que `contracts/routes.md` exige desta superfície.
    expect(serialized).toContain("contentLocation");
    expect(serialized).toContain('"@type":"Place"');

    const municipality = MUNICIPALITIES.find(
      (item) => item.ibgeCode === firstArticle.municipalityIbgeCode,
    );
    expect(municipality).toBeDefined();
    expect(serialized).toContain(municipality?.name ?? "###");
  });

  it("a galeria de componentes fica fora do índice e de todo sitemap", () => {
    const html = htmlFor("/componentes");
    expect(metaContent(html, "robots") ?? "").toContain("noindex");

    const sitemaps = ["sitemap-core.xml", "sitemap-articles.xml", "sitemap-sections.xml"];
    for (const file of sitemaps) {
      const path = join(DIST, file);
      if (!existsSync(path)) continue;
      expect(readFileSync(path, "utf8")).not.toContain("/componentes");
    }
  });

  it("robots.txt bloqueia busca e galeria e aponta o índice de sitemaps", () => {
    const robots = readFileSync(join(DIST, "robots.txt"), "utf8");

    expect(robots).toContain("Disallow: /busca");
    expect(robots).toContain("Disallow: /componentes");
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
  });

  it("o índice de sitemaps referencia todos os sitemaps por seção", () => {
    const index = readFileSync(join(DIST, "sitemap-index.xml"), "utf8");

    for (const file of [
      "sitemap-core.xml",
      "sitemap-articles.xml",
      "sitemap-sections.xml",
      "sitemap-places.xml",
      "sitemap-news.xml",
      "sitemap-images.xml",
    ]) {
      expect(index, `índice sem ${file}`).toContain(file);
    }
  });

  it("o news sitemap se limita às últimas 48 h e a 1000 URLs", () => {
    const xml = readFileSync(join(DIST, "sitemap-news.xml"), "utf8");
    const urls = [...xml.matchAll(/<loc>/g)].length;

    expect(urls).toBeLessThanOrEqual(1000);
    expect(xml).toContain("news:news");

    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    const recent = news.filter((item) => Date.parse(item.publishedAt) >= cutoff);
    expect(urls).toBe(recent.length);
  });

  it("todo município do registro tem hub e feed RSS gerados", () => {
    for (const municipality of MUNICIPALITIES) {
      expect(() => htmlFor(`/${municipality.slug}`)).not.toThrow();
      expect(existsSync(join(DIST, "rss", `${municipality.slug}.xml`))).toBe(true);
    }
  });
});
