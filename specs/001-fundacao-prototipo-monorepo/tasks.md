---

description: "Task list — Fundação do Produto: Protótipo Navegável, Design System e Monorepo"
---

# Tasks: Fundação do Produto — Protótipo Navegável, Design System e Monorepo

**Input**: Design documents from `/specs/001-fundacao-prototipo-monorepo/`

**Prerequisites**: [plan.md](./plan.md) · [spec.md](./spec.md) · [research.md](./research.md) ·
[data-model.md](./data-model.md) · [contracts/](./contracts/) · [quickstart.md](./quickstart.md)

**Tests**: **OBRIGATÓRIOS**, não opcionais. O template upstream diz "Tests are OPTIONAL", mas o
Princípio IX da Constituição v2.0.0 torna obrigatórios os testes de domínio, de contrato e as
asserções de SEO/performance — e o `TODO(TASKS_TEMPLATE_TESTS)` da própria Constituição manda
este comando emiti-los de qualquer forma. Componentes visuais derivados do protótipo não exigem
TDD, mas exigem teste de acessibilidade e cobertura dos dois temas.

**Organization**: tarefas agrupadas por user story, para implementação e validação independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 (portal público), US2 (admin), US3 (base reutilizável), US4 (documentação/backend)
- Todo caminho de arquivo é relativo à raiz do repositório

## Path Conventions

