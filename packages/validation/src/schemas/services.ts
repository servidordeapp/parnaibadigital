import { z } from "zod";

import { ibgeCodeSchema, neighborhoodIdSchema, slugSchema } from "./primitives";

export const eventSchema = z.object({
  id: z.string().min(1),
  slug: slugSchema,
  title: z.string().min(1),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).optional(),
  venue: z.string().min(1),
  municipalityIbgeCode: ibgeCodeSchema,
  neighborhoodId: neighborhoodIdSchema.optional(),
  categorySlug: slugSchema,
  price: z.object({
    free: z.boolean(),
    amount: z.number().min(0).optional(),
  }),
});

export const companySchema = z.object({
  id: z.string().min(1),
  slug: slugSchema,
  name: z.string().min(1),
  categorySlug: slugSchema,
  neighborhoodId: neighborhoodIdSchema,
  rating: z.number().min(0).max(5),
  reviewCount: z.int().min(0),
  /** Formato local `(86) 3322-4410` — o DS exibe dado de serviço em fonte mono. */
  phone: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "telefone deve estar no formato local (86) 3322-4410")
    .optional(),
  openingStatus: z.enum(["aberto", "fechado", "fecha_em_breve"]),
});

/** Os quatro grupos são fixos, e cada um tem estado vazio próprio. */
export const utilityGroupSchema = z.enum(["concursos", "empregos", "licitacoes", "editais"]);

export const utilityItemSchema = z.object({
  id: z.string().min(1),
  group: utilityGroupSchema,
  agency: z.string().min(1),
  title: z.string().min(1),
  detail: z.string().optional(),
  amount: z.number().min(0).optional(),
  deadline: z.iso.date().optional(),
  statusBadge: z.string().min(1),
});

export type EventInput = z.infer<typeof eventSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type UtilityItemInput = z.infer<typeof utilityItemSchema>;
