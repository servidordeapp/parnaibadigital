# Quickstart: validar a Prontidão para Produção

**Feature**: 002-prontidao-producao · **Plan**: [plan.md](./plan.md)

Guia de **validação**, não de implementação. Cada cenário prova um critério do spec e diz onde roda.
Os cenários V1–V5 rodam localmente/CI; V6–V14 exigem **staging real** (Cloudflare + VPS).

## Pré-requisitos

- Node 24 + pnpm 11 · PHP 8.4 + Composer · Docker.
- `pnpm install --frozen-lockfile` e `composer install` em `backend/api/`.
- Local: `docker compose -f infrastructure/docker-compose.dev.yml up -d` (Postgres, Redis, RabbitMQ).
- Staging: acesso ao GitHub Environment `staging`; conta de teste com papel `editor` e outra com
  `reporter`; 2FA TOTP cadastrado (app autenticador).
- Variáveis (nomes em `apps/*/.env.example` e `backend/api/.env.example`; **valores nunca versionados**):
  `PD_ENV`, `PD_DATA_TRANSPORT`, `PD_API_BASE_URL`.

## Portões que já existem (continuam obrigatórios)

```bash
pnpm verify          # lint · typecheck · tokens · ds-integrity · mocks · test · build · seo · a11y · e2e · perf
cd backend/api && composer test && composer analyse   # Pest + PHPStan + Deptrac
```

---

## V1 — A construção de produção reprova com demonstração (US1 · SC-001/002)

```bash
PD_ENV=production PD_DATA_TRANSPORT=mock pnpm --filter @parnaibadigital/web build   # DEVE falhar
PD_ENV=production pnpm --filter @parnaibadigital/web build                          # DEVE falhar (transporte ausente)
```

**Esperado**: ambos saem com código ≠ 0; a mensagem nomeia `packages/api-client/src/index.ts` e
`PD_DATA_TRANSPORT`; **nenhum** `dist/` publicável. Em seguida, com `PD_ENV=test` + mock, o build
passa e a varredura do artefato (`pnpm test:no-demo`) **encontra** os marcadores — prova que o
detector detecta.

## V2 — Nenhum caminho publica sem aprovação (US2/3 · SC-018/023)

```bash
cd backend/api && ./vendor/bin/pest --group=editorial-invariants
```

**Esperado**: transição `draft → published` impossível; `published` sem `EditorialApproval`
impossível; autor ≠ aprovador; teste de arquitetura lista **todos** os pontos que constroem o estado
`published` e confirma que cada um exige aprovação.

## V3 — Acesso negado no servidor, não na interface (US2 · SC-003)

```bash
pnpm test:e2e --grep @auth-denied
```

**Esperado**: para cada uma das 11 telas + `/entrar` exceção + cada operação de escrita de
`openapi-v1-launch.yaml`, a requisição **sem sessão** recebe `401/302`, o corpo **não** contém dado
editorial; com sessão de papel restrito recebe `403` **e** gera `access.denied` em `audit_entries`.
Papel administrativo sem 2FA recebe `423` em tudo, exceto `enroll-2fa`/`logout`.

## V4 — Persistência, redirecionamento, município novo (US3 · SC-007/008)

```bash
pnpm test:e2e --grep @content-lifecycle
```

**Esperado**: criar → revisar → publicar → reiniciar `api`/`web` → matéria íntegra em notícia, hub,
editoria, busca, RSS e `sitemap-news.xml`. Alterar slug → `301` do antigo (nunca 404; propriedade
testada em cadeias A→B→C). Despublicar → `410`, ausente de feeds/sitemaps/busca. Adicionar um
sexto município **apenas** em `packages/api-client/src/data/municipalities.ts` + seed → hub, feed e
sitemap existem **sem editar** rota/template/script (diff do teste fiscaliza `apps/` e `scripts/`).

## V5 — Acervo vazio íntegro e superfícies retidas (SC-019/021/022)

```bash
pnpm test:e2e --grep @empty-state && pnpm test:seo --grep gazette-withheld
```

**Esperado**: com banco sem matérias, home/hubs/editorias/busca/feeds/sitemaps válidos (XML bem
formado, zero `404`, zero `NaN`, zero card vazio); `/diario-oficial` → 404 e ausente de nav,
sitemaps, feeds e `robots`; telas admin Diário Oficial/Pipeline e as sem origem real mostram
`EmptyState` e **nenhum número**.

## V6 — Acesso restrito efetivo no ambiente publicado (FR-016 · SC-003)  *(staging)*

