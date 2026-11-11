export {
  attributionSchema,
  curationStampSchema,
  ibgeCodeSchema,
  mediaRefSchema,
  neighborhoodIdSchema,
  slugSchema,
  toneSchema,
} from "./primitives";

export { municipalitySchema, neighborhoodSchema } from "./geo";

export {
  authorSchema,
  categorySchema,
  contentBlockSchema,
  newsSchema,
  newsSummarySchema,
} from "./news";

export {
  GAZETTE_TRANSITIONS,
  gazetteStatusSchema,
  gazetteTypeSchema,
  isAllowedGazetteTransition,
  officialGazetteDocumentSchema,
} from "./gazette";

export { companySchema, eventSchema, utilityGroupSchema, utilityItemSchema } from "./services";

export type { AttributionInput, CurationStampInput, MediaRefInput } from "./primitives";
export type { MunicipalityInput, NeighborhoodInput } from "./geo";
export type {
  AuthorInput,
  CategoryInput,
  ContentBlockInput,
  NewsInput,
  NewsSummaryInput,
} from "./news";
export type { OfficialGazetteDocumentInput } from "./gazette";
export type { CompanyInput, EventInput, UtilityItemInput } from "./services";