Monorepo pnpm (plan.md → Project Structure): `apps/web/`, `apps/admin/`, `packages/{design-system,ui,types,api-client,validation}/`,
`backend/api/` (Laravel preservado), `docs/`, `infrastructure/`, `scripts/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: esqueleto do monorepo e ferramental. Nada de produto ainda.

- [ ] T001 Criar `pnpm-workspace.yaml` declarando `apps/*` e `packages/*`, e `package.json` raiz com `packageManager: pnpm@11`, `engines.node: ">=24"` e os scripts agregadores (`lint`, `typecheck`, `test`, `build`, `verify`) — D-01
- [ ] T002 [P] Criar `.nvmrc` com `24` e `.gitignore` raiz (node_modules, dist, .astro, .lighthouseci, playwright-report, vendor de PHP)
- [ ] T003 [P] Criar `tsconfig.base.json` na raiz com `strict: true`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` e paths para `@parnaibadigital/*`
- [ ] T004 [P] Configurar ESLint 9 flat config em `eslint.config.js` com `typescript-eslint`, `eslint-plugin-astro` e `eslint-plugin-jsx-a11y` — D-18
- [ ] T005 [P] Configurar Prettier em `.prettierrc` com `prettier-plugin-astro` e `.prettierignore` excluindo `packages/design-system/vendor/**`
- [ ] T006 [P] Configurar Stylelint em `.stylelintrc.json` com `stylelint-declaration-strict-value` para cor, espaçamento, raio, sombra, tipografia e duração — D-17
- [ ] T007 [P] Criar os diretórios vazios com `.gitkeep`: `docs/decisions/`, `infrastructure/`, `scripts/`, `.github/workflows/`
- [ ] T008 Criar `packages/{design-system,ui,types,api-client,validation}/package.json` com nomes `@parnaibadigital/*`, `type: module` e `exports` — exatamente cinco pacotes (FR-019, FR-027)
- [ ] T009 Inicializar `apps/web` com Astro 5 (`output: 'static'`, `site: https://parnaibadigital.com.br`) e `@tailwindcss/vite` em `apps/web/astro.config.mjs` — D-02, D-04
- [ ] T010 Inicializar `apps/admin` com a mesma stack em `apps/admin/astro.config.mjs`, porta 4322, `site` do subdomínio de admin — D-03
- [ ] T011 [P] Configurar Vitest em `vitest.config.ts` (ambiente node, projetos por pacote) e Playwright em `playwright.config.ts` com os projetos `chromium-360`, `chromium-1280` e `no-js` (`javaScriptEnabled: false`) — D-19
- [ ] T012 [P] Elevar `"php"` de `^8.3` para `^8.4` em `backend/api/composer.json` e rodar `composer update --lock` — D-22

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Design System importado, tokens, tipos, contratos e dados. Nenhuma user story pode
começar antes disto.

**⚠️ CRÍTICO**: bloqueia US1, US2, US3 e US4.

### Importação e preservação do Design System (FR-001, SC-017)

- [ ] T013 Importar, via MCP `DesignSync` (`get_file`, projeto `219a9ccf-dc49-489d-a5fb-7ebb3da9f8a9`), os 11 arquivos do DS para `packages/design-system/vendor/parna-badigital-design-system-fe257784-b721-4adc-b4cd-6b322b375c04/`: `styles.css`, `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`, `readme.md` e `tokens/{base,colors,elevation,fonts,motion,spacing,typography}.css` — **sem editar uma linha**
- [ ] T014 Importar `ParnaibaDigital.dc.html` e `support.js` para `packages/design-system/vendor/prototype/` como referência visual versionada (fonte de verdade de FR-002; não é servido nem empacotado)
- [ ] T015 Gerar `packages/design-system/MANIFEST.sha256` com o hash de todo `vendor/**` e escrever `scripts/check-ds-integrity.ts` que recalcula e reprova divergência — SC-017, cenário V13
- [ ] T016 [P] Escrever teste em `packages/design-system/tests/integrity.test.ts` que executa a verificação de integridade e falha se algum arquivo vendorizado divergir

### Camada de tokens (FR-003, FR-004, D-04, D-06)

- [ ] T017 Criar `packages/design-system/src/index.css` importando os 7 arquivos de token vendorizados (exceto `fonts.css`, substituído em T019) e declarando o bloco `@theme inline` que **referencia** as variáveis do DS sem copiar valor
- [ ] T018 Extrair do protótipo (`vendor/prototype/ParnaibaDigital.dc.html`) as redefinições escuras dos **aliases semânticos** e escrever `packages/design-system/src/theme/dark.css` sob `[data-theme="dark"]` e `@media (prefers-color-scheme: dark)` guardado por `:root:not([data-theme="light"])` — **nunca redefinir rampas `--pd-*`**; cada literal com `stylelint-disable` justificado — D-07
- [ ] T019 [P] Criar `packages/design-system/src/theme/fonts-local.css` com `@fontsource-variable/archivo`, `@fontsource-variable/source-sans-3` e `@fontsource/ibm-plex-mono` (subset `latin` + `latin-ext`, `font-display: swap`), redeclarando `--font-display`, `--font-body` e `--font-mono` — FR-034, D-08
- [ ] T020 [P] Criar `packages/design-system/src/theme/icons.css` e o vocabulário fixo de ícones Lucide em `packages/design-system/src/icons/manifest.ts`, listando os ~20 glifos declarados pelo `readme.md` do DS — D-09
- [ ] T021 Escrever `scripts/check-tokens.ts` que varre `.astro`/`.ts`/`.css` procurando hex, `rgb()`, `hsl()` e literais `px` (inclusive em classes utilitárias arbitrárias do Tailwind) e reporta **arquivo, linha e o token que deveria ter sido usado** — FR-004, D-17
- [ ] T022 [P] Escrever teste em `scripts/tests/check-tokens.test.ts` que injeta `color: #123456` num arquivo temporário e confirma saída não-zero com o token sugerido — cenário V4

### Contratos e tipos (FR-023, FR-024, D-10)

- [ ] T023 Configurar `openapi-typescript` e o script `types:generate` que lê `specs/001-fundacao-prototipo-monorepo/contracts/openapi-v1.yaml` e escreve `packages/types/src/generated/api-v1.ts` (saída versionada)
- [ ] T024 Criar `packages/types/src/index.ts` reexportando os aliases de domínio (`News`, `NewsSummary`, `Municipality`, `Neighborhood`, `Category`, `Author`, `OfficialGazetteDocument`, `Event`, `Company`, `UtilityItem`, `AdSlot`, `PipelineStage`, `AnalyticsMetric`, `User`) a partir do arquivo gerado
- [ ] T025 [P] Escrever teste de contrato em `packages/types/tests/generated-in-sync.test.ts` que regenera os tipos e falha se `git diff` acusar divergência — cenário V11
- [ ] T026 [P] Escrever teste de contrato em `packages/types/tests/geo-required.test.ts` que prova, por `@ts-expect-error`, que omitir `municipalityIbgeCode` em `News` impede a compilação — User Story 3, cenário 3

### Validação (FR-021, D-11)

- [ ] T027 Criar schemas Zod em `packages/validation/src/schemas/` espelhando os schemas do OpenAPI (news, geo, gazette, events, companies, utilities)
- [ ] T028 Implementar as 7 regras transversais de `data-model.md` em `packages/validation/src/rules.ts`: município existente, bairro pertencente ao município, `curated` ⇒ `attribution`, `sourceRef` presente, `MediaRef` com `alt`/`width`/`height`, slugs únicos por escopo, falha reprova a construção
- [ ] T029 [P] Escrever testes das regras em `packages/validation/tests/rules.test.ts`, um caso negativo por regra (TDD: escrever antes de T028 passar)

### Registro de slugs e cliente de dados (FR-022, FR-025, D-12, D-13)

- [ ] T030 Criar o registro canônico em `packages/api-client/src/data/municipalities.ts` com os 5 municípios e seus códigos IBGE (Parnaíba 2207702, Luís Correia 2205805, Ilha Grande 2204550, Buriti dos Lopes 2202101, Cajueiro da Praia 2202174) e a lista de rotas reservadas de `contracts/routes.md`
- [ ] T031 Escrever `apps/web/scripts/validate-slug-registry.ts`, ligá-lo ao `prebuild` de `apps/web` e `apps/admin`, e fazer a colisão reprovar a construção nomeando slug e rota conflitante — SC-009
- [ ] T032 [P] Escrever teste em `packages/api-client/tests/slug-registry.test.ts` que introduz o slug `eventos` e espera reprovação com a mensagem de conflito — cenário V8 (TDD)
- [ ] T033 Definir as portas em `packages/api-client/src/ports/` (`NewsRepository`, `GeoRepository`, `GazetteRepository`, `EventRepository`, `CompanyRepository`, `UtilityRepository`, `SearchRepository`, `AuthorRepository`), tipadas por `@parnaibadigital/types`
- [ ] T034 Implementar `packages/api-client/src/transports/mock.ts` (lê `src/mock/data/`) e `packages/api-client/src/transports/http.ts` (stub sem chamada real), com seleção única por `PD_DATA_TRANSPORT` em `packages/api-client/src/index.ts` — SC-011
- [ ] T035 [P] Escrever teste em `packages/api-client/tests/transport-swap.test.ts` que prova que trocar o transporte não altera a assinatura consumida pelas telas — cenário V10
- [ ] T036 Escrever `packages/api-client/scripts/validate-mocks.ts` (`validate:mocks`) que valida todos os dados demonstrativos contra os schemas de `@parnaibadigital/validation` na construção — cenário V11

### Componentes compartilhados pelas duas aplicações (FR-006, SC-012)

- [ ] T037 [P] Implementar os 10 componentes `core` em `packages/ui/src/core/`: `Button.astro`, `IconButton.astro`, `Icon.astro` (SVG inlinado de `lucide-static`), `Input.astro`, `Select.astro`, `Checkbox.astro`, `Tag.astro`, `Badge.astro`, `Card.astro`, `PhotoFrame.astro` — todos os estados do DS, zero literal
- [ ] T038 [P] Implementar `packages/ui/src/brand/Wordmark.astro` (Archivo 800, "Digital" em `--pd-sun-500`, sem arquivo de logo — Assumption 9)
- [ ] T039 [P] Implementar `packages/ui/src/feedback/Skeleton.astro` com anúncio a tecnologia assistiva (`aria-busy`) — adição justificada, consumida por US1 e US2
- [ ] T040 [P] Implementar `packages/ui/src/navigation/{Breadcrumb,Tabs,Pagination}.astro` — usados pelas duas aplicações; paginação por `<a href>` real (Princípio XI)
- [ ] T041 Criar `packages/ui/src/index.ts` com o barril de exportação e `packages/ui/tests/props.test.ts` verificando que nenhum componente exporta `any`

### Tema, layout base e ferramenta de verificação (FR-009, FR-014)

- [ ] T042 Criar o script inline anti-flash de tema em `packages/ui/src/theme/theme-init.ts` (lê `localStorage`, cai para `prefers-color-scheme`, escreve `data-theme` no `<html>` antes da primeira pintura) e o alternador em `packages/ui/src/theme/theme-toggle.ts` — D-07
- [ ] T043 [P] Criar `apps/web/src/layouts/BaseLayout.astro` e `apps/admin/src/layouts/AdminLayout.astro` importando `@parnaibadigital/design-system` e injetando T042
- [ ] T044 [P] Criar o helper de a11y `tests/helpers/axe.ts` com a asserção axe-core reutilizável por superfície e por tema — D-19
- [ ] T045 Criar `.github/workflows/verify.yml` com os 8 portões da Constituição na ordem do `pnpm verify` de `quickstart.md`, incluindo os três comandos PHP

**Checkpoint**: DS preservado e verificável, tokens em fonte única, tipos gerados do contrato,
dados validados, componentes compartilhados prontos. As user stories podem começar em paralelo.

---

## Phase 3: User Story 1 — Leitor percorre o portal público reproduzido (Priority: P1) 🎯 MVP

**Goal**: as 14 superfícies públicas do protótipo reproduzidas fielmente, navegáveis, nos dois
temas, em 360px e 1280px, com conteúdo presente sem JavaScript.

**Independent Test**: percorrer as 14 telas lado a lado com o protótipo em ambas as larguras e
ambos os temas, com e sem JavaScript, confirmando paridade visual e de navegação.

### Testes de US1 (escrever primeiro; devem falhar antes da implementação)

- [ ] T046 [P] [US1] Teste de superfícies em `tests/e2e/public-surfaces.spec.ts` (`@surfaces`): as 14 rotas de `contracts/routes.md` respondem 200 com endereço próprio; endereço inexistente responde **404 real** — SC-001
- [ ] T047 [P] [US1] Teste de temas e larguras em `tests/e2e/public-themes.spec.ts` (`@themes`): 360px e 1280px, claro e escuro, contraste ≥ 4,5:1, persistência da escolha entre telas — SC-002
- [ ] T048 [P] [US1] Teste sem JavaScript em `tests/e2e/no-js.spec.ts` (projeto `no-js`): título, subtítulo, corpo, data, autor, vínculo de bairro e município, selo de curadoria e rodapé de atribuição presentes no HTML; navegação, busca, paginação e newsletter operáveis — SC-007
- [ ] T049 [P] [US1] Teste de SEO em `tests/seo/public-pages.test.ts` sobre o `dist/`: canônica absoluta, OG e Twitter Cards completos, JSON-LD válido para o tipo declarado por superfície, vínculo geográfico presente — SC-008
- [ ] T050 [P] [US1] Teste de acessibilidade em `tests/a11y/public.spec.ts`: axe-core em cada uma das 14 superfícies, nos dois temas, zero violações WCAG 2.1 AA — SC-004
- [ ] T051 [P] [US1] Teste de slots de anúncio em `tests/e2e/ads-layout.spec.ts`: altura reservada e rotulada antes do carregamento, nenhum deslocamento de conteúdo editorial, ≤ 3 slots acima da dobra, nunca dois consecutivos sem conteúdo entre eles — FR-032

### Dados demonstrativos de US1 (FR-016)

- [ ] T052 [P] [US1] Criar `packages/api-client/src/mock/data/news.ts` com os 12 artigos do protótipo (manchete `[Bairro] + [fato]`, tom, selo de curadoria, atribuição quando `curated`, município primário obrigatório)
- [ ] T053 [P] [US1] Criar `packages/api-client/src/mock/data/geo.ts` com os 9 bairros qualificados por município (`id = {municipio}:{bairro}`)
- [ ] T054 [P] [US1] Criar `packages/api-client/src/mock/data/categories.ts` com as 12 editorias e `authors.ts` com os autores, incluindo "Redação ParnaíbaDigital"
- [ ] T055 [P] [US1] Criar `packages/api-client/src/mock/data/{events,companies,utilities,gazette}.ts` com 6 eventos, 6 empresas, os 4 grupos de utilidade pública e os 6 documentos oficiais — **2 documentos sem matéria associada** (edge case)

### Componentes editoriais e de navegação de US1 (FR-006, FR-007)

- [ ] T056 [P] [US1] Implementar `packages/ui/src/news/{HeroStory,NewsCard,NewsListItem}.astro` com hover do DS (`--shadow-2`, `translateY(-1px)`, fundo `--pd-blue-50`, título em azul 700)
- [ ] T057 [P] [US1] Implementar `packages/ui/src/news/{NeighborhoodTagBar,SectionHeading}.astro` (régua de 4px cor-de-sol na abertura de seção)
- [ ] T058 [P] [US1] Implementar `packages/ui/src/news/{CurationStamp,RegionalContextBox,AttributionFooter,ShareBar}.astro` — `AttributionFooter` renderiza "Informações originais publicadas por [Veículo]" com link à fonte (FR-018, Princípio V)
- [ ] T059 [P] [US1] Implementar `packages/ui/src/navigation/{SiteHeader,WeatherStrip,SiteFooter}.astro` — header sticky de 64px sobre barra de data de 28px, sublinhado de 3px cor-de-sol na seção ativa, rodapé com o aviso de curadoria automatizada
- [ ] T060 [P] [US1] Implementar `packages/ui/src/widgets/{WidgetCard,PharmacyList,JobList,EventList}.astro` na superfície `--surface-utility` (terciária mar/Delta)
- [ ] T061 [P] [US1] Implementar `packages/ui/src/tourism/{LodgingCard,DestinationCard,LodgingList}.astro`
- [ ] T062 [P] [US1] Implementar `packages/ui/src/ads/AdSlot.astro` com altura fixa vinda dos tokens `--ad-*`, rótulo `[Anúncio AdSense]`, cinza frio `--pd-ad-*` distinto do editorial **também no tema escuro** (edge case) — sem rede real (FR-038)
- [ ] T063 [US1] Implementar `packages/ui/src/overlay/CommandPalette.astro` + `command-palette.ts` (`Ctrl/Cmd+K` abre, `Esc` fecha, foco preso, lista de destinos como `<a href>` reais) — adição justificada
- [ ] T064 [US1] Implementar `packages/ui/src/overlay/NavDrawer.astro` + `nav-drawer.ts` para a virada de coluna única abaixo de 900px, funcional por `<details>`/âncora quando não há JavaScript — FR-010

### Superfícies públicas (FR-011)

- [ ] T065 [US1] Implementar a home em `apps/web/src/pages/index.astro`: manchete, bloco geolocalizado de bairros, grid/lista, sidebar de serviços e as 4 zonas de anúncio, com a sidebar migrando para depois do 6º card abaixo de 900px
- [ ] T066 [US1] Implementar a notícia em `apps/web/src/pages/noticia/[slug].astro`: corpo por `ContentBlock`, contexto regional, selo de curadoria, rodapé de atribuição, `ShareBar`, anúncio in-article após o 2º parágrafo; renderiza corretamente **sem bairro** (edge case)
- [ ] T067 [P] [US1] Implementar a editoria em `apps/web/src/pages/editoria/[slug].astro` com filtro e paginação por link real
- [ ] T068 [P] [US1] Implementar o hub de município em `apps/web/src/pages/[municipio]/index.astro` via `getStaticPaths()` **lido do registro** — nenhuma rota codificada por município (SC-010)
- [ ] T069 [P] [US1] Implementar o bairro em `apps/web/src/pages/[municipio]/[bairro].astro`, sempre qualificado pelo município (edge case de homônimo)
- [ ] T070 [P] [US1] Implementar a busca em `apps/web/src/pages/busca.astro` por `GET` HTML nativo, com estado vazio anunciado a tecnologia assistiva; `noindex,follow`
- [ ] T071 [P] [US1] Implementar eventos em `apps/web/src/pages/eventos.astro`
- [ ] T072 [P] [US1] Implementar utilidade pública em `apps/web/src/pages/utilidade-publica.astro` com abas dos 4 grupos e estado vazio por grupo
- [ ] T073 [P] [US1] Implementar Diário Oficial em `apps/web/src/pages/diario-oficial.astro`, representando documento **sem** matéria associada sem inventar vínculo
- [ ] T074 [P] [US1] Implementar empresas em `apps/web/src/pages/empresas.astro`
- [ ] T075 [P] [US1] Implementar anunciante em `apps/web/src/pages/anuncie.astro`
- [ ] T076 [P] [US1] Implementar autor em `apps/web/src/pages/autor/[slug].astro`
- [ ] T077 [P] [US1] Implementar newsletter em `apps/web/src/pages/newsletter.astro` com `POST` HTML nativo (e-mail e WhatsApp), **sem envio real** (FR-038)
- [ ] T078 [P] [US1] Implementar a tela de erro em `apps/web/src/pages/404.astro` com **status 404 real** e navegação de retorno

### Fundação de SEO de US1 (FR-028 a FR-031, D-20)

- [ ] T079 [US1] Implementar `apps/web/src/lib/seo/structured-data.ts` e o componente `StructuredData.astro`, emitindo por tipo de página: `NewsArticle` (com `contentLocation` → `Place` do município), `Organization`, `WebSite` + `SearchAction`, `BreadcrumbList`, `Place`, `Event`
- [ ] T080 [US1] Implementar `apps/web/src/lib/seo/meta.ts` (canônica absoluta, Open Graph, Twitter Cards) e ligá-lo ao `BaseLayout`
- [ ] T081 [P] [US1] Implementar `apps/web/src/pages/robots.txt.ts` com `Disallow` de `/busca` e `/componentes`
- [ ] T082 [P] [US1] Implementar `apps/web/src/pages/sitemap-index.xml.ts` e os sitemaps por seção `sitemap-{core,articles,sections,places}.xml.ts`
- [ ] T083 [P] [US1] Implementar `apps/web/src/pages/sitemap-news.xml.ts` (últimas 48 h, ≤ 1000 URLs) e `sitemap-images.xml.ts`
- [ ] T084 [P] [US1] Implementar `apps/web/src/pages/rss/[secao].xml.ts` e `rss/[municipio].xml.ts` com `@astrojs/rss`, ambos derivados dos dados — nunca listas codificadas
- [ ] T085 [US1] Implementar o pipeline de imagem em `apps/web/src/lib/media.ts`: AVIF com alternativa WebP, `width`/`height` explícitos, `loading="lazy"` fora da dobra, `fetchpriority="high"` só no LCP; ausência de foto cai para `PhotoFrame` sem quebrar proporção (edge case)
- [ ] T086 [US1] Aplicar `prefers-reduced-motion` em `packages/ui/src/theme/motion.css`, suprimindo o `scale` do hero e as transições de card sem quebrar leitura de estado (edge case)

**Checkpoint**: portal público completo e demonstrável isoladamente. É o MVP — publicável em
homologação e mensurável contra os orçamentos.

---

## Phase 4: User Story 2 — Equipe editorial percorre o painel reproduzido (Priority: P2)

**Goal**: as 11 superfícies administrativas do protótipo reproduzidas sobre dados demonstrativos,
com abas, contadores, filtros e o pipeline animado como na origem.

**Independent Test**: percorrer as 11 telas pela navegação lateral comparando com o protótipo, e
confirmar abas, badges de contagem, filtros e animação do pipeline.

### Testes de US2

- [ ] T087 [P] [US2] Teste de superfícies em `tests/e2e/admin-surfaces.spec.ts`: as 11 rotas respondem 200 e o item ativo da navegação lateral recebe fundo, cor e régua de 3px — User Story 2, cenário 1
- [ ] T088 [P] [US2] Teste do pipeline em `tests/e2e/admin-pipeline.spec.ts`: as 8 etapas avançam na ordem fixa e a etapa "Editor — revisão humana obrigatória" **nunca é pulada** — Princípio V
- [ ] T089 [P] [US2] Teste de tema escuro em `tests/e2e/admin-themes.spec.ts`: nenhuma tela do painel herda elemento do tema claro — FR-009
- [ ] T090 [P] [US2] Teste de acessibilidade em `tests/a11y/admin.spec.ts`: axe-core nas 11 superfícies, nos dois temas
- [ ] T091 [P] [US2] Teste de não-exposição em `tests/e2e/admin-noindex.spec.ts`: `noindex,nofollow` em toda página e `Disallow: /` no `robots.txt` do painel — User Story 2, cenário 5

### Dados e componentes de US2

- [ ] T092 [P] [US2] Criar `packages/api-client/src/mock/data/pipeline.ts` com as 8 etapas na ordem fixa (Documento encontrado → Análise → Resumo → Reescrita → SEO → Imagem → Editor → Publicado)
- [ ] T093 [P] [US2] Criar `packages/api-client/src/mock/data/{analytics,users}.ts` com as métricas do Dashboard/Analytics e os usuários com papel e situação — **sem autenticação** (FR-038)
- [ ] T094 [P] [US2] Implementar `packages/ui/src/data/DataTable.astro` com ordenação por link, badges de contagem e **estado vazio** anunciado — adição justificada
- [ ] T095 [P] [US2] Implementar `packages/ui/src/overlay/Toast.astro` + `toast.ts` (aviso temporário, `role="status"`, respeita `prefers-reduced-motion`) — adição justificada
- [ ] T096 [US2] Implementar a navegação lateral em `packages/ui/src/navigation/AdminSidebar.astro` com o realce de item ativo do protótipo

### Superfícies administrativas (FR-012)

- [ ] T097 [P] [US2] Dashboard em `apps/admin/src/pages/index.astro`
- [ ] T098 [P] [US2] Notícias em `apps/admin/src/pages/noticias/index.astro` com `DataTable`, filtros e badges de contagem
- [ ] T099 [US2] Editor em `apps/admin/src/pages/noticias/[id]/editar.astro` — abas trocam sem recarregar a tela e **sem perder o estado das demais** (cenário 3); nenhuma persistência
- [ ] T100 [US2] Pipeline de IA em `apps/admin/src/pages/pipeline.astro` com a progressão animada na cadência do protótipo, suprimida sob `prefers-reduced-motion`
- [ ] T101 [P] [US2] Fila do Diário Oficial em `apps/admin/src/pages/diario-oficial.astro`, representando `fila_ia`, `em_revisao`, `publicado`, `arquivado` — **sem transição de `fila_ia` direto para `publicado`**
- [ ] T102 [P] [US2] Publicidade em `apps/admin/src/pages/publicidade.astro` (inventário de slots, sem rede real)
- [ ] T103 [P] [US2] Analytics em `apps/admin/src/pages/analytics.astro`
- [ ] T104 [P] [US2] SEO em `apps/admin/src/pages/seo.astro`
- [ ] T105 [P] [US2] Integrações em `apps/admin/src/pages/integracoes.astro` (fontes listadas, nenhuma conectada)
- [ ] T106 [P] [US2] Usuários em `apps/admin/src/pages/usuarios.astro`
- [ ] T107 [P] [US2] Configurações em `apps/admin/src/pages/configuracoes.astro`
- [ ] T108 [US2] Adicionar `apps/admin/src/pages/robots.txt.ts` com `Disallow: /` e `noindex,nofollow` no `AdminLayout`, mais o bloqueio de acesso documentado em `infrastructure/_headers`

**Checkpoint**: portal e painel funcionam independentemente, ambos sobre a mesma definição de
componente.

---

## Phase 5: User Story 3 — Desenvolvedor constrói tela nova sem reabrir decisões visuais (Priority: P2)

**Goal**: inventário navegável, verificação de literais ativa e tipos que impedem construir
conteúdo sem vínculo geográfico.

**Independent Test**: alguém que não participou desta fase monta uma tela usando só a
documentação, sem introduzir literal nem componente duplicado.

### Testes de US3

- [ ] T109 [P] [US3] Teste em `tests/e2e/inventory.spec.ts`: todo componente do inventário tem card renderizado, com variantes e estados, nos dois temas — FR-005
- [ ] T110 [P] [US3] Teste em `packages/ui/tests/no-duplicates.test.ts`: nenhum nome de componente tem duas definições entre `packages/ui`, `apps/web` e `apps/admin` — SC-012

### Implementação de US3

- [ ] T111 [US3] Implementar a galeria em `apps/web/src/pages/componentes/index.astro` + `[grupo].astro`, gerada a partir de `_ds_manifest.json` e do inventário, com busca por nome e por função — `noindex`, fora de todo sitemap (Assumption 4)
- [ ] T112 [US3] Renderizar em cada card os estados repouso, hover, press, foco, desabilitado e selecionado, e o alternador de tema local — FR-005
- [ ] T113 [P] [US3] Marcar no inventário as 5 adições (CommandPalette, NavDrawer, Toast, Skeleton, DataTable) com a justificativa de `contracts/component-inventory.md` — FR-007
- [ ] T114 [P] [US3] Ligar `check:tokens` e `check:ds-integrity` ao `pnpm verify` e ao workflow de CI, bloqueando merge — FR-035
- [ ] T115 [P] [US3] Escrever `docs/design-system.md`: como consumir tokens, como escolher componente, o que fazer quando não existe, e por que o original vendorizado nunca é editado

**Checkpoint**: a próxima feature parte de componentes existentes, não de HTML copiado.

---

## Phase 6: User Story 4 — Mantenedor entende e evolui a arquitetura pela documentação (Priority: P3)

**Goal**: backend organizado em módulos com fronteiras verificadas, e documentação que responde
onde uma regra nova mora sem abrir o código.

**Independent Test**: dar a documentação a alguém sem contexto e pedir que aponte o módulo e o
contrato de uma regra nova — sem ler código.

### Testes de US4

- [ ] T116 [P] [US4] Configurar `backend/api/deptrac.yaml` com as camadas `Domain`, `Application`, `Infrastructure`, `Http` e uma camada por módulo, proibindo referência a namespace interno de outro módulo — D-16
- [ ] T117 [P] [US4] Escrever teste de fronteira em `backend/api/tests/Architecture/ModuleBoundariesTest.php` (Pest) que falha quando um módulo referencia o interior de outro — cenário V12
- [ ] T118 [P] [US4] Configurar PHPStan/Larastan nível 8 em `backend/api/phpstan.neon` e adicionar os scripts `test`, `analyse` e `deptrac` ao `backend/api/composer.json`

### Estrutura modular do backend (FR-020, D-15)

- [ ] T119 [US4] Criar `backend/api/app/Domain/<Módulo>/` para os 14 módulos (News, Categories, Cities, Neighborhoods, Authors, Sources, OfficialGazette, Editorial, AI, Advertising, Analytics, Users, Media, Search), cada um com `Contract/` e `README.md` de fronteira — **sem model persistido, sem migração** (FR-038)
- [ ] T120 [P] [US4] Criar `backend/api/app/Application/<Módulo>/` e `backend/api/app/Infrastructure/<Módulo>/` com os diretórios de caso de uso e adaptador
- [ ] T121 [P] [US4] Declarar as portas de extensão de ingestão em `backend/api/app/Domain/Sources/Contract/`: `Source`, `Connector`, `IngestionJob`, `RawDocument`, `NormalizedContent`, `EditorialDraft` — interfaces apenas, nenhum coletor
- [ ] T122 [P] [US4] Declarar a porta `SearchEngine` em `backend/api/app/Domain/Search/Contract/SearchEngine.php` — **sem implementação** de Meilisearch nesta fase (D-14)
- [ ] T123 [P] [US4] Declarar a porta de storage em `backend/api/app/Domain/Media/Contract/MediaStorage.php`, sem SDK de fornecedor
- [ ] T124 [US4] Confirmar que `backend/api/routes/api.php` **não ganha nenhuma rota de recurso** e adicionar teste que reprova a introdução de endpoint nesta fase — SC-015

### Documentação e ADRs (FR-036, FR-037)

- [ ] T125 [P] [US4] Escrever `docs/architecture.md` (monorepo, fronteiras, fluxo de dados, o que é e o que não é desta fase)
- [ ] T126 [P] [US4] Escrever `docs/frontend.md` (Astro estático, ilhas em TS puro, orçamento de JS, progressive enhancement)
- [ ] T127 [P] [US4] Escrever `docs/backend.md` (monólito modular, camadas, regra de dependência, onde uma regra nova mora)
- [ ] T128 [P] [US4] Escrever `docs/seo.md` (taxonomia geográfica, canônicas, schemas por tipo, sitemaps e feeds gerados)
- [ ] T129 [P] [US4] Escrever `docs/performance.md` (orçamentos, como medir, o que reprova o build)
- [ ] T130 [P] [US4] Escrever `docs/editorial-pipeline.md` (as 8 etapas, por que a revisão humana não é pulável)
- [ ] T131 [P] [US4] Escrever `docs/ingestion.md` (Source/Connector/IngestionJob e como adicionar uma fonte sem alterar o núcleo) — cenário 2 de US4
- [ ] T132 [P] [US4] Escrever `docs/infrastructure.md` e criar `infrastructure/docker-compose.dev.yml` (PostgreSQL, Redis, RabbitMQ, Meilisearch), `infrastructure/_headers` e `.env.example` por aplicação — não executados em CI (D-23)
- [ ] T133 [P] [US4] ADR `docs/decisions/0001-backend-permanece-em-backend-api.md` — problema, alternativas rejeitadas, critério de reversão
- [ ] T134 [P] [US4] ADR `docs/decisions/0002-organizacao-modular-do-dominio.md`
- [ ] T135 [P] [US4] ADR `docs/decisions/0003-fonte-unica-de-tokens.md` (inclui a exceção confinada de `dark.css`)
- [ ] T136 [P] [US4] ADR `docs/decisions/0004-estrategia-de-dados-demonstrativos.md`
- [ ] T137 [P] [US4] ADR `docs/decisions/0005-taxonomia-geografica-de-dois-niveis.md`
- [ ] T138 [P] [US4] ADR `docs/decisions/0006-motor-de-busca-meilisearch.md` — decisão exigida pela Constituição ao `/speckit.plan` (D-14)
- [ ] T139 [P] [US4] ADR `docs/decisions/0007-substituicoes-do-design-system.md` (fontes auto-hospedadas, ícones inlinados, tema escuro extraído — D-07, D-08, D-09)
- [ ] T140 [US4] Escrever teste em `tests/docs/coverage.test.ts` que verifica a existência das nove áreas de documentação e das ADRs exigidas por FR-037 — SC-014

**Checkpoint**: a próxima feature não reabre decisão já tomada.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T141 Configurar Lighthouse CI em `lighthouserc.json` sobre o build estático (móvel, 4G) com os orçamentos: ≥ 95 nas 4 categorias, LCP < 2,0 s, CLS < 0,05, INP < 200 ms — SC-005
- [ ] T142 Configurar o orçamento de bundle em `apps/web/scripts/check-js-budget.ts`, reprovando página com mais de 50 KB de JS comprimido — SC-006
- [ ] T143 [P] Rodar a revisão visual lado a lado das 25 superfícies contra `vendor/prototype/ParnaibaDigital.dc.html` em 360px e 1280px, nos dois temas, e registrar em `specs/001-fundacao-prototipo-monorepo/visual-review.md` cada desvio com aprovação explícita — SC-002
- [ ] T144 [P] Verificar a ausência dos 10 itens de FR-038 no código entregue e registrar o resultado — SC-016
- [ ] T145 [P] Verificar que todo rótulo e todo conteúdo demonstrativo está em pt-BR, sem emoji e usando só o vocabulário de ícones do DS — FR-017
- [ ] T146 [P] Adicionar teste de degradação de terceiro em `tests/e2e/third-party-failure.spec.ts`: com fonte e ícone indisponíveis, o conteúdo permanece legível e nenhum botão fica sem rótulo acessível (edge case)
- [ ] T147 [P] Substituir o `README.md` placeholder da raiz por um índice do monorepo, dos comandos e dos portões
- [ ] T148 Devolver ao projeto de design, por `DesignSync`, o bloco de tema escuro e as 5 adições de componente, para que a próxima reimportação os traga — pendências de D-07 e do inventário
- [ ] T149 Executar `quickstart.md` de ponta a ponta (V1–V13) e registrar o resultado de cada cenário
- [ ] T150 Rodar `pnpm verify` mais os três comandos PHP e confirmar os 8 portões da Constituição verdes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sem dependências
- **Foundational (Fase 2)**: depende da Fase 1 — **bloqueia todas as user stories**
- **US1 (Fase 3)**: depende da Fase 2. Nenhuma dependência de outra story
- **US2 (Fase 4)**: depende da Fase 2. Reusa componentes de `packages/ui`, mas é testável isoladamente
- **US3 (Fase 5)**: depende da Fase 2; a galeria fica mais rica após US1/US2, mas o inventário e a verificação de literais funcionam com o que existir
- **US4 (Fase 6)**: depende da Fase 2 apenas. **Pode correr em paralelo com US1 e US2 desde o início** — não toca frontend
- **Polish (Fase 7)**: depende das stories desejadas

### Dependências internas notáveis

- T013 → T015 → T016 (importar antes de hashear antes de testar)
- T013 → T017 → T018/T019/T020 (tokens antes dos overlays)
- T023 → T024 → T027 → T028 (contrato → tipos → schemas → regras)
- T030 → T031 → T032 (registro → validador → teste)
- T033 → T034 → T036 (portas → transportes → validação dos mocks)
- T037 → T056–T062 (core antes dos componentes editoriais)
- T052–T055 → T065–T078 (dados antes das telas)
- T079/T080 → T049 passa (SEO implementado antes do teste de SEO passar)
- T119 → T116/T117 (módulos existem antes de a fronteira ser verificável)

### Parallel Opportunities

- Fase 1: T002–T007 e T011–T012 em paralelo
- Fase 2: T019/T020 juntos; T037–T040 juntos; T025/T026/T029/T032/T035 juntos
- Fase 3: os 6 testes T046–T051 juntos; os dados T052–T055 juntos; os componentes T056–T062 juntos; as telas T067–T078 juntas (a home T065 e a notícia T066 primeiro, por serem as referências de layout); os endpoints de SEO T081–T084 juntos
- Fase 4: T087–T091 juntos; T097–T107 juntos, exceto T099 e T100 (interações)
- Fase 6: T125–T139 quase todos em paralelo — são arquivos distintos
- Entre times: US1, US2 e US4 em paralelo assim que a Fase 2 fecha

---

## Parallel Example: User Story 1

```bash
# Testes de US1 (escrever primeiro, devem falhar):
Task: "Teste de superfícies em tests/e2e/public-surfaces.spec.ts"
Task: "Teste de temas e larguras em tests/e2e/public-themes.spec.ts"
Task: "Teste sem JavaScript em tests/e2e/no-js.spec.ts"
Task: "Teste de SEO em tests/seo/public-pages.test.ts"
Task: "Teste de acessibilidade em tests/a11y/public.spec.ts"
Task: "Teste de slots de anúncio em tests/e2e/ads-layout.spec.ts"

# Dados demonstrativos juntos:
Task: "packages/api-client/src/mock/data/news.ts — 12 artigos"
Task: "packages/api-client/src/mock/data/geo.ts — 9 bairros"
Task: "packages/api-client/src/mock/data/categories.ts + authors.ts"
Task: "packages/api-client/src/mock/data/{events,companies,utilities,gazette}.ts"

# Componentes editoriais juntos:
Task: "packages/ui/src/news/{HeroStory,NewsCard,NewsListItem}.astro"
Task: "packages/ui/src/news/{CurationStamp,RegionalContextBox,AttributionFooter,ShareBar}.astro"
Task: "packages/ui/src/navigation/{SiteHeader,WeatherStrip,SiteFooter}.astro"
Task: "packages/ui/src/widgets/{WidgetCard,PharmacyList,JobList,EventList}.astro"
```

---

## Implementation Strategy

### MVP (apenas User Story 1)

1. Fase 1: Setup
2. Fase 2: Foundational — **crítica, bloqueia tudo**
3. Fase 3: US1
4. **PARAR e VALIDAR**: cenários V1, V2, V3, V5, V6 de `quickstart.md`
5. Publicar em homologação: já é um portal demonstrável e mensurável

### Entrega incremental

1. Setup + Foundational → fundação pronta (DS preservado, tokens únicos, contratos, dados)
2. + US1 → portal público (MVP)
3. + US2 → painel administrativo
4. + US3 → inventário e portões de consistência
5. + US4 → backend modular e documentação (pode ter começado em paralelo desde a Fase 2)
6. + Fase 7 → orçamentos, revisão visual e execução completa do quickstart

### Estratégia com equipe

Após a Fase 2: dev A em US1 (maior fatia), dev B em US2, dev C em US4 (não toca frontend, zero
conflito). US3 fecha depois que US1 e US2 tiverem componentes suficientes para popular a galeria.

---

## Notes

- **Testes não são opcionais aqui** — Princípio IX e `TODO(TASKS_TEMPLATE_TESTS)` da Constituição
- Ordem dentro de cada story: testes → dados → componentes → telas → integração
- O protótipo vendorizado é a referência de toda decisão visual; o texto desta lista nunca o supera
- Nenhuma tarefa introduz item da lista de exclusão de FR-038 — se uma implementação parecer
  exigir isso, é sinal de escopo vazando, não de tarefa faltando
- Commit por tarefa ou grupo lógico; parar em qualquer checkpoint para validar a story isolada