```bash
scripts/smoke/admin-edge.sh https://admin.homolog.parnaibadigital.com.br
```

**Esperado**: sem credencial do Cloudflare Access → `302` para login do Access / `403`; requisição
direta ao IP de origem (contornando a borda) → **recusada**. (Regra vem de `infrastructure/
cloudflare/`, não de comentário.)

## V7 — Publicar e ver em ≤ 60 s (US4 · SC-006/016)  *(staging)*

```bash
scripts/smoke/publish-latency.sh   # publica matéria de teste via API autenticada e faz polling da URL pública
```

**Esperado**: a matéria, a editoria, o hub, a home, os feeds e `sitemap-news.xml` servem a versão
nova (checagem por `ETag`/conteúdo) **≤ 60 s** (`cf-cache-status` confirma HIT após a purga);
a mesma matéria é encontrada em `/busca?q=<termo do título>` ≤ 60 s. Publicar correção → idem.

## V8 — Cabeçalhos, CSP e orçamentos no endereço real (FR-015/032 · SC-009/010/011)  *(staging)*

```bash
pnpm test:headers --url=$STAGING_URL      # CSP sem 'unsafe-inline'; HSTS; nosniff; Referrer-Policy; frame-ancestors
pnpm test:perf   --url=$STAGING_URL       # Lighthouse >=95 x4, LCP<2,0s, CLS<0,05, JS<=50KB
pnpm test:a11y   --url=$STAGING_URL       # axe WCAG 2.1 AA, 2 temas
pnpm test:e2e --project=no-js --url=$STAGING_URL
```

**Esperado**: zero violação; **CSP em enforce** (após a semana de `Report-Only` sem violação
legítima, D2-10).

## V9 — Observável: falha vira alerta rastreável (US4 · SC-012)  *(staging)*

```bash
scripts/smoke/provoke-failure.sh           # /api/v1/_debug/fail (somente staging) + job que falha
```

**Esperado**: alerta no canal da redação **≤ 5 min**; o evento no Sentry traz `request_id`; buscar
esse id nos logs JSON reconstrói a requisição e o job derivado (`Context` propagado). `failed_jobs`
preserva o payload.

## V10 — Backup restaurado dentro dos objetivos (SC-013)  *(staging, **antes do lançamento**)*

```bash
scripts/restore-drill.sh --from=latest
```

**Esperado**: restauração completa em ≤ **RTO 1 h**, perda ≤ **RPO 1 h**, verificações de
integridade verdes; linha nova em `docs/runbooks/restore-drills.md` (data, duração, resultado).

## V11 — Reversão em ≤ 15 min (FR-026 · SC-014)  *(staging)*

Disparar `deploy.yml` com uma entrega **defeituosa de propósito**, depois `rollback.yml`.
**Esperado**: serviço volta à tag anterior boa; cronometrar ≤ 15 min; smoke V7 passa.

## V12 — Newsletter com consentimento (US5/7 · SC-015)  *(staging)*

Assinar → receber confirmação → confirmar → `NewsletterConsent` gravado (finalidade, texto,
momento, **sem IP**) → executar `php artisan newsletter:send-digest` → e-mail chega com
`List-Unsubscribe-Post` → cancelar em **um** clique → `revoked_at` preenchido, novo digest não
chega. Sem JS: todo o fluxo funciona por `POST` nativo.

## V13 — Publicidade sem custo de CLS (US7 · SC-017)  *(staging)*

Criar campanha ativa + outra pausada; carregar `/noticia/*` e home. **Esperado**: slot reserva
altura antes da imagem; CLS < 0,05 com campanha **e** com imagem bloqueada; rótulo "Publicidade"
visível; sem campanha → bloco "Anuncie" da mesma altura; clique registrado via `/api/v1/ads/click`.

## V14 — Segredos e legal (SC-015/020)

```bash
gitleaks detect --redact && pnpm test:legal   # expediente/privacidade completos; rodapé em 100% das públicas
PD_ENV=production pnpm --filter @parnaibadigital/web build   # com entity.json incompleto => DEVE falhar
```

**Esperado**: zero segredo no histórico; build de produção **reprova** enquanto o expediente tiver
campo vazio/marcador; `/expediente` e `/privacidade` alcançáveis a partir de 100% das públicas.

---

## Critério de pronto para o lançamento

Todos V1–V14 verdes **em staging** + restauração (V10) registrada + política de privacidade
revisada por responsável + ≥ 1 matéria real aprovada por pessoa ≠ autora (dependência de conteúdo
do spec). O plano não declara "pronto" por ausência de falha local.
