import { z } from "zod";

/**
 * D-11 — os schemas espelham `contracts/openapi-v1.yaml`. O contrato governa a *forma*;
 * o Zod existe para validar dados reais contra ela em build (FR-038: nada roda em runtime
 * de servidor nesta fase). Onde o OpenAPI declara `pattern`, `minimum` ou `enum`, o schema
 * repete a mesma restrição — divergir aqui seria criar uma segunda fonte de verdade.
 */

/** `^[a-z0-9]+(?:-[a-z0-9]+)*$` — minúsculo, sem acento, sem stop word. */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug deve ser minúsculo, sem acento, separado por hífen");

/** Identidade canônica do município. Sete dígitos, nunca o slug, nunca o nome. */
export const ibgeCodeSchema = z
  .string()
  .regex(/^[0-9]{7}$/, "código IBGE deve ter exatamente 7 dígitos");

/** `{municipioSlug}:{bairroSlug}` — nome isolado nunca identifica bairro. */
export const neighborhoodIdSchema = z
  .string()
  .regex(
    /^[a-z0-9-]+:[a-z0-9-]+$/,
    "id de bairro deve ser {municipioSlug}:{bairroSlug} — bairro homônimo só é distinguível assim",
  );

export const toneSchema = z.enum(["urgent", "brand", "highlight", "standard"]);

/**
 * `alt` obrigatório e não vazio (Princípio III); `width`/`height` obrigatórios porque é
 * deles que sai a reserva de espaço que mantém o CLS abaixo de 0,05 (Princípio I).
 */
export const mediaRefSchema = z.object({
  url: z.url(),
  alt: z.string().min(1, "toda imagem de conteúdo precisa de texto alternativo (Princípio III)"),
  width: z.int().min(1),
  height: z.int().min(1),
  credit: z.string().optional(),
});

export const curationStampSchema = z.object({
  kind: z.enum(["curated", "original"]),
  reviewedByHuman: z.boolean(),
  updatedAt: z.iso.datetime({ offset: true }),
});

/** Renderiza "Informações originais publicadas por [Veículo]" com link direto à fonte. */
export const attributionSchema = z.object({
  sourceName: z.string().min(1),
  sourceUrl: z.url(),
  archivedUrl: z.url().optional(),
});

export type MediaRefInput = z.infer<typeof mediaRefSchema>;
export type CurationStampInput = z.infer<typeof curationStampSchema>;
export type AttributionInput = z.infer<typeof attributionSchema>;
