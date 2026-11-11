/**
 * As 11 superfícies administrativas de `contracts/routes.md`, num lugar só.
 *
 * Mesma razão de `surfaces.ts`: uma lista repetida por spec acaba divergindo, e o teste que
 * checa 10 telas passa achando que checou 11.
 *
 * `/noticias/{id}/editar` é derivada dos dados demonstrativos — um id fixo continuaria
 * "passando" depois de a matéria sumir, que é exatamente a falha que deveria pegar.
 */
import { news } from "@parnaibadigital/api-client/mock/data/index";

export const ADMIN_BASE_URL = "http://localhost:4322";

export interface AdminSurface {
  name: string;
  path: string;
}

export const STATIC_ADMIN_SURFACES: readonly AdminSurface[] = [
  { name: "Dashboard", path: "/" },
  { name: "Notícias", path: "/noticias" },
  { name: "Pipeline de IA", path: "/pipeline" },
  { name: "Diário Oficial", path: "/diario-oficial" },
  { name: "Publicidade", path: "/publicidade" },
  { name: "Analytics", path: "/analytics" },
  { name: "SEO", path: "/seo" },
  { name: "Integrações", path: "/integracoes" },
  { name: "Usuários", path: "/usuarios" },
  { name: "Configurações", path: "/configuracoes" },
];

export function adminSurfaces(): AdminSurface[] {
  const article = news[0];
  const editor: AdminSurface[] =
    article === undefined ? [] : [{ name: "Editor", path: `/noticias/${article.id}/editar` }];

  return [...STATIC_ADMIN_SURFACES, ...editor];
}

/** Quantas superfícies o contrato exige. */
export const EXPECTED_ADMIN_SURFACE_COUNT = 11;

export function adminUrl(path: string): string {
  return `${ADMIN_BASE_URL}${path}`;
}
