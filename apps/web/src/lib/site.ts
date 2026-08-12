import {
  DEFAULT_MUNICIPALITY_IBGE_CODE,
  findMunicipalityByIbgeCode,
  getDataClient,
  MUNICIPALITIES,
} from "@parnaibadigital/api-client";
import type { Municipality, Neighborhood, NewsSummary } from "@parnaibadigital/types";

/**
 * Constantes e formatações do portal, num lugar só.
 *
 * O que mora aqui é o que várias telas repetiriam de forma quase igual — e "quase igual" é
 * como um site passa a mostrar "São José · Parnaíba" numa tela e "São José, Parnaíba" na
 * seguinte. A formatação de lugar, em especial, é a assinatura do produto: ela precisa ser
 * idêntica em card, hero, resultado de busca e feed.
 */

export const SITE_URL = "https://parnaibadigital.com.br";
export const SITE_NAME = "ParnaíbaDigital";
export const SITE_TAGLINE = "Jornalismo hiperlocal para Parnaíba e o Litoral do Piauí";

/** Imagem padrão de compartilhamento. Não há banco de fotos (Assumption 9). */
export const DEFAULT_SHARE_IMAGE = `${SITE_URL}/og-default.svg`;

export const client = getDataClient();

export function absoluteUrl(path: string): string {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

/** Município padrão da home, conforme `contracts/routes.md`. */
export function defaultMunicipality(): Municipality {
  const municipality = findMunicipalityByIbgeCode(DEFAULT_MUNICIPALITY_IBGE_CODE);
  if (municipality === undefined) {
    // Falha ruidosa em build, e deliberada: sem município padrão a home não tem vínculo
    // geográfico, e uma home sem geografia contraria o Princípio II em silêncio.
    throw new Error(
      `DEFAULT_MUNICIPALITY_IBGE_CODE=${DEFAULT_MUNICIPALITY_IBGE_CODE} não está no registro.`,
    );
  }
  return municipality;
}

/**
 * "Pedra do Sal · Luís Correia" — e, sem bairro, apenas "Cajueiro da Praia".
 *
 * Matéria sem bairro é estado legítimo (edge case da spec): o rótulo cai para o município
 * em vez de exibir separador solto ou a palavra "undefined", que é o defeito clássico
 * quando a formatação vive dentro do componente.
 */
export function placeLabel(
  municipality: Municipality | undefined,
  neighborhood?: Neighborhood,
): string {
  const city = municipality?.name ?? "";
  if (neighborhood === undefined) return city;
  return city === "" ? neighborhood.name : `${neighborhood.name} · ${city}`;
}

export function newsHref(slug: string): string {
  return `/noticia/${slug}`;
}

export function municipalityHref(municipality: Municipality): string {
  return `/${municipality.slug}`;
}

export function neighborhoodHref(municipality: Municipality, neighborhood: Neighborhood): string {
  return `/${municipality.slug}/${neighborhood.slug}`;
}

export function categoryHref(slug: string): string {
  return `/editoria/${slug}`;
}

export function authorHref(slug: string): string {
  return `/autor/${slug}`;
}

/** O rótulo de lugar de uma matéria, resolvido a partir dos identificadores dela. */
export async function placeLabelForNews(item: NewsSummary): Promise<string> {
  const municipality = findMunicipalityByIbgeCode(item.municipalityIbgeCode);
  const firstNeighborhoodId = item.neighborhoodIds[0];
  const neighborhood =
    firstNeighborhoodId === undefined
      ? undefined
      : await client.geo.findNeighborhood(firstNeighborhoodId);

  return placeLabel(municipality, neighborhood);
}

/** Endereço canônico da matéria, pronto para `<a href>`, feed e JSON-LD. */
export function municipalityOf(item: NewsSummary): Municipality | undefined {
  return findMunicipalityByIbgeCode(item.municipalityIbgeCode);
}

/**
 * As seções do cabeçalho. Derivadas das rotas reais, não de uma lista paralela — uma
 * segunda lista divergiria da navegação no primeiro acréscimo (FR-030).
 */
export const HEADER_SECTIONS = [
  { label: "Eventos", href: "/eventos" },
  { label: "Utilidade pública", href: "/utilidade-publica" },
  { label: "Diário Oficial", href: "/diario-oficial" },
  { label: "Empresas", href: "/empresas" },
] as const;

/** Municípios como itens de navegação — gerados do registro (SC-010). */
export function headerCities(): { name: string; href: string }[] {
  return MUNICIPALITIES.map((municipality) => ({
    name: municipality.name,
    href: municipalityHref(municipality),
  }));
}

export const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
export const dateTimeFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});
export const currencyFormat = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
