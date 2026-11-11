/**
 * As 7 regras transversais de `data-model.md`.
 *
 * Elas existem porque schema sozinho não as alcança: um schema valida uma peça isolada,
 * e todas estas regras são sobre a *relação* entre peças — se o município referenciado
 * existe, se o bairro pertence ao município certo, se dois slugs colidem. Um dado que
 * passa no Zod e falha aqui é exatamente o tipo de erro que só aparece em produção.
 *
 * Regra 7 é a que dá dente às outras seis: falha **reprova a construção**, não gera aviso.
 * `assertDatasetIsValid` lança; quem chama é o `validate:mocks` do build (FR-038 não
 * permite descobrir isso em runtime, porque runtime não existe nesta fase).
 */
import type {
  AuthorInput,
  CompanyInput,
  EventInput,
  MediaRefInput,
  MunicipalityInput,
  NeighborhoodInput,
  NewsInput,
  OfficialGazetteDocumentInput,
} from "./schemas";

export interface Dataset {
  municipalities: readonly MunicipalityInput[];
  neighborhoods: readonly NeighborhoodInput[];
  news: readonly NewsInput[];
  events: readonly EventInput[];
  companies: readonly CompanyInput[];
  gazette: readonly OfficialGazetteDocumentInput[];
  authors?: readonly AuthorInput[];
}

