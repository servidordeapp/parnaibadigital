import { z } from "zod";

import { slugSchema } from "./primitives";

export const gazetteTypeSchema = z.enum([
  "portaria",
  "edital",
  "licitacao",
  "decreto",
  "resolucao",
  "contrato",
]);

/**
 * Princípio V — a máquina de estados não tem aresta de `fila_ia` para `publicado`.
 * A revisão humana não é pulável nem na representação (User Story 2, cenário 2).
 */
export const gazetteStatusSchema = z.enum(["fila_ia", "em_revisao", "publicado", "arquivado"]);

/** Transições permitidas. Existe para ser consultada, não executada nesta fase. */
export const GAZETTE_TRANSITIONS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  fila_ia: ["em_revisao", "arquivado"],
  em_revisao: ["publicado", "arquivado"],
  publicado: [],
  arquivado: [],
});

export function isAllowedGazetteTransition(from: string, to: string): boolean {
  return GAZETTE_TRANSITIONS[from]?.includes(to) ?? false;
}

export const officialGazetteDocumentSchema = z.object({
  id: z.string().min(1),
  number: z.string().min(1),
  agency: z.string().min(1),
  department: z.string().optional(),
  publishedAt: z.iso.date(),
  type: gazetteTypeSchema,
  summary: z.string().min(1),
  status: gazetteStatusSchema,
  /** Referência verificável ao original. Nunca opcional (Princípio V). */
  sourceRef: z.object({
    documentId: z.string().min(1),
    sourceUrl: z.url(),
    archivedUrl: z.url().optional(),
  }),
  /** Ausência é estado legítimo: nem todo documento oficial vira matéria. */
  generatedNewsSlug: slugSchema.optional(),
});

export type OfficialGazetteDocumentInput = z.infer<typeof officialGazetteDocumentSchema>;
