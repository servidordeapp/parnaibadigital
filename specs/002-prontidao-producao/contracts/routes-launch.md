# Contrato de superfícies — mudanças do lançamento

**Base**: [`specs/001-…/contracts/routes.md`](../../001-fundacao-prototipo-monorepo/contracts/routes.md).
Só estão listadas as **diferenças**. O Princípio II exige que toda página nova declare tipo de
schema, canônica, entrada em sitemap e vínculo geográfico — a tabela abaixo é essa declaração.

## Superfícies novas (públicas)

| Rota | Renderização | Canônica | Schema | Sitemap | Vínculo geográfico | Indexável |
| --- | --- | --- | --- | --- | --- | :-: |
| `/expediente` | `prerender` | absoluta | `AboutPage` + `Organization` (com `publishingPrinciples`) + `BreadcrumbList` | `sitemap-core.xml` | — (institucional) | sim |
| `/privacidade` | `prerender` | absoluta | `WebPage` + `BreadcrumbList` | `sitemap-core.xml` | — | sim |
| `/newsletter/obrigado` | SSR (sem cache) | self | — | **não** | — | **não** (`noindex`) |
| `/newsletter/confirmar` | SSR (sem cache) | self | — | **não** | — | **não** |
| `/newsletter/cancelar` | SSR (sem cache) | self | — | **não** | — | **não** |
| (resposta `410`) matéria despublicada | SSR | — | — | removida | — | **não** (`noindex`) |

Rotas novas entram na lista de **reservadas** (`apps/web/scripts/validate-slug-registry.ts`):
`expediente`, `privacidade`. `r` (redirecionador de anúncio) é servido pela API, não pelo Astro.

## Superfícies alteradas

| Rota | Mudança | Requisito |
| --- | --- | --- |
| **Todas as 13 públicas** | rodapé ganha links para `/expediente` e `/privacidade` (um componente em `packages/ui`) | FR-033/034 · SC-015 |
| `/` · `/{municipio}` · `/editoria/*` · `/autor/*` · `/busca` · feeds · sitemaps | estado **vazio íntegro** (sem lacunas, sem preenchimento) | FR-023 · SC-019 |
| `/noticia/{slug}` | resolve redirecionamento antes do 404; `410` quando despublicada; sem `commentCount`/`views` | FR-020 · D2-06 · D2-25 |
| `/newsletter` | remove campo WhatsApp; texto de consentimento versionado; `POST` nativo | FR-035 · D2-23 |
| `/busca` | `GET` nativo contra a API; `noindex,follow` em resultados; canônica sem `q` | FR-037 · Princípio II |
| `/anuncie` | formulário passa a enviar contato real **ou** vira texto + e-mail comercial (decidir na tarefa; não pode ser fachada) | P-11 |
| `/utilidade-publica`, `/empresas`, `/eventos` | **auditar** origem de dado: sem fonte real no lançamento ⇒ retidas como `/diario-oficial` (D2-26) ou alimentadas por dado real | FR-002 |

> **Nota de auditoria a resolver em tarefa**: `/empresas`, `/eventos` e `/utilidade-publica`
> exibem dados **demonstrativos** (6 empresas, 6 eventos, 4 grupos de utilidade) cuja origem real
> **não está nas US1–US7**. FR-002 proíbe exibi-los. O plano trata como: *retidas no lançamento*
> (mesmo mecanismo de D2-26) **a menos que** a redação forneça dado real antes do lançamento.
> Isto é uma consequência de FR-002 não enumerada no spec — sinalizada ao usuário.

## Retida no lançamento (nenhum endereço publicado)

| Superfície | Estado | Verificação |
| --- | --- | --- |
| `/diario-oficial` (e `/diario-oficial/{id}`) | arquivo em `apps/web/src/deferred/`; fora de nav, sitemap, feed, `robots` | SC-021: 404 + ausência |

## Painel administrativo — 11 superfícies

Toda rota exige sessão válida **verificada no servidor** (middleware consulta
`GET /api/v1/admin/session` antes de ler qualquer dado). Papel administrativo sem 2FA só alcança as
duas rotas novas abaixo.

| Rota | Mudança |
| --- | --- |
| `/entrar` *(nova)* | login (formulário nativo `POST`) |
| `/seguranca/segundo-fator` *(nova)* | cadastro/confirmação do TOTP + recovery codes |
| `/` Dashboard | números **medidos** ou estado vazio |
| `/noticias`, `/noticias/{id}/editar` | CRUD real + transições + versões + `If-Match` |
| `/usuarios` | contas, papéis, redefinição de 2FA |
| `/publicidade` | campanhas reais |
| `/analytics` | `daily_metrics` ou estado vazio |
| `/diario-oficial`, `/pipeline` | **estado vazio** explicando "capacidade ainda não ativa" (FR-044) |
| `/configuracoes`, `/seo`, `/integracoes` | **auditar**: valor sem origem real ⇒ `EmptyState`; nunca número inventado (SC-022) |

Todas continuam `noindex,nofollow`, `Disallow: /`, sem sitemap.
