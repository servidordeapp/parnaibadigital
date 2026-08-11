# Contrato de Rotas e Declaração de SEO por Superfície

**Feature**: 001-fundacao-prototipo-monorepo

O Princípio II da Constituição exige que **toda página declare, no plano, seu tipo de schema,
sua canônica, sua entrada em sitemap e seu vínculo geográfico**. Esta é essa declaração —
ausência de qualquer coluna reprova o Constitution Check.

As 25 superfícies vêm do protótipo (FR-011, FR-012). A tela `mobile` do protótipo **não** vira
rota (FR-013).

---

## Portal público — `apps/web` (14 superfícies)

| # | Superfície | Rota | Renderização | Canônica | Schema JSON-LD | Sitemap | Vínculo geográfico |
|---|---|---|---|---|---|---|---|
| 1 | Home | `/` | SSG | `https://parnaibadigital.com.br/` | `WebSite` (+`SearchAction`), `Organization` | `sitemap-core.xml` | Município padrão: Parnaíba |
| 2 | Notícia | `/noticia/{slug}` | SSG por conteúdo | absoluta do slug | `NewsArticle` + `BreadcrumbList` | `sitemap-news.xml` (48 h) + `sitemap-articles.xml` + `sitemap-images.xml` | `contentLocation` → `Place` do município primário; bairros como secundários |
| 3 | Editoria | `/editoria/{slug}` | SSG | absoluta | `CollectionPage` + `BreadcrumbList` | `sitemap-sections.xml` | Herdado dos itens |
| 4 | Busca | `/busca?q=` | SSG (casca) + filtro sem JS via `GET` | `/busca` sem parâmetro | `WebSite` `SearchAction` | **não indexável** (`noindex,follow`) | — |
| 5 | Município (hub) | `/{municipio}` | SSG via `getStaticPaths` do registro | absoluta | `Place` + `CollectionPage` + `BreadcrumbList` | `sitemap-places.xml` | Ele mesmo (IBGE) |
| 6 | Bairro | `/{municipio}/{bairro}` | SSG | absoluta | `Place` (contido em) + `BreadcrumbList` | `sitemap-places.xml` | Município + bairro |
| 7 | Eventos | `/eventos` | SSG | absoluta | `ItemList` de `Event` + `BreadcrumbList` | `sitemap-core.xml` | Município do evento |
| 8 | Utilidade pública | `/utilidade-publica` | SSG | absoluta | `CollectionPage` | `sitemap-core.xml` | Região |
| 9 | Diário Oficial | `/diario-oficial` | SSG | absoluta | `CollectionPage` + `Dataset` (opcional) | `sitemap-core.xml` | Município do órgão |
| 10 | Empresas | `/empresas` | SSG | absoluta | `ItemList` de `LocalBusiness` | `sitemap-core.xml` | Bairro da empresa |
| 11 | Anunciante | `/anuncie` | SSG | absoluta | `WebPage` + `Organization` | `sitemap-core.xml` | — |
| 12 | Autor | `/autor/{slug}` | SSG | absoluta | `ProfilePage` + `Person` | `sitemap-core.xml` | — |
| 13 | Newsletter | `/newsletter` | SSG, formulário por `POST` HTML nativo | absoluta | `WebPage` | `sitemap-core.xml` | — |
| 14 | Erro | `404` | Estático, **status 404 real** | nenhuma | nenhum | não | — |

**Superfície de desenvolvimento** (Assumption 4, FR-005): `/componentes` — galeria/inventário
vivo. `noindex,nofollow`, fora de todo sitemap, excluída da medição de orçamento.

### Descoberta gerada (nunca mantida à mão, FR-030)

| Recurso | Caminho | Regra |
|---|---|---|
| Robots | `/robots.txt` | `Allow` geral; `Disallow` de `/busca`, `/componentes` |
| Índice de sitemaps | `/sitemap-index.xml` | Referencia todos abaixo |
| Sitemaps por seção | `/sitemap-core.xml`, `/sitemap-articles.xml`, `/sitemap-sections.xml`, `/sitemap-places.xml` | |
| News Sitemap | `/sitemap-news.xml` | Somente últimas 48 h, ≤ 1000 URLs |
| Image Sitemap | `/sitemap-images.xml` | Uma entrada por `MediaRef` de conteúdo |
| RSS por seção | `/rss/{editoria}.xml` | Uma por editoria |
| RSS por município | `/rss/{municipio}.xml` | Uma por entrada do registro — gerado, não codificado (SC-010) |

### Rotas reservadas (validadas contra o registro de slugs — D-13, SC-009)

`noticia`, `editoria`, `busca`, `eventos`, `utilidade-publica`, `diario-oficial`, `empresas`,
`anuncie`, `autor`, `newsletter`, `componentes`, `rss`, `robots.txt`, `sitemap-*`, `api`,
`_astro`, `assets`, `admin`.

Colisão entre qualquer um destes e um `Municipality.slug` **reprova a construção**, com
mensagem apontando o slug e a rota conflitante.

---

## Painel administrativo — `apps/admin` (11 superfícies)

Nenhuma é indexável: `noindex,nofollow` em toda página, `Disallow: /` no `robots.txt` próprio,
ausência total de sitemap. Sem autenticação nesta fase — acesso é bloqueado na borda
(User Story 2, cenário 5).

| # | Superfície | Rota |
|---|---|---|
| 1 | Dashboard | `/` |
| 2 | Notícias | `/noticias` |
| 3 | Editor | `/noticias/{id}/editar` |
| 4 | Pipeline de IA | `/pipeline` |
| 5 | Diário Oficial (fila) | `/diario-oficial` |
| 6 | Publicidade | `/publicidade` |
| 7 | Analytics | `/analytics` |
| 8 | SEO | `/seo` |
| 9 | Integrações | `/integracoes` |
| 10 | Usuários | `/usuarios` |
| 11 | Configurações | `/configuracoes` |

---

## Regras transversais de URL

1. Toda URL publicada é minúscula, sem acento, sem stop word desnecessária.
2. Alteração de slug publicado exige 301; nenhuma URL publicada retorna 404 por edição.
3. Paginação (`?page=`) emite canônica para a página 1 da listagem e `rel=prev/next`; não
   cria conteúdo duplicado indexável.
4. Parâmetro de campanha nunca altera a canônica.
5. Todo link de navegação é `<a href>` com URL resolvível (Princípio XI) — nenhum destino
   depende de manipulador de evento.
