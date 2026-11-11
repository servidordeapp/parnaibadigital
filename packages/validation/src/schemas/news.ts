import { z } from "zod";

import {
  attributionSchema,
  curationStampSchema,
  ibgeCodeSchema,
  mediaRefSchema,
  neighborhoodIdSchema,
  slugSchema,
  toneSchema,
} from "./primitives";

/** Bloco tipado. Nunca HTML cru do cliente — o corpo é estrutura, não string. */
export const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: z.string().min(1) }),
  z.object({ type: z.literal("heading"), level: z.int().min(2).max(4), text: z.string().min(1) }),
  z.object({
    type: z.literal("list"),
    ordered: z.boolean().optional(),
    items: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    type: z.literal("quote"),
    text: z.string().min(1),
    attribution: z.string().optional(),
  }),
  z.object({ type: z.literal("image"), media: mediaRefSchema }),
]);

export const categorySchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  tone: toneSchema,
});

export const authorSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  bio: z.string(),
  portrait: mediaRefSchema.optional(),
  articleCount: z.int().min(0),
});

/** Projeção de listagem — o que card, hero e feed consomem. */
export const newsSummarySchema = z.object({
  id: z.string().min(1),
  slug: slugSchema,
  headline: z.string().min(1),
  standfirst: z.string().optional(),
  categorySlug: slugSchema,
  tone: toneSchema,
  authorSlug: slugSchema,
  /** Localização primária. Sem ela não existe hub canônico nem `contentLocation`. */
  municipalityIbgeCode: ibgeCodeSchema,
  neighborhoodIds: z.array(neighborhoodIdSchema),
  publishedAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
  image: mediaRefSchema.optional(),
  curation: curationStampSchema,
  sponsored: z.boolean(),
  viewCount: z.int().min(0).optional(),
  commentCount: z.int().min(0).optional(),
});

export const newsSchema = newsSummarySchema.extend({
  body: z.array(contentBlockSchema),
  attribution: attributionSchema.optional(),
  regionalContext: z.string().optional(),
  gazetteDocumentId: z.string().optional(),
});

export type ContentBlockInput = z.infer<typeof contentBlockSchema>;
export type NewsSummaryInput = z.infer<typeof newsSummarySchema>;
export type NewsInput = z.infer<typeof newsSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type AuthorInput = z.infer<typeof authorSchema>;