export interface RuleViolation {
  /** Número da regra em `data-model.md` — facilita achar a origem sem caçar no código. */
  rule: 1 | 2 | 3 | 4 | 5 | 6;
  entity: string;
  id: string;
  message: string;
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/** Regra 1 — toda peça geolocalizada resolve para um município do registro. */
function checkMunicipalityExists(dataset: Dataset): RuleViolation[] {
  const known = new Set(dataset.municipalities.map((m) => m.ibgeCode));
  const violations: RuleViolation[] = [];

  const geolocated: [string, readonly { id: string; municipalityIbgeCode: string }[]][] = [
    ["News", dataset.news],
    ["Event", dataset.events],
  ];

  for (const [entity, items] of geolocated) {
    for (const item of items) {
      if (!known.has(item.municipalityIbgeCode)) {
        violations.push({
          rule: 1,
          entity,
          id: item.id,
          message: `município ${item.municipalityIbgeCode} não existe no registro canônico`,
        });
      }
    }
  }

  // Company se localiza por bairro; o município vem por transitividade.
  const neighborhoodOwner = new Map(
    dataset.neighborhoods.map((b) => [b.id, b.municipalityIbgeCode]),
  );
  for (const company of dataset.companies) {
    const owner = neighborhoodOwner.get(company.neighborhoodId);
    if (owner === undefined) {
      violations.push({
        rule: 1,
        entity: "Company",
        id: company.id,
        message: `bairro ${company.neighborhoodId} não existe no registro`,
      });
    } else if (!known.has(owner)) {
      violations.push({
        rule: 1,
        entity: "Company",
        id: company.id,
        message: `bairro ${company.neighborhoodId} aponta para município ${owner}, fora do registro`,
      });
    }
  }

  return violations;
}

/** Regra 2 — todo bairro citado pertence ao município da própria peça. */
function checkNeighborhoodBelongsToMunicipality(dataset: Dataset): RuleViolation[] {
  const owner = new Map(dataset.neighborhoods.map((b) => [b.id, b.municipalityIbgeCode]));
  const violations: RuleViolation[] = [];

  for (const item of dataset.news) {
    for (const neighborhoodId of item.neighborhoodIds) {
      const actual = owner.get(neighborhoodId);
      if (actual === undefined) {
        violations.push({
          rule: 2,
          entity: "News",
          id: item.id,
          message: `bairro ${neighborhoodId} não existe no registro`,
        });
      } else if (actual !== item.municipalityIbgeCode) {
        violations.push({
          rule: 2,
          entity: "News",
          id: item.id,
          message:
            `bairro ${neighborhoodId} pertence ao município ${actual}, ` +
            `mas a matéria é de ${item.municipalityIbgeCode} — bairro homônimo não é o mesmo bairro`,
        });
      }
    }
  }

  for (const event of dataset.events) {
    if (event.neighborhoodId === undefined) continue;
    const actual = owner.get(event.neighborhoodId);
    if (actual !== event.municipalityIbgeCode) {
      violations.push({
        rule: 2,
        entity: "Event",
        id: event.id,
        message: `bairro ${event.neighborhoodId} não pertence a ${event.municipalityIbgeCode}`,
      });
    }
  }

  return violations;
}

/** Regra 3 — `curation.kind = "curated"` exige atribuição com URL absoluta (Princípio V). */
function checkCuratedHasAttribution(dataset: Dataset): RuleViolation[] {
  const violations: RuleViolation[] = [];

  for (const item of dataset.news) {
    if (item.curation.kind !== "curated") continue;

    if (item.attribution === undefined) {
      violations.push({
        rule: 3,
        entity: "News",
        id: item.id,
        message:
          "matéria curada sem `attribution` — o rodapé 'Informações originais publicadas por' " +
          "é contrato de confiança, não enfeite (FR-018, Princípio V)",
      });
      continue;
    }

    if (!isAbsoluteUrl(item.attribution.sourceUrl)) {
      violations.push({
        rule: 3,
        entity: "News",
        id: item.id,
        message: `attribution.sourceUrl "${item.attribution.sourceUrl}" não é absoluta — o link à fonte precisa sair do portal`,
      });
    }
  }

  return violations;
}

/** Regra 4 — todo documento oficial tem referência verificável ao original. */
function checkGazetteSourceRef(dataset: Dataset): RuleViolation[] {
  return dataset.gazette
    .filter((doc) => !isAbsoluteUrl(doc.sourceRef.sourceUrl))
    .map((doc) => ({
      rule: 4 as const,
      entity: "OfficialGazetteDocument",
      id: doc.id,
      message: `sourceRef.sourceUrl "${doc.sourceRef.sourceUrl}" não é absoluta — sem original verificável não há publicação (Princípio V)`,
    }));
}

/** Regra 5 — todo `MediaRef` de conteúdo tem `alt` não vazio, `width` e `height`. */
function checkMediaRefs(dataset: Dataset): RuleViolation[] {
  const violations: RuleViolation[] = [];

  const inspect = (entity: string, id: string, media: MediaRefInput | undefined, where: string) => {
    if (media === undefined) return; // ausência de foto é estado legítimo — cai para PhotoFrame
    if (media.alt.trim() === "") {
      violations.push({
        rule: 5,
        entity,
        id,
        message: `${where}: alt vazio — imagem de conteúdo sem texto alternativo reprova WCAG 2.1 AA`,
      });
    }
    if (media.width < 1 || media.height < 1) {
      violations.push({
        rule: 5,
        entity,
        id,
        message: `${where}: width/height ausentes ou inválidos — é deles que sai a reserva contra layout shift`,
      });
    }
  };

  for (const item of dataset.news) {
    inspect("News", item.id, item.image, "image");
    item.body.forEach((block, index) => {
      if (block.type === "image") {
        inspect("News", item.id, block.media, `body[${String(index)}]`);
      }
    });
  }

  for (const author of dataset.authors ?? []) {
    inspect("Author", author.slug, author.portrait, "portrait");
  }

  return violations;
}

/** Regra 6 — nenhum slug duplicado dentro do seu escopo. */
function checkSlugUniqueness(dataset: Dataset): RuleViolation[] {
  const violations: RuleViolation[] = [];

  const globalScopes: [string, readonly { id?: string; slug: string }[]][] = [
    ["Municipality", dataset.municipalities.map((m) => ({ id: m.ibgeCode, slug: m.slug }))],
    ["News", dataset.news],
    ["Event", dataset.events],
    ["Company", dataset.companies],
  ];

  for (const [entity, items] of globalScopes) {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.slug)) {
        violations.push({
          rule: 6,
          entity,
          id: item.id ?? item.slug,
          message: `slug "${item.slug}" duplicado — no escopo de ${entity} o slug é único`,
        });
      }
      seen.add(item.slug);
    }
  }

  // Bairro é único DENTRO do município, nunca globalmente: "Centro" existe em vários.
  const perMunicipality = new Map<string, Set<string>>();
  for (const bairro of dataset.neighborhoods) {
    const scope = perMunicipality.get(bairro.municipalityIbgeCode) ?? new Set<string>();
    if (scope.has(bairro.slug)) {
      violations.push({
        rule: 6,
        entity: "Neighborhood",
        id: bairro.id,
        message: `slug "${bairro.slug}" duplicado dentro do município ${bairro.municipalityIbgeCode}`,
      });
    }
    scope.add(bairro.slug);
    perMunicipality.set(bairro.municipalityIbgeCode, scope);
  }

  return violations;
}

/** Roda as 6 regras verificáveis e devolve todas as violações de uma vez. */
export function validateDataset(dataset: Dataset): RuleViolation[] {
  return [
    ...checkMunicipalityExists(dataset),
    ...checkNeighborhoodBelongsToMunicipality(dataset),
    ...checkCuratedHasAttribution(dataset),
    ...checkGazetteSourceRef(dataset),
    ...checkMediaRefs(dataset),
    ...checkSlugUniqueness(dataset),
  ];
}

export class DatasetValidationError extends Error {
  constructor(readonly violations: readonly RuleViolation[]) {
    const detail = violations
      .map((v) => `  [regra ${String(v.rule)}] ${v.entity} ${v.id}: ${v.message}`)
      .join("\n");
    super(
      `${String(violations.length)} violação(ões) das regras transversais de data-model.md:\n${detail}`,
    );
    this.name = "DatasetValidationError";
  }
}

/**
 * Regra 7 — falha reprova a construção. Aviso seria ignorado até virar erro em produção;
 * exceção para o build inteiro.
 */
export function assertDatasetIsValid(dataset: Dataset): void {
  const violations = validateDataset(dataset);
  if (violations.length > 0) {
    throw new DatasetValidationError(violations);
  }
}
