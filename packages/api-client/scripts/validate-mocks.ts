/**
 * Cenário V11 / regra 7 — os dados demonstrativos são validados na construção.
 *
 * Duas camadas, porque cada uma pega o que a outra não vê:
 *   1. schema Zod  — a forma de cada peça bate com o contrato OpenAPI;
 *   2. regras transversais — as relações entre peças fecham (município existe, bairro
 *      pertence ao município certo, curada tem atribuição, slug não colide).
 *
 * Um dado que passa em (1) e falha em (2) é o caso perigoso: parece correto isolado e
 * quebra a página inteira em produção.
 */
import {
  assertDatasetIsValid,
  authorSchema,
  categorySchema,
  companySchema,
  eventSchema,
  municipalitySchema,
  neighborhoodSchema,
  newsSchema,
  officialGazetteDocumentSchema,
  utilityItemSchema,
} from "@parnaibadigital/validation";
import { MUNICIPALITIES } from "../src/data/municipalities";
import * as data from "../src/mock/data";

/**
 * Tipo estrutural em vez de `import type { ZodType } from "zod"`: este pacote consome
 * schemas, não a biblioteca. Declarar dependência de Zod aqui a arrastaria para o grafo
 * do api-client — que é consumido pelas duas aplicações — sem nenhum ganho.
 */
interface SchemaLike {
  safeParse(
    value: unknown,
  ):
    | { success: true }
    | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } };
}

interface Collection {
  name: string;
  schema: SchemaLike;
  items: readonly unknown[];
}

const collections: Collection[] = [
  { name: "municipalities", schema: municipalitySchema, items: MUNICIPALITIES },
  { name: "neighborhoods", schema: neighborhoodSchema, items: data.neighborhoods },
  { name: "categories", schema: categorySchema, items: data.categories },
  { name: "authors", schema: authorSchema, items: data.authors },
  { name: "news", schema: newsSchema, items: data.news },
  { name: "events", schema: eventSchema, items: data.events },
  { name: "companies", schema: companySchema, items: data.companies },
  { name: "utilities", schema: utilityItemSchema, items: data.utilities },
  { name: "gazette", schema: officialGazetteDocumentSchema, items: data.gazette },
];

let failures = 0;

for (const collection of collections) {
  collection.items.forEach((item, index) => {
    const result = collection.schema.safeParse(item);
    if (result.success) return;

    failures += 1;
    console.error(`\n${collection.name}[${String(index)}] não bate com o contrato:`);
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join(".") || "(raiz)"}: ${issue.message}`);
    }
  });
}

if (failures > 0) {
  console.error(
    `\n${String(failures)} peça(s) fora do contrato. A fonte de verdade é ` +
      "specs/001-fundacao-prototipo-monorepo/contracts/openapi-v1.yaml — ajuste o dado, não o schema.",
  );
  process.exit(1);
}

try {
  assertDatasetIsValid({
    municipalities: MUNICIPALITIES,
    neighborhoods: data.neighborhoods,
    news: data.news,
    events: data.events,
    companies: data.companies,
    gazette: data.gazette,
    authors: data.authors,
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const total = collections.reduce((sum, collection) => sum + collection.items.length, 0);
console.log(
  `Dados demonstrativos válidos — ${String(total)} peça(s) em ${String(collections.length)} coleções, ` +
    "schema e as 7 regras transversais conferem.",
);
