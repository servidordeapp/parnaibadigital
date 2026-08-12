# SEO

**Feature**: 001-fundacao-prototipo-monorepo · Princípio II

A aposta do produto é **busca local**: alguém procura o próprio bairro e encontra o que mudou
na rua dele. Tudo abaixo existe para sustentar isso.

## Taxonomia geográfica de dois níveis

```text
Município (identidade = código IBGE)
└── Bairro (id = {municipioSlug}:{bairroSlug})
```

O bairro é **sempre qualificado pelo município**, e a rota reflete isso:
`/{municipio}/{bairro}`. Não é preferência de formato — "Centro" existe em Parnaíba e em
Luís Correia, e uma rota de nível único faria os dois competirem pelo mesmo endereço, com o
segundo sobrescrevendo o primeiro em silêncio (ADR 0005).

**Todo conteúdo tem município primário obrigatório** (FR-021). Bairro é opcional: nem todo
fato pertence a um bairro. O tipo impede compilar conteúdo sem município.

## O registro é a fonte única

`packages/api-client/src/data/municipalities.ts`. Dele saem, sem que ninguém escreva a lista
de novo: os hubs de município, as páginas de bairro, `sitemap-places.xml`, os feeds RSS por
município e o índice de telas. Acrescentar um município é editar esse arquivo — e nada mais
(SC-010).

`apps/web/scripts/validate-slug-registry.ts` roda no `prebuild` e **reprova a construção** se
um slug de município colidir com uma rota reservada, nomeando o slug e a rota (SC-009).

## Declaração por superfície

`contracts/routes.md` declara, tela por tela: schema JSON-LD, canônica, entrada de sitemap e
vínculo geográfico. `tests/seo/public-pages.test.ts` lê o **`dist/`** e cobra cada coluna.

Ler o `dist/` e não o servidor de desenvolvimento é o ponto: é o HTML publicado que o
rastreador lê. Meta escrita por script passaria num teste de navegador e chegaria vazia ao
arquivo entregue.

## Canônicas

Sempre **absolutas**. Relativa é ignorada por parte dos rastreadores e, quando o conteúdo é
copiado por um agregador, passa a apontar para o domínio dele — entregando a autoridade da
página. `og:url` é sempre igual à canônica.

## Schemas por tipo

| Superfície | JSON-LD                                                                        |
| ---------- | ------------------------------------------------------------------------------ |
| Home       | `WebSite` (+`SearchAction`) e `Organization`                                   |
| Notícia    | `NewsArticle` + `BreadcrumbList`, com `contentLocation` → `Place` do município |
| Editoria   | `CollectionPage` + `BreadcrumbList`                                            |
| Município  | `Place` (com código IBGE e coordenadas) + `CollectionPage`                     |
| Bairro     | `Place` com `containedInPlace` → município                                     |
| Eventos    | `ItemList` de `Event`, com `startDate`, `location` e `offers`                  |
| Empresas   | `ItemList` de `LocalBusiness`                                                  |
| Autor      | `ProfilePage` + `Person`                                                       |

Tudo num único `<script>` com `@graph`, para que os nós se referenciem por `@id` — evita
repetir a organização inteira dentro de cada matéria.

`contentLocation` é a peça central: é ela que liga cada texto a um lugar. Sem ela o conteúdo é
mais uma notícia; com ela, é notícia **de um lugar**.

## Descoberta gerada, nunca mantida à mão

| Recurso                | Regra                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| `robots.txt`           | `Disallow` de `/busca` e `/componentes`; aponta o índice de sitemaps |
| `sitemap-index.xml`    | referencia os seis abaixo                                            |
| `sitemap-core.xml`     | superfícies fixas                                                    |
| `sitemap-articles.xml` | todo o acervo + páginas de autor                                     |
| `sitemap-sections.xml` | uma entrada por editoria                                             |
| `sitemap-places.xml`   | todo município e todo bairro do registro                             |
| `sitemap-news.xml`     | **últimas 48 h, ≤ 1000 URLs** — limites do Google, não escolha nossa |
| `sitemap-images.xml`   | uma entrada por `MediaRef` de conteúdo                               |
| `rss/{editoria}.xml`   | uma por editoria                                                     |
| `rss/{municipio}.xml`  | uma por entrada do registro                                          |

Os limites do news sitemap moram no código, e não em disciplina editorial: desrespeitá-los
não gera aviso — o arquivo passa a ser ignorado por inteiro.

## O que fica fora do índice

`/busca` é `noindex,follow` — conteúdo duplicado por definição, mas os links continuam
levando descoberta às matérias. `/componentes` é `noindex,nofollow` e fora de todo sitemap.
O painel inteiro é `noindex,nofollow` com `Disallow: /` próprio.
