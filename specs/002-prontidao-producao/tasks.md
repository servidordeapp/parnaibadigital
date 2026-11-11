---

description: "Task list — Prontidão para Produção: do protótipo ao portal publicado"
---

# Tasks: Prontidão para Produção — do protótipo ao portal publicado

**Input**: Design documents from `/specs/002-prontidao-producao/`

**Prerequisites**: [plan.md](./plan.md) · [spec.md](./spec.md) · [research.md](./research.md) ·
[data-model.md](./data-model.md) · [contracts/](./contracts/) · [quickstart.md](./quickstart.md)

**Tests**: **OBRIGATÓRIOS**, não opcionais (Constituição v2.0.0, Princípio IX). TDD é exigido para
domínio, contratos de API e invariantes editoriais: dentro de cada fase de user story, **os testes
vêm primeiro e devem ser vistos falhando** antes da implementação. Todo endpoint novo tem teste de
contrato. Testes são determinísticos: relógio via `Carbon::setTestNow`, sem `sleep`.

**Organization**: tarefas agrupadas por user story (US1–US7 do spec; **US8 está fora do
lançamento** e não tem tarefa). Cada fase de story é implementável e verificável de forma
independente, respeitando as dependências declaradas abaixo.

**Marcas de risco**: `🔒` = decisão que exige confirmação do usuário (ver plan.md → "Pontos para o
usuário"); `👤` = tarefa **não-código** que depende de pessoa/infra externa (caminho crítico).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 integridade · US2 acesso · US3 conteúdo · US4 entrega/operação · US5 legal ·
  US6 busca · US7 newsletter, publicidade, métricas
- Todo caminho é relativo à raiz do repositório
- `D2-nn` referencia [research.md](./research.md); `FR`/`SC` referenciam [spec.md](./spec.md)

## Path Conventions

Monorepo pnpm existente: `apps/web/`, `apps/admin/`, `packages/{api-client,types,ui,validation,design-system}/`,
`backend/api/` (Laravel: `app/{Domain,Application,Infrastructure,Http}/<Módulo>/`, testes Pest em
`backend/api/tests/{Unit,Feature,Architecture}`), `infrastructure/`, `scripts/`, `docs/`, `tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: dependências, ADRs e esqueleto. Nenhum comportamento de produto ainda.

- [ ] T001 Adicionar a `backend/api/composer.json` as dependências de runtime `laravel/fortify`, `laravel/sanctum`, `spatie/laravel-permission`, `vladimir-yuldashev/laravel-queue-rabbitmq`, `league/flysystem-aws-s3-v3`, `intervention/image`, `sentry/sentry-laravel`; **verificar compatibilidade do driver RabbitMQ com Laravel 13** — se incompatível, registrar no ADR de substituição a troca para o driver `redis` (D2-15) e seguir
- [ ] T002 [P] Adicionar `@astrojs/node` e `@sentry/node` a `apps/web/package.json` e `apps/admin/package.json` (zero biblioteca de cliente nova — D2-18)
- [ ] T003 [P] Criar `.gitleaks.toml` na raiz com regras padrão + allowlist para os arquivos `*.env.example` (FR-014, SC-020)
- [ ] T004 [P] Criar `infrastructure/postgres/init.sql` habilitando as extensões `unaccent` e `citext` e montá-lo em `infrastructure/docker-compose.dev.yml`
- [ ] T005 [P] Redigir `docs/decisions/0008-busca-postgresql-no-lancamento.md` — exerce o critério de reversão do ADR 0006; inclui o gatilho de troca mensurável (p95 > 200 ms ou relevância ruim) 🔒 — D2-12
- [ ] T006 [P] Redigir `docs/decisions/0009-cloudflare-como-codigo.md` (OpenTofu) com problema, alternativa rejeitada (runbook manual) e critério de reversão — D2-17
- [ ] T007 [P] Redigir `docs/decisions/0010-ssr-com-cache-de-borda.md` — divergência da D-02 da 001 e da letra do Princípio I, com alternativa rejeitada (SSG + rebuild) e reversão 🔒 — D2-02
- [ ] T008 [P] Acrescentar adendo a `docs/decisions/0002-organizacao-modular-do-dominio.md` registrando os módulos `Audit` e `Newsletter` e por que não foram embutidos em `Users`/`Editorial`
- [ ] T009 Criar o esqueleto dos dois módulos novos (`app/Domain/{Audit,Newsletter}/Contract/`, `app/Application/{Audit,Newsletter}/UseCase/`, `app/Infrastructure/{Audit,Newsletter}/Adapter/`, cada um com `.gitkeep`) em `backend/api/app/`
- [ ] T010 Atualizar `backend/api/deptrac.yaml` com as camadas `Domain_Audit`, `Application_Audit`, `Infrastructure_Audit`, `Domain_Newsletter`, `Application_Newsletter`, `Infrastructure_Newsletter` e a regra de dependência para dentro; rodar `composer deptrac` e confirmar zero violação
- [ ] T011 [P] Atualizar `backend/api/.env.example` com **apenas as chaves** (valor vazio ou exemplo local): `DB_CONNECTION=pgsql`, `REDIS_*`, `QUEUE_CONNECTION=rabbitmq`, `RABBITMQ_*`, `SESSION_DRIVER=redis`, `SENTRY_LARAVEL_DSN`, `MAIL_*`, `R2_*`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `PD_ENV`
- [ ] T012 Atualizar `.github/workflows/verify.yml` (job `backend`): adicionar service containers PostgreSQL 17 e Redis, `composer audit`, `pnpm audit --prod --audit-level=high` e um job `secrets` com `gitleaks` (histórico + diff) — FR-014, SC-020

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: base compartilhada por todas as stories — observabilidade mínima, banco, dados de
referência, contrato mesclado e SSR. Nenhuma story pode começar antes disto.

**⚠️ CRÍTICO**: bloqueia US1–US7.

### Backend: correlação, erros e banco

- [ ] T013 [P] Teste em `backend/api/tests/Feature/Observability/RequestIdTest.php`: toda resposta carrega `X-Request-Id` (ULID); valor de entrada válido é preservado, inválido é substituído; o id aparece em toda linha de log JSON da requisição — FR-027
- [ ] T014 [P] Teste em `backend/api/tests/Feature/Observability/ProblemJsonTest.php`: `404/422/401/403/409/500` respondem `application/problem+json` (RFC 9457) com `request_id`, sem stack trace em produção
- [ ] T015 Implementar `backend/api/app/Http/Middleware/RequestId.php` (grava no `Context` do Laravel, que se propaga a jobs enfileirados — D2-18) e registrá-lo como global em `backend/api/bootstrap/app.php`
- [ ] T016 Configurar o canal de log JSON em `backend/api/config/logging.php` (`JsonFormatter`, `stderr`) como padrão fora de `local`, incluindo o `request_id` do `Context`
- [ ] T017 Implementar o renderizador de exceções `application/problem+json` em `backend/api/bootstrap/app.php` (ou `app/Http/ProblemRenderer.php`) fazendo T014 passar
- [ ] T018 Trocar o padrão de banco para PostgreSQL em `backend/api/config/database.php` e `backend/api/phpunit.xml` (banco de teste pgsql, `RefreshDatabase`); rodar `composer test` e confirmar verde
- [ ] T019 [P] Criar `/healthz` — teste em `backend/api/tests/Feature/Ops/HealthzTest.php` (200 ok; 503 quando Postgres/Redis/RabbitMQ indisponível, sem detalhe sensível) e implementação em `backend/api/app/Http/Controllers/HealthzController.php` + `routes/web.php`

### Dados de referência (municípios, editorias, autores)

- [ ] T020 Criar `scripts/export-seed-data.ts` que gera `backend/api/database/seeders/data/{municipalities,neighborhoods,categories}.json` a partir de `packages/api-client/src/data/municipalities.ts` e dos dados de editoria/bairro — **fonte única**, sem duplicar lista em PHP (D2-13)
- [ ] T021 Adicionar o portão de drift: `scripts/check-seed-drift.ts` reprova se o JSON gerado difere do versionado; ligar em `package.json` (`check:seed`) e em `.github/workflows/verify.yml`
- [ ] T022 [P] Migração `backend/api/database/migrations/*_create_cities_tables.php`: `cities_municipalities` (`ibge_code` PK, `slug` UNIQUE, `name`, `state`, coordenadas) e `cities_neighborhoods` (FK ao município, `id` = `{municipio}:{bairro}`) — ADR 0005
- [ ] T023 [P] Migração `backend/api/database/migrations/*_create_categories_table.php` (`slug` PK, `name`, `tone`, `position`)
- [ ] T024 [P] Migração `backend/api/database/migrations/*_create_authors_table.php` (`id` ulid, `slug` UNIQUE, `name`, `role`, `bio`, `media_id` nullable)
- [ ] T025 Seeders idempotentes `backend/api/database/seeders/{MunicipalitySeeder,CategorySeeder}.php` lendo os JSON de T020; registrar em `DatabaseSeeder.php`; teste em `backend/api/tests/Feature/Seed/ReferenceDataSeedTest.php` (rodar duas vezes não duplica; 5 municípios, 9 bairros, 12 editorias)
- [ ] T026 [P] Entidades de domínio e portas somente-leitura de `Cities`, `Neighborhoods`, `Categories`, `Authors` em `backend/api/app/Domain/{Cities,Neighborhoods,Categories,Authors}/` (sem Laravel, sem Eloquent)
- [ ] T027 Adaptadores Eloquent (modelos **privados** ao adaptador) em `backend/api/app/Infrastructure/{Cities,Neighborhoods,Categories,Authors}/Adapter/` implementando as portas de T026; teste de arquitetura em `backend/api/tests/Architecture/NoCrossModuleModelsTest.php` garantindo que nenhum módulo importa modelo de outro

### Contrato e tipos

- [ ] T028 Mesclar `specs/002-prontidao-producao/contracts/openapi-v1-launch.yaml` em `specs/001-fundacao-prototipo-monorepo/contracts/openapi-v1.yaml` (aditivo, mesma versão — Princípio VII); preencher o enum `AdSlot` a partir dos slots existentes em `apps/web/src/` e `packages/ui/src/ads/`
- [ ] T029 Regenerar `packages/types/src/generated/api-v1.ts` (`pnpm types:generate`) e fazer `pnpm typecheck` passar; `commentCount`/`views` permanecem **opcionais** (D2-25)
- [ ] T030 [P] Escolher e instalar um validador OpenAPI para Pest (ex.: `osteel/openapi-httpfoundation-testing`) e criar o helper `backend/api/tests/Support/AssertsContract.php` que valida cada resposta contra `openapi-v1.yaml` — base de todos os testes de contrato (Princípio IX)

### Frontend: SSR e harness de testes

- [ ] T031 Converter `apps/web/astro.config.mjs` para `output: 'server'` com `@astrojs/node` (`mode: 'standalone'`), `build.inlineStylesheets: 'never'`; marcar `export const prerender = true` em `anuncie.astro`, `utilidade-publica.astro` e nas futuras `expediente`/`privacidade` — D2-02, D2-10
- [ ] T032 Converter `apps/admin/astro.config.mjs` para `output: 'server'` com `@astrojs/node` (porta 4322 preservada)
- [ ] T033 Criar `apps/web/src/middleware.ts`: injeta `X-Request-Id` (propaga ao chamar a API), define `Cache-Control`/`ETag` por tipo de página (notícia `s-maxage=300, stale-while-revalidate=86400`; home e listagens `s-maxage=60`; institucionais `prerender`) e **nunca** emite `Set-Cookie` em resposta pública (preserva o cache de borda — D2-07)
- [ ] T034 Adaptar `playwright.config.ts` para iniciar o servidor construído (`node apps/web/dist/server/entry.mjs`, `PD_ENV=test`, transporte mock) via `webServer`, e `lighthouserc.json` para `startServerCommand` equivalente; os projetos `chromium-360`, `chromium-1280` e `no-js` permanecem
- [ ] T035 Adaptar `tests/seo/public-pages.test.ts` e `apps/web/scripts/check-js-budget.ts` para ler o HTML **do servidor construído** (helper `tests/helpers/server.ts` que sobe/derruba o servidor) em vez do `dist/` estático; a semântica das asserções não muda
- [ ] T036 Rodar `pnpm verify` completo e confirmar que **todos os 8 portões da 001 continuam verdes sob SSR** (nenhuma regressão de LCP/CLS/JS) antes de liberar qualquer story

**Checkpoint**: backend com banco, correlação e dados de referência; contrato mesclado; frontend em SSR com os portões verdes.

---

## Phase 3: User Story 1 — Nenhum conteúdo fabricado alcança o público (Priority: P1) 🎯 MVP

**Goal**: tornar impossível, por construção, que demonstração chegue a um endereço público;
superfícies sem origem real são retidas; portal vazio se apresenta íntegro.

**Independent Test**: V1 e V5 do `quickstart.md` — build de produção com mock **reprova** nomeando
arquivo e variável; com acervo vazio todas as superfícies públicas são íntegras; superfícies retidas
dão 404 e somem de nav/sitemaps/feeds.

> **Por que é MVP**: é o único requisito cuja falha é irreversível (Advertência editorial). Entrega
> valor de proteção antes de qualquer backend: mesmo sem as demais stories, o portal não publica ficção.

### Tests for User Story 1 (escrever primeiro; devem falhar)

- [ ] T037 [P] [US1] Teste da guarda em `packages/api-client/tests/guard.test.ts` — matriz `PD_ENV × PD_DATA_TRANSPORT`: `staging`/`production` + `mock` lança; `staging`/`production` + transporte **ausente** lança; `PD_ENV` ausente/inválido lança; `development`/`test` + mock passa; mensagem de erro contém `packages/api-client/src/index.ts` **e** `PD_DATA_TRANSPORT` — FR-001, SC-002
- [ ] T038 [P] [US1] Teste do detector em `tests/guards/no-demo.test.ts`: gera os marcadores de demonstração **calculando-os de `packages/api-client/src/mock/data/`** (slugs, manchetes, nomes de autor/empresa, hosts `*.example*`), varre um artefato construído com `PD_ENV=test`+mock e **encontra** marcadores (prova que o detector detecta), e passa sobre um artefato com fixture vazia — SC-001
- [ ] T039 [P] [US1] Teste de acervo vazio em `tests/e2e/empty-state.spec.ts` (`@empty-state`): com `PD_DATA_FIXTURE=empty`, home, hubs dos 5 municípios, editorias, autor, busca, `/rss/*` e todos os `sitemap-*.xml` respondem 200, XML bem formado, sem card vazio, sem `NaN`/`undefined`, sem texto de preenchimento, e com o estado vazio anunciado (`role="status"`) — FR-023, SC-019
- [ ] T040 [P] [US1] Teste de superfícies retidas em `tests/seo/withheld-surfaces.test.ts`: `/diario-oficial`, `/empresas`, `/eventos`, `/utilidade-publica` → 404; ausentes de navegação, `sitemap-*.xml`, feeds, `robots.txt` e do inventário de rotas — FR-042/043, SC-021 🔒
- [ ] T041 [P] [US1] Teste de estado vazio no painel em `tests/e2e/admin-empty-states.spec.ts` (`@admin-empty`): `/diario-oficial`, `/pipeline`, `/configuracoes`, `/seo`, `/integracoes` exibem `EmptyState` explicando "capacidade ainda não ativa" e **nenhum número**; o diagrama de 8 etapas do pipeline não mostra contador — FR-044, SC-022
- [ ] T042 [P] [US1] Teste de acessibilidade do `EmptyState` em `tests/a11y/empty-state.spec.ts`: axe, dois temas, 360/1280 px

### Implementation for User Story 1

- [ ] T043 [US1] Implementar a guarda em `packages/api-client/src/index.ts`: `PD_ENV` obrigatório; `mock` só em `development|test`; transporte ausente fora de dev/test = erro (hoje o padrão silencioso é `mock`) — fazer T037 passar (D2-01)
- [ ] T044 [US1] Tornar `createMockClient` carregável **só por `await import()`** dentro da guarda em `packages/api-client/src/index.ts` e `packages/api-client/src/transports/mock.ts`, e ajustar `getDataClient()` para assíncrono/memoizado; conferir que o bundle de produção **não contém** `mock/data/` (D2-01 camada 2)
- [ ] T045 [P] [US1] Criar a fixture vazia em `packages/api-client/src/mock/data/empty.ts` e `createMockClient({ fixture: 'empty' })` selecionada por `PD_DATA_FIXTURE=empty` (só em `test`) para T039
- [ ] T046 [US1] Criar `apps/web/src/integrations/assert-env.ts` e `apps/admin/src/integrations/assert-env.ts` (integração Astro `astro:config:setup`) que invocam a guarda **na construção**, e registrá-las em `apps/web/astro.config.mjs`/`apps/admin/astro.config.mjs` — falha antes de gerar qualquer artefato (SC-002)
- [ ] T047 [P] [US1] Atualizar `apps/web/.env.example` e `apps/admin/.env.example` com `PD_ENV` e a nova semântica de `PD_DATA_TRANSPORT` (sem padrão `mock` implícito; comentário avisando que `mock` é só dev/test)
- [ ] T048 [US1] Criar `scripts/check-no-demo.ts` (usa o gerador de marcadores de T038) e os scripts `test:no-demo` em `package.json`; incluir em `pnpm verify` e em `.github/workflows/verify.yml` após o build — SC-001
- [ ] T049 [US1] Reter as 4 superfícies sem origem real: `git mv` de `apps/web/src/pages/{diario-oficial,empresas,eventos,utilidade-publica}.astro` para `apps/web/src/deferred/` (fora de `pages/`, Astro não gera a rota); marcar `retida` em `specs/001-fundacao-prototipo-monorepo/contracts/routes.md` e em `apps/web/src/lib/inventory.ts` — D2-26 🔒
- [ ] T050 [US1] Remover as superfícies retidas da navegação (`packages/ui/src/navigation/`; localizar por `grep -rn "diario-oficial\|empresas\|eventos\|utilidade" packages/ui apps/web/src`), de `apps/web/src/pages/sitemap-core.xml.ts`, de `apps/web/src/pages/robots.txt.ts`, dos feeds e de `tests/helpers/surfaces.ts`/`tests/e2e/public-surfaces.spec.ts`; atualizar `apps/web/scripts/validate-slug-registry.ts` mantendo as rotas retidas **reservadas** (para não nascer colisão de slug de município)
- [ ] T051 [P] [US1] Remover `commentCount` e `views`/contadores fabricados das superfícies públicas (componentes em `packages/ui/src/news/` e páginas em `apps/web/src/pages/`) — D2-25
- [ ] T052 [P] [US1] Criar o componente `EmptyState` em `packages/ui/src/feedback/EmptyState.astro` (verificar antes se `packages/ui/src/feedback/` já tem equivalente — Princípio VI), com `role="status"`, tokens apenas, e cobertura dos dois temas; fazer T042 passar
- [ ] T053 [US1] Aplicar `EmptyState` e acervo vazio íntegro em `apps/web/src/pages/index.astro`, `[municipio]/index.astro`, `[municipio]/[bairro].astro`, `editoria/`, `autor/`, `busca.astro`, `rss/`, e nos sitemaps (`sitemap-*.xml.ts` devolvem XML válido com zero `<url>`) — fazer T039 passar
- [ ] T054 [US1] Trocar dado de demonstração por `EmptyState` nas telas admin sem origem real: `apps/admin/src/pages/{diario-oficial,pipeline,configuracoes,seo,integracoes,analytics,index}.astro`; o diagrama do pipeline fica como explicação sem contadores — fazer T041 passar (FR-044; `analytics` e `index` ganham dado real na US7/US3)
- [ ] T055 [US1] Rodapé de atribuição da matéria (veículo, responsável editorial, referência à fonte quando houver) lê **campos reais** do contrato (`source_ref`, autor) em vez de texto fixo de demonstração — `packages/ui/src/news/` e `apps/web/src/pages/noticia/[slug].astro` (US1 cenário 3; a origem real chega na US3)
- [ ] T056 [US1] Rodar V1 e V5 do `quickstart.md`, rodar `pnpm verify` e registrar o resultado em `specs/002-prontidao-producao/quickstart-results.md`

**Checkpoint**: nenhum caminho de código coloca demonstração num artefato público; acervo vazio é íntegro.

---

## Phase 4: User Story 2 — Só quem tem permissão publica (Priority: P1)

**Goal**: autenticação, papéis, 2FA, rate limit, auditoria imutável e acesso ao painel verificado
**no servidor**.

**Independent Test**: V3 do `quickstart.md` — as 11 telas e todas as operações de escrita recusam
acesso sem sessão (sem vazar dado), papel restrito é recusado com `access.denied` auditado, papel
administrativo sem 2FA recebe `423`.

**Depends on**: Foundational. **Bloqueia** US3 (persistir conteúdo só faz sentido com acesso controlado).

### Tests for User Story 2 (escrever primeiro; devem falhar)

- [ ] T057 [P] [US2] `backend/api/tests/Feature/Auth/LoginTest.php`: login por formulário JSON com CSRF, sessão em Redis, cookie `HttpOnly; Secure; SameSite=Lax` *host-only*; credencial errada → 422 genérico (não revela se o e-mail existe)
- [ ] T058 [P] [US2] `backend/api/tests/Feature/Auth/TwoFactorEnforcementTest.php`: `admin` e `editor_chefe` sem 2FA confirmado recebem **423** em toda rota `/api/v1/admin/*` exceto `enroll-2fa` e `logout`; com 2FA confirmado passam; `editor`/`reporter` não são obrigados — FR-009, SC-004
- [ ] T059 [P] [US2] `backend/api/tests/Feature/Auth/TwoFactorRecoveryTest.php`: recovery code reabre acesso; outro `admin` redefine o fator via `/admin/users/{id}/two-factor/reset` (auditado, força novo cadastro); **não existe** operação que desligue o 2FA sem substituí-lo; auto-redefinição é recusada — Edge Case "fator perdido"
- [ ] T060 [P] [US2] `backend/api/tests/Feature/Auth/RateLimitTest.php`: login limitado por `e-mail+IP` (5/min) e por IP (20/min) → 429 com `Retry-After` — FR-012, US2-5
- [ ] T061 [P] [US2] `backend/api/tests/Feature/Auth/AuthorizationMatrixTest.php` (dataset): cada (papel × permissão) da matriz de `data-model.md` → permitido/negado **no servidor**, para todas as operações `/admin/*` de `openapi-v1-launch.yaml` — FR-008
- [ ] T062 [P] [US2] `backend/api/tests/Feature/Audit/AccessDeniedAuditTest.php`: operação fora do papel → 403 **e** uma `audit_entries` `access.denied` com ator, request_id e rota — US2-3
- [ ] T063 [P] [US2] `backend/api/tests/Feature/Audit/AuditImmutabilityTest.php`: `UPDATE` e `DELETE` em `audit_entries` levantam exceção do trigger; o papel de banco da aplicação não tem `UPDATE`/`DELETE` (`has_table_privilege` falso) — D2-08, SC-005
- [ ] T064 [P] [US2] `backend/api/tests/Feature/Audit/AuditCoverageTest.php`: mudança de papel, de permissão, de configuração, redefinição de 2FA e purga global de cache geram `audit_entries` com ator, momento, `before` e `after` — SC-005
- [ ] T065 [P] [US2] `tests/e2e/auth-denied.spec.ts` (`@auth-denied`): para cada uma das 11 telas do painel e cada operação de escrita (lista lida de `contracts/openapi-v1-launch.yaml`), a requisição **sem sessão** não retorna dado editorial no corpo (302/401) — SC-003, US2-1
- [ ] T066 [P] [US2] `tests/guards/csp.test.ts`: varre o HTML do servidor construído e reprova `<script>` executável inline, atributos `on*=`, `style=""` fora de lista de hashes e `<style>` inline — D2-10, FR-015

### Implementation for User Story 2 — Audit (módulo novo)

- [ ] T067 [US2] Migração `backend/api/database/migrations/*_create_audit_entries_table.php`: tabela append-only (`id` bigserial, `at`, `actor_id` null, `actor_ip_hash`, `request_id`, `action`, `subject_type`, `subject_id`, `before`/`after` jsonb, índices de `data-model.md`), **trigger** `BEFORE UPDATE OR DELETE` que levanta exceção e `GRANT INSERT, SELECT` apenas ao papel da aplicação — fazer T063 passar
- [ ] T068 [US2] Domínio `backend/api/app/Domain/Audit/` (`AuditEntry`, porta `AuditLog` com **só `append()`**) + adaptador `backend/api/app/Infrastructure/Audit/Adapter/PostgresAuditLog.php` + listeners de eventos de domínio em `backend/api/app/Application/Audit/UseCase/` (módulos **não** escrevem em tabela alheia — Princípio VIII)
- [ ] T069 [US2] Handler de `AuthorizationException` → evento `AccessDenied` auditado, em `backend/api/bootstrap/app.php` — fazer T062 passar
- [ ] T070 [US2] `GET /api/v1/admin/audit` (filtros por ator, ação, objeto, período; permissão `audit.view`) em `backend/api/app/Http/Controllers/Admin/AuditController.php` + teste de contrato

### Implementation for User Story 2 — Users, RBAC, 2FA

- [ ] T071 [US2] Migração de `users` estendida (`status`, `two_factor_*`, `last_login_at`, `email` como `citext` UNIQUE) em `backend/api/database/migrations/*_extend_users_for_launch.php` e `config/permission.php` publicado
- [ ] T072 [US2] Domínio `backend/api/app/Domain/Users/` (`Account`, `Role`, `Permission`, portas) e adaptador `backend/api/app/Infrastructure/Users/Adapter/SpatieRbacAdapter.php` — Spatie **só** na Infrastructure (D2-07)
- [ ] T073 [US2] `RoleSeeder` com os 5 papéis e a matriz de permissões de `data-model.md` (dado, não código) — `backend/api/database/seeders/RoleSeeder.php`
- [ ] T074 [US2] Configurar Fortify headless (login, 2FA TOTP, recovery codes, confirmação de senha) em `backend/api/config/fortify.php` e `app/Providers/FortifyServiceProvider.php`; Sanctum SPA em `config/sanctum.php` com cookie *host-only* e sessão Redis — fazer T057 passar
- [ ] T075 [US2] Middleware `backend/api/app/Http/Middleware/EnsureTwoFactor.php` (423 conforme T058) e aplicá-lo ao grupo `/api/v1/admin/*` em `backend/api/routes/api.php` ao lado de `auth:sanctum` e `can:<permissão>` — fazer T058/T061 passar
- [ ] T076 [US2] Rate limiters nomeados em `backend/api/app/Providers/AppServiceProvider.php` (login por `e-mail+IP` e por IP; escrita pública por IP, reutilizados por US5/US7) — fazer T060 passar
- [ ] T077 [US2] `GET /api/v1/admin/session` em `backend/api/app/Http/Controllers/Admin/SessionController.php` (conta, papéis, permissões, `twoFactorConfirmed`; 401/423) + teste de contrato
- [ ] T078 [US2] `/api/v1/admin/users` (listar, convidar sem senha em claro), `PUT …/{id}/role` e `POST …/{id}/two-factor/reset` com eventos `RoleChanged`/`TwoFactorReset` auditados, em `backend/api/app/Http/Controllers/Admin/UserController.php` + casos de uso em `app/Application/Users/UseCase/` — fazer T059/T064 passar
- [ ] T079 [US2] Comando `php artisan pd:create-admin` em `backend/api/app/Console/Commands/CreateAdmin.php` para criar a **primeira** conta `admin` (único modo de bootstrap; exige cadastro de 2FA no primeiro acesso)

### Implementation for User Story 2 — Painel (Astro admin)

- [ ] T080 [US2] `apps/admin/src/middleware.ts`: antes de renderizar **qualquer** página, chamar `GET /api/v1/admin/session` com o cookie recebido; sem sessão → redireciona a `/entrar` **sem** ter lido dado editorial; `423` → só `/seguranca/segundo-fator` e logout; repassar `X-Request-Id` — FR-007, US2-1
- [ ] T081 [P] [US2] Criar `apps/admin/src/pages/entrar.astro` (formulário `POST` nativo com CSRF, estado de erro associado ao campo, aviso de limite de tentativas) sobre tokens do DS
- [ ] T082 [P] [US2] Criar `apps/admin/src/pages/seguranca/segundo-fator.astro` (QR/segredo TOTP, confirmação, exibição única dos recovery codes)
- [ ] T083 [US2] Trocar `apps/admin/src/pages/usuarios.astro` de demonstração para dados reais (`/admin/users`): listar, convidar, alterar papel, redefinir 2FA; esconder controle **não** é controle de acesso (o servidor já recusa)
- [ ] T084 [US2] Garantir `noindex,nofollow` + `X-Robots-Tag` e `robots.txt` `Disallow: /` nas novas rotas do admin (`apps/admin/src/pages/robots.txt.ts`) e teste correspondente em `tests/e2e/admin-noindex.spec.ts`

### Implementation for User Story 2 — Borda, CSP, segredos

- [ ] T085 [US2] Eliminar a necessidade de `unsafe-inline`: auditar e remover `style=""`/scripts inline em `apps/web/src/` e `apps/admin/src/` e `packages/ui/src/` (classes/tokens no lugar — reforça Princípio VI); resíduo irredutível entra como hash em lista explícita — fazer T066 passar (D2-10, P-13)
- [ ] T086 [P] [US2] Escrever `infrastructure/cloudflare/{main,dns,access,waf,cache}.tf` (OpenTofu): zona, DNS de `www`/`admin`/`homolog`, TLS *Full (strict)* com Origin CA, regra de cache respeitando `s-maxage`, rate limit de WAF, aplicações **Cloudflare Access** para `admin.*` e `homolog.*`; variáveis sem valor versionado — FR-016, D2-17
- [ ] T087 [P] [US2] Criar `scripts/smoke/admin-edge.sh`: sem credencial do Access → 302/403; requisição direta ao IP de origem → recusada (V6)
- [ ] T088 [US2] Remover o comentário morto `# Access-Control: allow-ip …` e o aviso de pendência de `infrastructure/_headers` (P-05); registrar em `docs/infrastructure.md` que o bloqueio efetivo é Access + autenticação do Laravel (a execução real do V6 acontece na US4, com staging)
- [ ] T089 [US2] Guarda de segredos no frontend: `scripts/check-no-secrets-in-bundle.ts` reprova se variável sem prefixo `PUBLIC_` aparecer em `apps/*/dist/` ou no bundle de cliente; ligar em `package.json` e `verify.yml` — FR-014
- [ ] T090 [US2] Rodar V3 do `quickstart.md`; `composer test`, `composer analyse`, `composer deptrac` verdes; registrar em `quickstart-results.md`

**Checkpoint**: painel só alcançável com sessão + 2FA; toda recusa e toda alteração sensível auditadas.

---

## Phase 5: User Story 3 — O conteúdo real existe, persiste e é servido (Priority: P1)

**Goal**: matéria criada no painel, persistida, versionada, aprovada por pessoa distinta, servida por
API real e por todas as superfícies derivadas, com redirecionamento permanente e sem edição de código
para município novo.

**Independent Test**: V2 e V4 — publicar pelo painel, reiniciar, ver em notícia/hub/editoria/busca/
feeds/sitemap; alterar slug → 301; despublicar → 410; sexto município sem editar rota/template/script.

**Depends on**: US2 (autenticação e auditoria) e Foundational.

### Tests for User Story 3 (escrever primeiro; devem falhar)

- [ ] T091 [P] [US3] `backend/api/tests/Unit/Editorial/StateMachineTest.php` (grupo `editorial-invariants`): transições legais/ilegais; `draft → published` impossível; `published` só nasce com `EditorialApproval` — D2-04
- [ ] T092 [P] [US3] `backend/api/tests/Unit/Editorial/ApprovalAuthorTest.php`: aprovador = autor da versão é recusado no domínio; origem `own_reporting` é a única criável no lançamento — FR-003/045
- [ ] T093 [P] [US3] `backend/api/tests/Architecture/NoUnapprovedPublishTest.php` (grupo `editorial-invariants`): enumera por Pest arch **toda** classe/método que pode produzir o estado `published` e falha se algum não exigir `EditorialApproval` — SC-018
- [ ] T094 [P] [US3] `backend/api/tests/Unit/News/RedirectRuleTest.php` + propriedade: cadeia A→B→C colapsa para A→C, ciclo recusado, `from_path` único, endereço publicado nunca vira 404 após troca de slug — FR-020, SC-007
- [ ] T095 [P] [US3] `backend/api/tests/Feature/News/OptimisticLockTest.php`: `PUT` sem `If-Match` → 428/412; com versão defasada → 409 + versão atual; duas gravações simultâneas — a segunda não sobrescreve em silêncio — Edge Case
- [ ] T096 [P] [US3] `backend/api/tests/Feature/News/PublishRulesTest.php`: publicar sem município primário → 422 explicativo (e `NOT NULL`/FK no banco); bairro de outro município recusado — FR-019, US3-5
- [ ] T097 [P] [US3] `backend/api/tests/Feature/News/ContentBlockValidationTest.php`: corpo só aceita os 5 tipos de bloco, `level` 2–4, tamanho máximo; `<script>`/HTML em texto é persistido como texto e **escapado** na saída; nenhum caminho aceita HTML bruto — FR-013, US3-6, D2-03
- [ ] T098 [P] [US3] `backend/api/tests/Feature/News/VersionsTest.php`: cada gravação cria `ContentVersion`; diferença entre versões; restaurar cria **nova** versão copiando o snapshot — FR-011
- [ ] T099 [P] [US3] `backend/api/tests/Feature/News/ReadContractTest.php`: as **20 operações de leitura** dos 14 caminhos de `openapi-v1.yaml` validadas contra o contrato com dados reais semeados, incluindo paginação, filtros e `ETag`/`304` — FR-018
- [ ] T100 [P] [US3] `backend/api/tests/Feature/News/AdminNewsContractTest.php`: contrato de `/admin/news`, `/transitions/{t}`, `/slug`, `/versions`, `/versions/{n}/restore`, `/admin/media`
- [ ] T101 [P] [US3] `backend/api/tests/Feature/News/UnpublishTest.php`: despublicar → resolução devolve 410, matéria some de listagens/feeds/sitemaps; republicar restaura 200 no mesmo slug — D2-06
- [ ] T102 [P] [US3] `backend/api/tests/Feature/Media/UploadTest.php`: tipo validado por **conteúdo** (não extensão), limite de tamanho, EXIF/GPS removido, derivadas AVIF+WebP geradas por job, matéria publicável com derivada pendente — D2-14
- [ ] T103 [P] [US3] `tests/e2e/content-lifecycle.spec.ts` (`@content-lifecycle`): criar → submeter → revisar (outra conta) → publicar → reiniciar `api`/`web` → íntegro em notícia, hub, editoria, RSS e `sitemap-news.xml`; alterar slug → 301; despublicar → 410
- [ ] T104 [P] [US3] `tests/e2e/new-municipality.spec.ts` (`@sixth-city`): adicionar um sexto município **somente** em `packages/api-client/src/data/municipalities.ts` + seed → hub, feed e entrada em sitemap existem; o teste falha se o diff tocar `apps/`, `packages/ui/` ou `scripts/` — FR-021, SC-008
- [ ] T105 [P] [US3] Atualizar o teste de intercambialidade mock↔http (V10 da 001) em `packages/api-client/tests/` para exercitar o **transporte HTTP real** contra o contrato

### Implementation for User Story 3 — Domínio e persistência

- [ ] T106 [US3] Migrações `backend/api/database/migrations/*_create_news_tables.php`: `news` (todas as colunas e invariantes de `data-model.md`, `municipality_ibge_code NOT NULL` FK, `version`, guardas `source_ref`/`archived_copy_ref`/`ai_assisted`/`ai_provenance`), `news_neighborhoods`, `news_redirects` (`from_path` UNIQUE) — **aditivas** (expand→contract, D2-16)
- [ ] T107 [US3] Migrações `*_create_editorial_tables.php`: `editorial_versions` (append-only) e `editorial_approvals` (append-only, `origin` enum, `CHECK` aprovador ≠ autor via função)
- [ ] T108 [US3] Domínio `backend/api/app/Domain/Editorial/` — máquina de estados `draft → in_review → published ⇄ unpublished`, `EditorialApproval`, `ContentVersion`; **único** construtor de `published` exige aprovação — fazer T091/T092/T093 passar
- [ ] T109 [US3] Domínio `backend/api/app/Domain/News/` — `News`, `Slug`, `ContentBlock` (value objects validando schema estrito), `RedirectRule` (colapso de cadeia, rejeição de ciclo), eventos `NewsPublished`, `NewsUpdated`, `NewsUnpublished` — fazer T094/T097 passar
- [ ] T110 [US3] Adaptadores Eloquent/Postgres em `backend/api/app/Infrastructure/{News,Editorial}/Adapter/` implementando as portas de repositório (modelos privados)
- [ ] T111 [US3] Casos de uso em `backend/api/app/Application/{News,Editorial}/UseCase/`: `CreateDraft`, `UpdateNews` (com `If-Match`), `Transition` (submit/request_changes/publish/unpublish/republish), `ChangeSlug` (cria `RedirectRule` na **mesma transação**), `RestoreVersion`, `ResolvePath` — fazer T094–T096/T098/T101 passar
- [ ] T112 [US3] Listeners de auditoria para `NewsPublished/Updated/Unpublished`, `SlugChanged`, `VersionRestored` em `backend/api/app/Application/Audit/UseCase/` (SC-005)
- [ ] T113 [US3] Mídia: porta `MediaStorage` (existente) + adaptador Flysystem/R2 em `backend/api/app/Infrastructure/Media/Adapter/R2MediaStorage.php`, migração `*_create_media_tables.php`, validação por conteúdo, remoção de EXIF, job `GenerateDerivatives` (AVIF+WebP, larguras) — fazer T102 passar
- [ ] T114 [US3] Autores: `authors` real com `GET /authors`, `/authors/{slug}` e vínculo à matéria (seed inicial só com autores reais fornecidos pela redação; **nenhum autor fictício**) 👤

### Implementation for User Story 3 — API

- [ ] T115 [US3] Controllers de **leitura pública** dos 14 caminhos (`/news`, `/news/{slug}`, `/categories`, `/municipalities[/{slug}]`, `/neighborhoods`, `/authors[/{slug}]`, `/events`/`/companies`/`/utilities`/`/official-gazette` como **vazios válidos**), com `ETag` + `Cache-Control` explícitos, compressão, e cache de aplicação em Redis para listagens — `backend/api/app/Http/Controllers/Public/` e `routes/api.php` — fazer T099 passar (Constituição, camadas de cache)
- [ ] T116 [US3] `GET /api/v1/redirects/resolve` (301/410/200) em `backend/api/app/Http/Controllers/Public/RedirectController.php` + contrato
- [ ] T117 [US3] Controllers `backend/api/app/Http/Controllers/Admin/{NewsController,MediaController}.php` + `FormRequest`s com schema de `ContentBlock` — `POST/PUT /admin/news`, `/transitions/{t}`, `/slug`, `/versions`, `/restore`, `/admin/media`; `ETag` = `version` — fazer T095/T100 passar
- [ ] T118 [US3] `/admin/news` listagem com filtros por estado/município/autor, respeitando permissão (`reporter` só vê as próprias) — contrato incluído em T100

### Implementation for User Story 3 — Frontend

- [ ] T119 [US3] Implementar o **transporte HTTP** completo em `packages/api-client/src/transports/http.ts` para todas as portas (remover todos os `notImplemented`), com `fetch` servidor-a-servidor, `X-Request-Id` propagado, tratamento de 301/410 — fazer T105 passar (FR-018)
- [ ] T120 [US3] `apps/web/src/pages/noticia/[slug].astro`: resolver redirecionamento **antes** do 404 (`Astro.redirect(to, 301)`), responder 410 com página `noindex`, 404 real caso contrário; sem `getStaticPaths` — D2-06
- [ ] T121 [US3] Converter hubs (`[municipio]/index.astro`, `[municipio]/[bairro].astro`), `editoria/`, `autor/`, `rss/`, `sitemap-*.xml.ts` para renderização **sob demanda** lendo da API (sem `getStaticPaths` sobre mock); `Cache-Control` por T033 — FR-021/022
- [ ] T122 [US3] Conferir `apps/web/scripts/validate-slug-registry.ts` e `apps/web/src/lib/site.ts`: o registro de slugs continua lendo `packages/api-client/src/data/municipalities.ts` (fonte única) e a colisão com rota reservada reprova a construção — Edge Case
- [ ] T123 [US3] Painel `apps/admin/src/pages/noticias/index.astro`: lista real com estados e filtros
- [ ] T124 [US3] Painel `apps/admin/src/pages/noticias/[id]/` (editar): editor **de blocos** em TypeScript puro (um campo por bloco, sem biblioteca de editor — D2-03), município primário obrigatório, bairros secundários, upload de capa com `alt`, botões de transição conforme permissão, tratamento de 409 mostrando a diferença para a versão atual
- [ ] T125 [P] [US3] Painel: histórico e comparação de versões, restaurar versão (`apps/admin/src/pages/noticias/[id]/versoes.astro`) — FR-011
- [ ] T126 [P] [US3] Painel: ação "alterar endereço" com aviso de que criará redirecionamento 301 (`apps/admin/src/pages/noticias/[id]/endereco.astro`)
- [ ] T127 [US3] `MunicipalitySeeder`/`CategorySeeder` executados no deploy (`php artisan db:seed --class=… --force` idempotente) — documentar em `docs/backend.md`
- [ ] T128 [US3] Rodar V2 e V4 do `quickstart.md`; `composer test`, `composer analyse`, `composer deptrac`, `pnpm verify` verdes; registrar em `quickstart-results.md`

**Checkpoint**: a redação publica matéria real que persiste e alimenta todas as superfícies; nenhum caminho publica sem aprovação.

---

## Phase 6: User Story 4 — A publicação chega ao leitor e a operação é visível (Priority: P2)

**Goal**: entrega automatizada com staging e reversão, invalidação por evento, observabilidade,
CWV de campo, backup com restauração provada, orçamentos medidos no endereço real.

**Independent Test**: V7, V8, V9, V10, V11 em staging real.

**Depends on**: US3 (eventos de publicação) e Foundational. Várias tarefas 👤 exigem provedor/DNS.

### Tests for User Story 4 (escrever primeiro; devem falhar)

- [ ] T129 [P] [US4] `backend/api/tests/Unit/News/AffectedSurfacesTest.php`: função pura devolve **exatamente** a matéria, editorias (pág. 1), hub do município e do bairro, autor, home, feeds (global/editoria/município) e `sitemap-news.xml`; nada além — FR-030
- [ ] T130 [P] [US4] `backend/api/tests/Feature/Cache/PurgeOnPublishTest.php`: `NewsPublished/Updated/Unpublished` enfileiram a purga com `FakeEdgeCache`; lotes ≤ 30 URLs; falha da API → job falho com *backoff* + alerta, nunca silenciosa — D2-09, FR-041
- [ ] T131 [P] [US4] `backend/api/tests/Feature/Observability/QueueContextTest.php`: o `request_id` da requisição que publica aparece nos logs do job de purga (propagação por `Context`) — FR-027
- [ ] T132 [P] [US4] `backend/api/tests/Feature/Telemetry/VitalsTest.php`: `POST /api/v1/telemetry` aceita vitals, grava **sem IP/identificador**, descarta bot por UA, valida schema estrito, rate limit por IP → 429; `daily_metrics` consolida p75 por template de rota — FR-029
- [ ] T133 [P] [US4] `backend/api/tests/Feature/Ops/FailedJobsTest.php`: job falho preserva payload em `failed_jobs`, gera evento de alerta e vai à DLQ — FR-041
- [ ] T134 [P] [US4] `tests/guards/headers.test.ts` (`--url`): CSP **sem** `unsafe-inline`, HSTS, `nosniff`, `Referrer-Policy`, `frame-ancestors 'none'`, `Cache-Control`/`ETag` explícitos e compressão em respostas públicas — FR-015, V8
- [ ] T135 [P] [US4] `tests/guards/telemetry-budget.test.ts`: o módulo de telemetria ≤ 1,5 KB gz e o JS inicial de cada página continua ≤ 50 KB gz — Princípio I

### Implementation for User Story 4 — Invalidação por evento

- [ ] T136 [US4] Porta `backend/api/app/Domain/News/Contract/EdgeCache.php` + caso de uso puro `backend/api/app/Application/News/UseCase/AffectedSurfaces.php` — fazer T129 passar
- [ ] T137 [US4] Adaptadores `backend/api/app/Infrastructure/News/Adapter/{CloudflareEdgeCache,NullEdgeCache}.php` (`POST /zones/{id}/purge_cache` por URL) e listener enfileirado `PurgeEdgeCacheOnNewsChange` — fazer T130 passar
- [ ] T138 [US4] Comando `php artisan pd:purge-all` (invalidação global **só** manual, auditada) em `backend/api/app/Console/Commands/PurgeAll.php` — Princípio XII "último recurso registrado"

### Implementation for User Story 4 — Observabilidade

- [ ] T139 [P] [US4] Integrar `sentry/sentry-laravel` (`backend/api/config/sentry.php`, `bootstrap/app.php`) com `request_id` como tag; `SENTRY_LARAVEL_DSN` vazio = desligado — D2-18
- [ ] T140 [P] [US4] Integrar `@sentry/node` no SSR de `apps/web/src/middleware.ts` e `apps/admin/src/middleware.ts` (**zero Sentry no navegador**) e logger JSON mínimo em `apps/web/src/lib/log.ts`
- [ ] T141 [US4] Agendar `queue:monitor` (profundidade/latência) e um *cron monitor* do `scheduler` em `backend/api/routes/console.php`; configurar DLQ no RabbitMQ em `config/queue.php` — FR-028/041 — fazer T133 passar
- [ ] T142 [US4] Telemetria de campo: migrações `*_create_telemetry_tables.php` (`telemetry_events`, `daily_metrics`), domínio/uso `app/{Domain,Application,Infrastructure}/Analytics/`, `POST /api/v1/telemetry` e job noturno de consolidação — fazer T132 passar
- [ ] T143 [US4] Módulo de cliente `apps/web/src/lib/telemetry.ts` (~1 KB, `PerformanceObserver` direto para LCP/CLS/INP/TTFB, uma `navigator.sendBeacon` por página, template de rota nunca URL com dado), incluído como script externo de **página pública** — fazer T135 passar (D2-19)
- [ ] T144 [US4] Jobs de retenção: `telemetry_events` 30 dias, `daily_metrics` 25 meses, em `backend/api/app/Console/Commands/PruneTelemetry.php` + agendamento

### Implementation for User Story 4 — Entrega e infraestrutura

- [ ] T145 [P] [US4] `infrastructure/caddy/Caddyfile`: cabeçalhos de segurança, `Cache-Control`/`ETag`/compressão, proxy `/api/*` ao Laravel **no mesmo host** (cookie host-only), CSP em **`Report-Only`** com endpoint de relatório — D2-10/17
- [ ] T146 [P] [US4] `infrastructure/docker/{web,admin,api}.Dockerfile` (multi-stage, usuário não-root, sem segredo na imagem)
- [ ] T147 [P] [US4] `infrastructure/compose/{prod,staging}.yml`: caddy, web, admin, api, worker, scheduler, PostgreSQL, Redis, RabbitMQ, volumes e *healthchecks*
- [ ] T148 [P] [US4] `infrastructure/host/bootstrap.sh`: provisionamento reprodutível do VPS (Docker, firewall aceitando só IPs da Cloudflare, usuário de deploy, `0600` em `.env`) — Princípio XII
- [ ] T149 [US4] `.github/workflows/deploy.yml`: `verify` → build de imagens para `ghcr.io/<org>/parnaibadigital-{web,admin,api}:<sha>` → deploy em **staging** (SSH, `compose pull && up -d`, migração aditiva) → smoke + Lighthouse + axe + no-js + headers **na URL real de staging** → *environment approval* → produção; cada passo é um *deployment* do GitHub (**é o `DeliveryRelease`** — D2-22) — FR-024/025/032
- [ ] T150 [US4] `.github/workflows/rollback.yml`: reimplanta a tag da última *deployment* bem-sucedida e roda o smoke; meta ≤ 15 min — FR-026, SC-014
- [ ] T151 [P] [US4] Scripts `scripts/smoke/publish-latency.sh` (V7) e `scripts/smoke/provoke-failure.sh` (V9) e rota de falha provocada `/api/v1/_debug/fail` **somente** em `PD_ENV=staging` (teste garante 404 em produção)
- [ ] T152 [P] [US4] `scripts/backup-pg.sh` (`pg_dump -Fc` horário → bucket R2 **separado**, versionado, criptografado com `age`, retenção 24 h/30 d/12 m) e job no `scheduler` — D2-20 (**RPO 1 h**)
- [ ] T153 [P] [US4] `scripts/restore-drill.sh` (restaura o último dump em Postgres descartável, verifica contagens/FK/última matéria, **cronometra**) e `docs/runbooks/restore-drills.md` (RTO 1 h) — FR-031, SC-013
- [ ] T154 [P] [US4] Runbooks `docs/runbooks/{rollback,secrets-rotation}.md`; segredos por GitHub Environment (`staging`, `production`) entregues como `.env` `0600` — FR-014
- [ ] T155 [US4] Remover `infrastructure/_headers` (e ajustar o teste de integridade da 001 que o referenciar) — a fonte de verdade passa a ser o `Caddyfile` — D2-17
- [ ] T156 [P] [US4] Atualizar `docs/infrastructure.md` com a tabela de **dono, custo estimado e caminho de remoção** de cada peça (Princípio XII) e documentar RPO/RTO
- [ ] T157 [US4] 👤 Provisionar VPS de staging e produção, domínio/DNS e conta Cloudflare; aplicar `infrastructure/cloudflare/` com `tofu apply`; configurar GitHub Environments; contratar R2 — **dependência de provisionamento do spec**
- [ ] T158 [US4] 👤 Criar as regras de alerta no Sentry (novo issue, falha de job, *uptime* em `/healthz`) com destino no canal da redação — SC-012
- [ ] T159 [US4] Executar V6 (`scripts/smoke/admin-edge.sh`) em staging
- [ ] T160 [US4] Executar V7, V8, V9, V11 em staging; **em V8, manter CSP em `Report-Only` por 1 semana sem violação legítima e só então trocar para enforce** no `Caddyfile` (D2-10); registrar tudo em `quickstart-results.md`
- [ ] T161 [US4] **Executar V10 (restauração de backup) em staging antes do lançamento** e registrar data, duração e resultado em `docs/runbooks/restore-drills.md` — SC-013

**Checkpoint**: publicar chega ao leitor em ≤ 60 s; falha vira alerta rastreável; restauração e reversão provadas.

---

## Phase 7: User Story 5 — O veículo é legalmente publicável no Brasil (Priority: P2)

**Goal**: expediente, política de privacidade, consentimento registrado, cancelamento, rotulagem de
patrocinado e atendimento a titulares.

**Independent Test**: V12 (parte de consentimento) e V14 — localizar expediente/privacidade a partir
de toda página pública; assinar newsletter com consentimento registrado; build de produção reprova
com identidade incompleta.

**Depends on**: Foundational (módulo `Newsletter`) e US2 (rate limit). Pode rodar em paralelo à US4.

### Tests for User Story 5 (escrever primeiro; devem falhar)

- [ ] T162 [P] [US5] `tests/guards/legal.test.ts`: com `PD_ENV=production` e `apps/web/src/legal/entity.json` incompleto ou com marcador (`TODO`, `{{…}}`) a construção **reprova** nomeando o campo — D2-21, FR-033
- [ ] T163 [P] [US5] `tests/e2e/legal-links.spec.ts` (`@legal`): 100% das superfícies públicas (as 10 restantes após a retenção) contêm links para `/expediente` e `/privacidade` — SC-015
- [ ] T164 [P] [US5] `tests/seo/legal-pages.test.ts`: `/expediente` (`AboutPage` + `Organization` com `publishingPrinciples` + `BreadcrumbList`) e `/privacidade` (`WebPage` + `BreadcrumbList`), canônica absoluta, entrada em `sitemap-core.xml` — `routes-launch.md`
- [ ] T165 [P] [US5] `backend/api/tests/Feature/Newsletter/SubscribeTest.php`: `consent` ausente/falso → 422; e-mail novo e existente recebem **resposta idêntica** (não revela cadastro); e-mail de confirmação com link assinado e expirável — FR-035
- [ ] T166 [P] [US5] `backend/api/tests/Feature/Newsletter/ConsentTest.php`: confirmar grava `NewsletterConsent` com `purpose`, `text_version` (hash do texto), momento e **sem IP/user-agent**; reinscrição cria novo consentimento sem alterar o antigo; token expirado → 410 — FR-035
- [ ] T167 [P] [US5] `backend/api/tests/Feature/Newsletter/UnsubscribeTest.php`: cancelar em **um** passo (POST one-click e GET assinado), preenche `revoked_at`, idempotente — FR-035
- [ ] T168 [P] [US5] `backend/api/tests/Feature/Newsletter/DataSubjectRemovalTest.php`: o comando de remoção apaga assinatura e consentimentos e grava `AuditEntry` **sem o e-mail em claro** (só hash) — FR-036
- [ ] T169 [P] [US5] `tests/e2e/no-js-newsletter.spec.ts` (projeto `no-js`): formulário → confirmação → agradecimento por `POST` nativo, sem JavaScript — Princípio XI
- [ ] T170 [P] [US5] `tests/seo/sponsored.test.ts`: matéria `sponsored: true` exibe rótulo inequívoco na UI **e** `sponsor` no JSON-LD; anúncio exibe "Publicidade" — FR-006, US5-4

### Implementation for User Story 5

- [ ] T171 [US5] Migrações `backend/api/database/migrations/*_create_newsletter_tables.php` (`newsletter_subscriptions` com `email` citext UNIQUE, `newsletter_consents` append-only) — `data-model.md`
- [ ] T172 [US5] Domínio `backend/api/app/Domain/Newsletter/` (assinatura, consentimento, estados `pending|confirmed|unsubscribed`) + adaptadores `app/Infrastructure/Newsletter/Adapter/` + casos de uso `Subscribe`, `Confirm`, `Unsubscribe`, `RemoveSubject` em `app/Application/Newsletter/UseCase/` — fazer T165–T168 passar
- [ ] T173 [US5] Endpoints públicos `POST /newsletter/subscriptions`, `/confirm`, `/unsubscribe` em `backend/api/app/Http/Controllers/Public/NewsletterController.php`, com rate limiter de US2 e *honeypot* + contrato; e-mail de confirmação via Mailable em `backend/api/app/Mail/ConfirmSubscription.php`
- [ ] T174 [US5] Comando `php artisan pd:remove-subject {email}` em `backend/api/app/Console/Commands/RemoveSubject.php` e runbook `docs/runbooks/dsar.md` (canal por e-mail, prazo de **15 dias**) — FR-036
- [ ] T175 [US5] `apps/web/src/pages/newsletter.astro`: **remover o campo WhatsApp**, texto de consentimento versionado (hash do texto enviado), `POST` nativo para um endpoint Astro `apps/web/src/pages/newsletter/index.ts` que chama a API e responde `303` — D2-23 🔒
- [ ] T176 [P] [US5] Páginas SSR `noindex` `apps/web/src/pages/newsletter/{obrigado,confirmar,cancelar}.astro` (sem cache, sem `Set-Cookie`)
- [ ] T177 [P] [US5] `apps/web/src/legal/entity.json` (campos: razão social, CNPJ, responsável editorial, e-mail do encarregado, endereço) e `scripts/check-legal.ts` (usado por T162) — ligar em `package.json` e em `verify.yml`
- [ ] T178 [P] [US5] Páginas `apps/web/src/pages/expediente.astro` e `privacidade.astro` (`prerender`), JSON-LD por `routes-launch.md`; o **corpo jurídico lê de conteúdo fornecido**, nunca gerado aqui; incluir `expediente`/`privacidade` nas rotas reservadas de `apps/web/scripts/validate-slug-registry.ts`
- [ ] T179 [US5] Rodapé em `packages/ui/src/` com links para `/expediente` e `/privacidade` (um componente → todas as páginas); cobertura de tema — fazer T163 passar
- [ ] T180 [P] [US5] Rótulo de patrocinado: componente em `packages/ui/src/news/` (UI) e `sponsor` no JSON-LD em `apps/web/src/lib/seo/` — fazer T170 passar
- [ ] T181 [US5] 👤 Redação/jurídico fornece o texto da política de privacidade (dados coletados, finalidade, base legal, **prazo de retenção**, canal do titular) e os dados do `entity.json`; sem isso o build de produção **reprova por design** — **dependência de caminho crítico**
- [ ] T182 [US5] Rodar V12 (consentimento e cancelamento) e V14 (legal + segredos); registrar em `quickstart-results.md`

**Checkpoint**: o veículo identifica o responsável, declara o tratamento de dados e registra consentimento.

---

## Phase 8: User Story 6 — O leitor encontra o que procura (Priority: P3)

**Goal**: busca real sobre o acervo publicado, disponível ao publicar, funcional sem JavaScript.

**Independent Test**: publicar matéria e encontrá-la por termo do título e do bairro em seguida
(SC-016), com e sem JS.

**Depends on**: US3.

### Tests for User Story 6 (escrever primeiro; devem falhar)

- [ ] T183 [P] [US6] `backend/api/tests/Feature/Search/PostgresSearchEngineTest.php` (teste de contrato da porta `SearchEngine`): insensível a acento (`acao` acha `ação`), `portuguese` stemming, peso título > subtítulo > corpo, só encontra `published`, despublicada some — FR-037
- [ ] T184 [P] [US6] `backend/api/tests/Feature/Search/FreshnessTest.php`: matéria publicada é encontrável **na mesma transação** (sem reindexação, sem relógio) — SC-016
- [ ] T185 [P] [US6] `backend/api/tests/Feature/Search/SearchEndpointContractTest.php`: `GET /search` válido contra o contrato, paginação, termo sem resultado → corpo vazio válido
- [ ] T186 [P] [US6] `tests/e2e/search.spec.ts` (inclui projeto `no-js`): `GET /busca?q=` por submissão nativa; estado vazio **explicado** com caminho alternativo; resultados `noindex,follow` e canônica sem `q` — US6-2/3, Princípio II

### Implementation for User Story 6

- [ ] T187 [US6] Migração `backend/api/database/migrations/*_add_search_vector_to_news.php`: coluna **gerada** `tsvector` (config `portuguese` + `unaccent`; título A, subtítulo B, corpo C) e índice GIN — D2-12
- [ ] T188 [US6] Adaptador `backend/api/app/Infrastructure/Search/Adapter/PostgresSearchEngine.php` implementando `app/Domain/Search/Contract/SearchEngine.php` (`ts_rank_cd`), vinculado em `AppServiceProvider` — fazer T183/T184 passar
- [ ] T189 [US6] `GET /api/v1/search` em `backend/api/app/Http/Controllers/Public/SearchController.php` com cache de aplicação curto e rate limit — fazer T185 passar
- [ ] T190 [US6] `apps/web/src/pages/busca.astro`: SSR lendo da API, formulário `GET` nativo, `noindex,follow` nos resultados, estado vazio com alternativas — fazer T186 passar
- [ ] T191 [P] [US6] `scripts/measure-search.ts`: mede p95 da busca sobre o acervo real e imprime contra o gatilho do ADR 0008 (p95 > 200 ms → revisar); registrar o resultado em `docs/decisions/0008-busca-postgresql-no-lancamento.md`
- [ ] T192 [US6] Atualizar `docs/decisions/0006-motor-de-busca-meilisearch.md` com o ponteiro para o ADR 0008 e manter `infrastructure/docker-compose.dev.yml` com Meilisearch **não provisionado** em produção

**Checkpoint**: busca real sobre o acervo, sem serviço novo.

---

## Phase 9: User Story 7 — Newsletter, publicidade e métricas funcionam de fato (Priority: P3)

**Goal**: digest entregue, campanhas de venda direta servidas sem custo de CLS, analytics medido.

**Independent Test**: V12 (envio), V13 (CLS com campanha), analytics sem número inventado.

**Depends on**: US3, US4 (telemetria/fila), US5 (assinaturas e consentimento).

### Tests for User Story 7 (escrever primeiro; devem falhar)

- [ ] T193 [P] [US7] `backend/api/tests/Feature/Newsletter/SendDigestTest.php`: `newsletter:send-digest` envia **só** a `confirmed` com consentimento não revogado, filtra por município preferido, inclui só matérias `published` das últimas 24 h, cada e-mail leva `List-Unsubscribe` + `List-Unsubscribe-Post` (RFC 8058), nenhuma matéria → não envia — FR-038
- [ ] T194 [P] [US7] `backend/api/tests/Feature/Advertising/AdSlotTest.php`: `GET /ads/slots/{slot}` rodízio ponderado entre campanhas **ativas na janela**; nenhuma → 204; pausada/expirada nunca é servida — FR-039
- [ ] T195 [P] [US7] `backend/api/tests/Feature/Advertising/AdClickTest.php`: `/ads/click/{id}` conta e responde 302; campanha inativa → 404; `target_url` não-https é recusada na criação
- [ ] T196 [P] [US7] `backend/api/tests/Feature/Advertising/CampaignAdminContractTest.php`: CRUD de `/admin/ads/campaigns` com permissão `ads.manage`; rótulo "Publicidade" não é editável
- [ ] T197 [P] [US7] `backend/api/tests/Feature/Analytics/DailyMetricsTest.php`: consolidação soma views, p75 de vitals, impressões e cliques por dia e template de rota; sem dado → resposta vazia (não zeros inventados) — FR-040
- [ ] T198 [P] [US7] Atualizar `tests/e2e/ads-layout.spec.ts` e `tests/e2e/third-party-failure.spec.ts`: slot reserva altura antes da imagem, **CLS < 0,05** com campanha ativa e com a imagem bloqueada, sem campanha → bloco "Anuncie" da mesma altura, rótulo visível — SC-017
- [ ] T199 [P] [US7] `tests/e2e/admin-analytics.spec.ts`: telas `analytics` e `index` mostram **números medidos ou estado vazio**, nunca valores de demonstração — SC-022, FR-040

### Implementation for User Story 7

- [ ] T200 [US7] Comando agendado `newsletter:send-digest` (07:00 `America/Fortaleza`) em `backend/api/app/Console/Commands/SendDigest.php`, Mailable `app/Mail/DailyDigest.php` com cabeçalhos RFC 8058, envio em lote pela fila; registrar em `routes/console.php` — fazer T193 passar
- [ ] T201 [US7] 👤 Configurar o provedor de e-mail (recomendado Amazon SES) e SPF/DKIM/DMARC no DNS; testar entrega real em staging — dependência de DNS (Assunção 8)
- [ ] T202 [US7] Migração `backend/api/database/migrations/*_create_ad_campaigns_table.php` (`data-model.md`) + domínio `app/Domain/Advertising/` + adaptadores + casos de uso (`ServeAd` com rodízio ponderado, `RegisterClick`) em `app/{Application,Infrastructure}/Advertising/` — fazer T194/T195 passar
- [ ] T203 [US7] Endpoints `GET /ads/slots/{slot}`, `GET /ads/click/{id}` e `/admin/ads/campaigns[/{id}]` em `backend/api/app/Http/Controllers/{Public,Admin}/` + contrato — fazer T196 passar
- [ ] T204 [US7] Slot de anúncio em `packages/ui/src/ads/` renderizado **no servidor** com `aspect-ratio` fixo, rótulo "Publicidade", `rel="sponsored noopener"`; sem campanha → bloco "Anuncie" da mesma altura; **zero script** — fazer T198 passar (D2-24)
- [ ] T205 [US7] Impressões de anúncio via `IntersectionObserver` dentro de `apps/web/src/lib/telemetry.ts` (mesmo beacon; ainda ≤ 1,5 KB gz — T135)
- [ ] T206 [US7] Consolidação de `adImpressions`/cliques em `daily_metrics` e `GET /admin/analytics` em `backend/api/app/Http/Controllers/Admin/AnalyticsController.php` — fazer T197 passar
- [ ] T207 [US7] Painel `apps/admin/src/pages/publicidade.astro` (campanhas reais: criar, pausar, janela, peso, mídia com `alt`)
- [ ] T208 [US7] Painel `apps/admin/src/pages/analytics.astro` e `index.astro` lendo `/admin/analytics` e contagens reais, com `EmptyState` sem dados — fazer T199 passar
- [ ] T209 [US7] `apps/web/src/pages/anuncie.astro`: deixar de ser fachada — substituir o formulário por texto + e-mail comercial real **ou** envio real; sem coleta que nada persiste (P-11)
- [ ] T210 [US7] Rodar V12 (envio), V13 e a verificação de analytics em staging; registrar em `quickstart-results.md`

**Checkpoint**: a audiência gera receita de venda direta, o digest sai, os números são medidos.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: fechar o lançamento. Nenhuma story nova.

- [ ] T211 [P] Atualizar `docs/architecture.md`, `docs/backend.md`, `docs/frontend.md`, `docs/seo.md`, `docs/performance.md`, `docs/editorial-pipeline.md` com o que mudou (SSR, persistência, fluxo editorial, invalidação, telemetria) — Constituição: documentação junto com a mudança
- [ ] T212 [P] Atualizar `README.md` raiz e `backend/api/README.md` com setup de ambiente, `pd:create-admin`, deploy e rollback
- [ ] T213 Rodar `pnpm verify` e `cd backend/api && composer test && composer analyse && composer deptrac` em `main` limpo; zero regressão dos orçamentos
- [ ] T214 Rodar **todo** o `quickstart.md` (V1–V14) em staging e consolidar `specs/002-prontidao-producao/quickstart-results.md`
- [ ] T215 [P] Revisão de segurança do conjunto (`/security-review`): auth, 2FA, CSRF, rate limit, upload, CSP, segredos, trilha de auditoria
- [ ] T216 Rodar `/speckit-analyze` e `/speckit-converge` e tratar o que restar de lacuna entre spec, plan e tasks
- [ ] T217 👤 Checklist de lançamento: política de privacidade revisada (T181), contas de redação com ≥ 2 pessoas com `news.publish` (D2-04), ≥ 1 matéria real aprovada por pessoa ≠ autora, restauração V10 registrada (T161), CSP em enforce (T160), DNS de produção apontado
- [ ] T218 Decisão final de ir ao ar: conferir `SC-001`…`SC-023` contra `quickstart-results.md` e registrar a decisão e o responsável

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → todas as stories. Foundational **bloqueia** tudo.
- **US1 (MVP)** depende só de Foundational. Pode — e deve — ser a primeira entrega.
- **US2** depende de Foundational; **bloqueia US3** (spec: persistir conteúdo exige acesso controlado).
- **US3** depende de US2.
- **US4** depende de US3 (eventos de publicação para a purga) e das tarefas 👤 de infraestrutura.
- **US5** depende de Foundational + US2 (rate limit); **pode rodar em paralelo à US4**.
- **US6** depende de US3.
- **US7** depende de US3, US4 (telemetria/fila) e US5 (assinaturas/consentimento).
- **Polish (10)** depois de todas as stories desejadas.

```text
Setup ─▶ Foundational ─┬─▶ US1 ─────────────────────────────┐
                       └─▶ US2 ─▶ US3 ─┬─▶ US4 ─┐            │
                                       ├─▶ US6  ├─▶ US7 ─────┼─▶ Polish
                              US2 ─▶ US5 ──────┘            │
                                                             ┘
```

### Within Each User Story

- Testes **primeiro** e vistos falhando; depois domínio → casos de uso → adaptadores → controllers → frontend.
- Migrações são **aditivas** (expand→contract): uma entrega nunca exige reverter esquema para reverter aplicação.
- Cada story termina com seu cenário de `quickstart.md` registrado em `quickstart-results.md`.

### Parallel Opportunities

- Setup: T002–T008, T011 em paralelo.
- Foundational: T013/T014/T019, T022–T024, T026, T030 em paralelo; T031–T032 após T001/T002.
- US1: T037–T042 (testes) juntos; T045, T047, T051, T052 em paralelo.
- US2: T057–T066 (testes) juntos; T081/T082, T086/T087 em paralelo.
- US3: T091–T105 (testes) juntos; T125/T126 em paralelo.
- US4: T129–T135 (testes) juntos; T139/T140, T145–T148, T151–T154, T156 em paralelo.
- US5: T162–T170 (testes) juntos; T176–T178, T180 em paralelo.
- **Entre stories**: com equipe, US5 corre ao lado de US4; US6 ao lado de US4/US5.

### Parallel Example: User Story 1

```text
Task: "Teste da guarda em packages/api-client/tests/guard.test.ts"          (T037)
Task: "Teste do detector em tests/guards/no-demo.test.ts"                   (T038)
Task: "Teste de acervo vazio em tests/e2e/empty-state.spec.ts"              (T039)
Task: "Teste de superfícies retidas em tests/seo/withheld-surfaces.test.ts" (T040)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup → Foundational (inclui validar que SSR não regride os 8 portões — T036).
2. **US1**: a guarda de ambiente e a retenção de superfícies. **PARAR E VALIDAR** com V1 e V5.
3. Isto já entrega a garantia mais importante: nenhum caminho publica ficção. **Não é lançável** (sem backend), mas nenhum atalho posterior consegue violar a Advertência editorial.

### Incremental Delivery

1. Setup + Foundational + **US1** → portal incapaz de publicar demonstração.
2. **US2** → painel seguro. 3. **US3** → conteúdo real (primeiro estado em que há *produto*).
4. **US4** em paralelo a **US5** → entrega, operação e conformidade legal. **Aqui nasce o primeiro estado publicável** (US1–US5 = bloqueadores do spec).
5. **US6**, **US7** → capacidades complementares; podem entrar após o lançamento inicial se a redação aceitar, desde que o Princípio XI e FR-002 sigam atendidos.
6. Polish → V1–V14 em staging e decisão de lançamento.

### Caminho crítico do lançamento

`US1 → US2 → US3 → US4/US5 → Polish`. As tarefas 👤 (T157, T158, T181, T201, T217) **não dependem de código** e devem começar **já**, em paralelo: provisionar infraestrutura e redigir o texto legal são o que mais provavelmente atrasa o lançamento.

### Notas

- `[P]` = arquivos diferentes e sem dependência pendente. Não paralelizar tarefas que editam o mesmo arquivo (ex.: `packages/api-client/src/index.ts` em T043/T044).
- Commitar por tarefa ou grupo lógico. Parar em qualquer checkpoint para validar a story.
- **US8 (Diário Oficial, coleta, IA) não tem tarefa.** As guardas que ela exige (aprovação, origem, marca de IA, auditoria) estão nas colunas e no fluxo de US2/US3 (T106–T109) para que a esteira entre sem alterar entidades (FR-046).
- 🔒 marca decisões do plano a confirmar: T005 (busca em PostgreSQL), T007 (SSR), T040/T049 (superfícies retidas), T175 (WhatsApp).
