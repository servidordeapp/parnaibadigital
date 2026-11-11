import { absoluteUrl, DEFAULT_SHARE_IMAGE, SITE_NAME } from "../site";

/**
 * FR-028 a FR-031 / Princípio II — canônica, Open Graph e Twitter Cards.
 *
 * Uma função, não um punhado de `<meta>` espalhados pelas telas. O motivo é o modo de falha:
 * meta duplicada, canônica relativa e `og:url` divergindo da canônica são erros que não
 * aparecem em nenhuma tela e só se manifestam semanas depois, como página fora do índice ou
 * compartilhamento com o título errado. Montando tudo aqui, o teste de T049 tem um único
 * lugar para cobrar.
 *
 * A canônica é **sempre absoluta**. Relativa é aceita por parte dos rastreadores e ignorada
 * por outros — e quando o conteúdo é copiado por um agregador, a relativa passa a apontar
 * para o domínio do agregador, entregando a ele a autoridade da página.
 */

export interface PageMeta {
  title: string;
  description: string;
  /** Caminho da página, começando por `/`. A canônica é derivada dele. */
  path: string;
  /** `article` na matéria; `website` no resto. */
  type?: "website" | "article" | undefined;
  image?: string | undefined;
  imageAlt?: string | undefined;
  noindex?: boolean | undefined;
  publishedAt?: string | undefined;
  updatedAt?: string | undefined;
  authorName?: string | undefined;
  /** Editoria — vira `article:section`. */
  section?: string | undefined;
}

export interface ResolvedMeta {
  title: string;
  fullTitle: string;
  description: string;
  canonical: string;
  robots: string;
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
}

const MAX_DESCRIPTION = 160;

/**
 * Corta na palavra, não no caractere. Uma descrição cortada no meio de uma palavra é o
 * sinal visível de meta gerada sem cuidado — e aparece exatamente no resultado de busca.
 */
function clamp(text: string, limit = MAX_DESCRIPTION): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;

  const cut = clean.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:—-]$/, "")}…`;
}

export function resolveMeta(meta: PageMeta): ResolvedMeta {
  const canonical = absoluteUrl(meta.path);
  const description = clamp(meta.description);
  const image = meta.image ?? DEFAULT_SHARE_IMAGE;
  const type = meta.type ?? "website";

  // A home não repete o nome do site duas vezes; as demais recebem o sufixo da marca.
  const fullTitle = meta.path === "/" ? meta.title : `${meta.title} · ${SITE_NAME}`;

  const openGraph: Record<string, string> = {
    "og:site_name": SITE_NAME,
    "og:locale": "pt_BR",
    "og:type": type,
    "og:title": meta.title,
    "og:description": description,
    "og:url": canonical,
    "og:image": image,
    "og:image:alt": meta.imageAlt ?? meta.title,
  };

  if (type === "article") {
    if (meta.publishedAt !== undefined) openGraph["article:published_time"] = meta.publishedAt;
    if (meta.updatedAt !== undefined) openGraph["article:modified_time"] = meta.updatedAt;
    if (meta.authorName !== undefined) openGraph["article:author"] = meta.authorName;
    if (meta.section !== undefined) openGraph["article:section"] = meta.section;
  }

  return {
    title: meta.title,
    fullTitle,
    description,
    canonical,
    // `follow` mesmo quando fora do índice: a página não entra, mas os links dela continuam
    // levando descoberta às matérias (contracts/routes.md, /busca).
    robots: meta.noindex === true ? "noindex,follow" : "index,follow,max-image-preview:large",
    openGraph,
    twitter: {
      "twitter:card": "summary_large_image",
      "twitter:title": meta.title,
      "twitter:description": description,
      "twitter:image": image,
    },
  };
}
