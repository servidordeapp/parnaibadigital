import { z } from "zod";

import { ibgeCodeSchema, neighborhoodIdSchema, slugSchema } from "./primitives";

export const municipalitySchema = z.object({
  ibgeCode: ibgeCodeSchema,
  name: z.string().min(1),
  slug: slugSchema,
  state: z.literal("PI"),
  newsCount: z.int().min(0),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const neighborhoodSchema = z
  .object({
    id: neighborhoodIdSchema,
    name: z.string().min(1),
    slug: slugSchema,
    municipalityIbgeCode: ibgeCodeSchema,
  })
  .refine((bairro) => bairro.id.endsWith(`:${bairro.slug}`), {
    message: "o id do bairro deve terminar em `:{slug}` — id e slug não podem divergir",
    path: ["id"],
  });

export type MunicipalityInput = z.infer<typeof municipalitySchema>;
export type NeighborhoodInput = z.infer<typeof neighborhoodSchema>;
