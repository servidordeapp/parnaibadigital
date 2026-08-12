import type { DataClient } from "./ports";
import { createHttpClient } from "./transports/http";
import { createMockClient } from "./transports/mock";

/**
 * SC-011 — a escolha de transporte acontece **em um lugar só**.
 *
 * Se cada tela decidisse de onde ler, trocar de fonte seria uma varredura por 25 arquivos e
 * a garantia de esquecer um. Aqui é uma variável de ambiente lida uma vez, em build.
 */
export type TransportName = "mock" | "http";

function resolveTransportName(): TransportName {
  const configured = process.env.PD_DATA_TRANSPORT;
  if (configured === undefined || configured === "") return "mock";
  if (configured === "mock" || configured === "http") return configured;

  throw new Error(
    `PD_DATA_TRANSPORT="${configured}" é inválido. Valores aceitos: "mock" (padrão) ou "http".`,
  );
}

let client: DataClient | undefined;

/** Cliente de dados da aplicação. Toda tela consome esta função — nunca um transporte direto. */
export function getDataClient(): DataClient {
  client ??=
    resolveTransportName() === "http"
      ? createHttpClient({ baseUrl: process.env.PD_API_BASE_URL ?? "" })
      : createMockClient();
  return client;
}

/** Só para teste: descarta o cliente memoizado entre casos. */
export function resetDataClient(): void {
  client = undefined;
}

export { createHttpClient, createMockClient, resolveTransportName };
export * from "./ports";
export {
  DEFAULT_MUNICIPALITY_IBGE_CODE,
  findMunicipalityByIbgeCode,
  findMunicipalityBySlug,
  findSlugConflicts,
  isReservedRoute,
  MUNICIPALITIES,
  RESERVED_ROUTES,
} from "./data/municipalities";
