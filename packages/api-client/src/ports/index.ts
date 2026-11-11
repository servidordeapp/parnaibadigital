import type {
  Author,
  Category,
  Company,
  Event,
  Municipality,
  Neighborhood,
  News,
  NewsSummary,
  OfficialGazetteDocument,
  SearchResult,
  UtilityItem,
} from "@parnaibadigital/types";

/**
 * D-12 / Princípio VII — as telas conversam com portas, nunca com um transporte.
 *
 * O ganho não é abstração por gosto: é que a mesma tela que hoje lê de um módulo
 * TypeScript vai ler de HTTP na próxima fase **sem alterar uma linha de página**. Se a
 * assinatura aqui vazasse detalhe de transporte (uma `Response`, um `fetch`, um caminho de
 * arquivo), a troca obrigaria a reescrever as 25 superfícies — que é exatamente o custo
 * que esta camada existe para não pagar.
 *
 * Toda porta é somente leitura. Escrita não existe nesta fase (FR-038).
 */

export interface Page<T> {
  data: T[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
}

export interface NewsQuery {
  page?: number | undefined;
  perPage?: number | undefined;
  categorySlug?: string | undefined;
  municipalityIbgeCode?: string | undefined;
  neighborhoodId?: string | undefined;
  authorSlug?: string | undefined;
}

export interface NewsRepository {
  list(query?: NewsQuery): Promise<Page<NewsSummary>>;
  findBySlug(slug: string): Promise<News | undefined>;
  /** Alimenta `sitemap-news.xml` — últimas 48 h, no máximo 1000 URLs. */
  listRecent(withinHours: number, limit: number): Promise<NewsSummary[]>;
  listAllSlugs(): Promise<string[]>;
}

export interface GeoRepository {
  listMunicipalities(): Promise<Municipality[]>;
  findMunicipalityBySlug(slug: string): Promise<Municipality | undefined>;
  /** Bairros de um município. Bairro nunca é listado sem o município que o qualifica. */
  listNeighborhoods(municipalityIbgeCode: string): Promise<Neighborhood[]>;
  findNeighborhood(id: string): Promise<Neighborhood | undefined>;
}

export interface CategoryRepository {
  list(): Promise<Category[]>;
  findBySlug(slug: string): Promise<Category | undefined>;
}

export interface AuthorRepository {
  list(): Promise<Author[]>;
  findBySlug(slug: string): Promise<Author | undefined>;
}

export interface GazetteRepository {
  list(): Promise<OfficialGazetteDocument[]>;
  findById(id: string): Promise<OfficialGazetteDocument | undefined>;
}

export interface EventRepository {
  list(municipalityIbgeCode?: string): Promise<Event[]>;
}

export interface CompanyRepository {
  list(neighborhoodId?: string): Promise<Company[]>;
}

export interface UtilityRepository {
  list(group?: string): Promise<UtilityItem[]>;
}

export interface SearchRepository {
  /** Casca de busca. Sem motor real nesta fase — a porta `SearchEngine` do backend
   *  (D-14, Meilisearch) é quem receberá a implementação. */
  query(term: string): Promise<SearchResult[]>;
}

/** O conjunto que uma aplicação recebe. Uma tela pede a porta que precisa, não o objeto todo. */
export interface DataClient {
  news: NewsRepository;
  geo: GeoRepository;
  categories: CategoryRepository;
  authors: AuthorRepository;
  gazette: GazetteRepository;
  events: EventRepository;
  companies: CompanyRepository;
  utilities: UtilityRepository;
  search: SearchRepository;
}
