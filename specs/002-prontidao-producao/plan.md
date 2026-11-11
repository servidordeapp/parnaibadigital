# Implementation Plan: Prontidão para Produção — do protótipo ao portal publicado

**Branch**: `002-prontidao-producao` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-prontidao-producao/spec.md`

**Artefatos desta fase**: [research.md](./research.md) · [data-model.md](./data-model.md) ·
[contracts/](./contracts/) · [quickstart.md](./quickstart.md)

## Summary

Transformar a base demonstrável da fase 001 (149/149 tarefas, 25 superfícies, 8 portões) num
veículo de notícias **publicável**: backend persistente, API, autenticação com papéis e 2FA,
fluxo editorial com aprovação humana, auditoria, busca, newsletter, publicidade de venda direta,
telemetria, conformidade legal, borda protegida e caminho de entrega com reversão. **Nada da
fundação é refeito** (Assunção 2).

Abordagem, derivada da Fase 0 (`research.md`):

- **A fabricação é impossível por construção** (D2-01): `PD_ENV` obrigatório; `mock` só em
  `development|test`; o pacote de mock sai do bundle de produção; varredura do `dist/` a cada
  entrega. Hoje o padrão do transporte é `mock` — o plano troca o padrão perigoso por erro.
- **Renderização**: Astro passa a **SSR com HTML cacheado na borda e purga por evento** (D2-02),
  porque SSG por publicação não garante ≤ 60 s nem município novo sem rebuild. ⚠ Diverge da D-02 da
  001 — ver Complexity Tracking.
- **Núcleo Laravel**: persistência PostgreSQL com Eloquent confinado a `Infrastructure`; máquina de
  estados editorial **no domínio** (`draft → in_review → published ⇄ unpublished`), com
  aprovação ≠ autor; auditoria append-only; versionamento; bloqueio otimista (D2-04/05/08/13).
- **Acesso**: Fortify + Sanctum (mesma origem, cookie *host-only*), RBAC por papel, 2FA obrigatório
  para papéis administrativos, **Cloudflare Access como segunda barreira** (D2-07/17).
- **Operação**: contêineres num VPS por ambiente, deploy por SSH com staging → produção, reversão
  por tag; Cloudflare como código; logs JSON com `request_id` propagado por `Context`; Sentry;
  telemetria própria sem cookie (D2-16/17/18/19).
- **Busca no lançamento: PostgreSQL full-text** atrás da porta existente — exerce o critério de
  reversão que o próprio ADR 0006 escreveu (D2-12). ⚠ Ver "Pontos para o usuário".
- **Conteúdo legal e de identidade nunca é inventado**: o build de produção reprova se o expediente
  estiver incompleto (D2-21).
- **US8 permanece fora**, mas as **guardas** (aprovação, origem, marca de IA, auditoria) são
  instaladas agora, nas mesmas entidades (D2-26, FR-046).

## Technical Context

**Language/Version**: TypeScript 5.9 (Node 24) · PHP 8.4 / Laravel 13 (já no repositório).

**Primary Dependencies (novas)**: `laravel/fortify`, `laravel/sanctum`, `spatie/laravel-permission`,
`vladimir-yuldashev/laravel-queue-rabbitmq`, `league/flysystem-aws-s3-v3`, `intervention/image`,
`sentry/sentry-laravel` · `@astrojs/node`, `@sentry/node` · Caddy, OpenTofu, gitleaks (infra/CI).
**Nenhuma biblioteca de cliente nova.** Resumo e custo de remoção em `research.md`.

**Storage**: PostgreSQL (acervo, auditoria, versões, consentimentos, telemetria agregada) · Redis
(sessão, cache de aplicação, rate limit) · RabbitMQ (fila + DLQ) · Cloudflare R2 (mídia e backups,
buckets separados).

**Testing**: Pest (domínio, contrato, arquitetura, invariantes editoriais) · PHPStan nível 8 ·
Deptrac · Vitest · Playwright + axe · Lighthouse CI · verificações pós-deploy sobre **URL real**
(`scripts/smoke/`, `quickstart.md`). TDD obrigatório para domínio/contrato (Princípio IX).

**Target Platform**: Linux (VPS, contêineres) atrás de Cloudflare; navegadores modernos,
mobile-first, rede móvel regional.

**Project Type**: Monorepo web + API (já existente): `apps/web`, `apps/admin`, `packages/*`,
`backend/api` — acrescido de `infrastructure/` operável e `scripts/smoke/`.

**Performance Goals**: orçamentos vigentes **no endereço real** — Lighthouse ≥ 95 ×4, LCP < 2,0 s,
CLS < 0,05, INP < 200 ms, TTFB < 200 ms em *hit* de borda, ≤ 50 KB de JS gz (telemetria ≈ 1 KB).
Publicação visível ≤ 60 s (SC-006/016).

**Constraints**: zero demonstração em artefato público · permissão **no servidor** · 2FA nos papéis
administrativos · auditoria imutável · CSP sem `unsafe-inline` · sem script de terceiro (anúncio,
analytics, fonte) · nenhum segredo versionado · funcionalidade essencial sem JavaScript (público) ·
RPO/RTO declarados e restauração provada · rollback ≤ 15 min.

**Scale/Scope**: 5 municípios · volume = o que a redação apura (≪ 5/dia automatizados) ·
13 superfícies públicas + 2 novas institucionais (1 retida) · 11 admin + 2 novas (login, 2FA) ·
~35 operações de API novas · 1 VPS por ambiente (2 vCPU/4 GB iniciais).

## Constitution Check

*GATE: avaliado antes da Fase 0 e reavaliado após a Fase 1.* Constituição **v2.0.0**.

| Princípio | Avaliação | Como o plano atende |
| --- | --- | --- |
| **I. Performance** | **PASSA, com divergência declarada** | Orçamentos mantidos e medidos no endereço real (V8). SSR (D2-02) é divergência da letra "SSG por padrão" — **justificada** em Complexity Tracking; HTML sai do cache de borda (TTFB < 200 ms em hit). Anúncio de venda direta = zero JS (D2-24). Telemetria ≈ 1 KB sem lib (justificada em D2-19). |
| **II. SEO geolocalizado** | PASSA | `routes-launch.md` declara schema/canônica/sitemap/vínculo geográfico de cada página nova. Município primário **NOT NULL** no banco (FR-019). 301 por `RedirectRule`, 410 na despublicação. Sitemaps/feeds derivados do acervo (FR-022). |
| **III. Acessibilidade** | PASSA | axe nos dois temas sobre staging; `EmptyState` anunciado; formulários nativos com rótulo/erro associado. |
| **IV. Segurança** | PASSA — *é o foco* | RBAC no servidor, 2FA, rate limit, auditoria imutável, versionamento, CSP sem inline, segredos por Environment + gitleaks. |
| **V. Integridade editorial** | PASSA — *é o foco* | D2-01 + máquina de estados + aprovação ≠ autor + guardas de origem/IA. Nenhum caminho publica sem aprovação (SC-018). Patrocinado rotulado (FR-006). |
| **VI. Design System** | PASSA | Sem componente novo exceto `EmptyState` (verificar existente primeiro) e telas de login/2FA sobre tokens. Remoção de `style=""` reforça a regra. |
| **VII. API-first** | PASSA | Contrato aditivo `openapi-v1-launch.yaml` **antes** de endpoint; cliente tipado único; transporte HTTP implementado sem tocar páginas. Portas `EdgeCache`, `MediaStorage`, `SearchEngine`. |
| **VIII. Monólito modular** | PASSA, 2 módulos acrescidos | `Audit` e `Newsletter` — ver Complexity Tracking; comunicação por eventos, Deptrac intacto. Sem microsserviço. |
| **IX. Testabilidade** | PASSA | TDD no domínio; teste de contrato por endpoint; testes de arquitetura (invariantes); SEO/perf/a11y em staging; testes determinísticos (relógio injetado, sem `sleep`). |
| **X. Observabilidade** | PASSA | Logs JSON + `request_id` em `Context`; DLQ; alertas; CWV de campo; mudança de config rastreável (auditoria + GitHub Deployments). |
| **XI. Progressive enhancement** | PASSA | Newsletter/busca/login por submissão nativa; anúncio sem script; telemetria é melhoria. Admin usa TS para editor (não é leitura pública; registrado). |
| **XII. Simplicidade de infra** | PASSA | Só a pilha fixada; cada peça com dono/custo/remoção (tarefa de `docs/infrastructure.md`). Sem Meilisearch, sem Grafana, sem K8s, sem cofre. |

**Restrições arquiteturais**: stack fixa respeitada (Astro, Laravel 13/PHP 8.4, PostgreSQL, Redis,
RabbitMQ, Cloudflare, R2). Busca: porta `SearchEngine` com adaptador PG (decisão delegada ao plano
pela Constituição). Camadas de cache na ordem borda → Redis → banco; `Cache-Control` e `ETag`
explícitos; invalidação dirigida (D2-09). **ADRs novos exigidos**: 0008 (busca no lançamento),
0009 (Cloudflare como código/OpenTofu), 0010 (SSR com cache de borda), adendo ao 0002 (módulos
`Audit` e `Newsletter`).

**Resultado pré-Fase 0**: sem violação não justificada. **Resultado pós-Fase 1**: idem; as três
divergências (D2-02, D2-12, módulos novos) estão em Complexity Tracking com alternativa rejeitada.

## Rastreabilidade: pendências da auditoria → decisões

| Pendência | Decisão | Pendência | Decisão |
| --- | --- | --- | --- |
| P-01 conteúdo fabricado | D2-01 · D2-26 · D2-25 | P-09 pipeline como código | D2-04 · D2-26 |
| P-02 sem endpoint | contratos · D2-13 | P-10 busca | D2-12 |
| P-03 sem persistência | D2-13 · data-model | P-11 fachadas | D2-19 · D2-23 · D2-24 · D2-25 |
| P-04 admin sem auth | D2-07 | P-12 invalidação | D2-02 · D2-09 |
| P-05 bloqueio é comentário | D2-17 | P-13 CSP `unsafe-inline` | D2-10 |
| P-06 sem entrega | D2-16 | P-14 legal | D2-21 · D2-23 |
| P-07 não observável | D2-18 · D2-19 | P-15 redirects/backup | D2-06 · D2-20 |
| P-08 sem auditoria | D2-08 | | |

## Project Structure

### Documentation (this feature)

```text
specs/002-prontidao-producao/
├── plan.md                         # este arquivo
├── research.md                     # Fase 0 — 26 decisões D2-01…D2-26
├── data-model.md                   # Fase 1
├── quickstart.md                   # Fase 1 — cenários V1–V14
├── contracts/
│   ├── openapi-v1-launch.yaml      # extensão ADITIVA da API v1
│   └── routes-launch.md            # superfícies novas/alteradas/retidas
├── checklists/requirements.md
└── tasks.md                        # Fase 2 — /speckit-tasks (NÃO criado aqui)
```

### Source Code (repository root)

Estrutura existente preservada; **`+` novo · `~` alterado · `−` movido/removido**.

```text
apps/
├── web/
│   ├── astro.config.mjs                    ~ output:'server' + @astrojs/node; inlineStylesheets:'never'
│   ├── src/
│   │   ├── middleware.ts                   + X-Request-Id, Cache-Control/ETag por tipo de página
│   │   ├── legal/entity.json               + dados do veículo (validado no build)
│   │   ├── lib/{telemetry.ts,log.ts}       + beacon ≈1 KB; log JSON
│   │   ├── deferred/diario-oficial.astro   − movido de pages/ (rota deixa de existir)
│   │   └── pages/
│   │       ├── expediente.astro, privacidade.astro        +
│   │       ├── newsletter/{obrigado,confirmar,cancelar}   + SSR, noindex
│   │       ├── newsletter.astro, busca.astro, anuncie.astro, noticia/[slug].astro   ~
│   │       └── (todas as públicas)         ~ estado vazio; sem commentCount/views
│   └── scripts/{check-no-demo.ts,check-csp.ts,check-legal.ts}   + portões novos
├── admin/
│   ├── astro.config.mjs                    ~ output:'server'
│   └── src/
│       ├── middleware.ts                   + GET /admin/session antes de QUALQUER render
│       └── pages/{entrar,seguranca/segundo-fator}.astro  + ; demais ~ dados reais / EmptyState
packages/
├── api-client/src/{index.ts,transports/{http.ts,mock.ts}}   ~ guarda PD_ENV; http implementado; mock via import()
├── types/src/generated/api-v1.ts           ~ regenerado do contrato mesclado
├── ui/                                     ~ rodapé (links legais), EmptyState, slot de anúncio
└── validation/                             ~ schemas de ContentBlock/newsletter/telemetria
backend/api/
├── app/
│   ├── Domain/{News,Editorial,Users,Audit,Newsletter,Advertising,Analytics,Search,Media}/   ~ entidades, estados, eventos, portas
│   ├── Application/…/UseCase/              ~ casos de uso (publicar, aprovar, purgar, enviar digest…)
│   ├── Infrastructure/…/Adapter/           ~ Eloquent, Postgres FTS, R2, Cloudflare, Mail
│   └── Http/{Controllers,Middleware,Requests}   ~ finos; EnsureTwoFactor, RequestId
├── database/migrations/                    + ~15 migrações aditivas (expand→contract)
├── database/seeders/{Municipality,Category,Role}Seeder.php    +
├── config/{fortify,sanctum,permission,logging,queue}.php      +/~
├── deptrac.yaml                            ~ módulos Audit, Newsletter
└── tests/{Domain,Feature,Contract,Architecture}/              ~ Pest
infrastructure/
├── caddy/Caddyfile                         + cabeçalhos de segurança + cache (substitui _headers)
├── compose/{prod,staging}.yml              + pilha por ambiente
├── cloudflare/*.tf                         + OpenTofu: DNS, TLS, cache, WAF, Access
├── host/bootstrap.sh                       + provisionamento reprodutível do VPS
└── _headers                                − removido (ver D2-17)
scripts/
├── smoke/{admin-edge,publish-latency,provoke-failure}.sh      +
└── restore-drill.sh                        +
.github/workflows/
├── verify.yml                              ~ + gitleaks, composer/pnpm audit, check-no-demo/csp/legal
├── deploy.yml                              + build imagens → staging → smoke/perf/a11y → aprovação → produção
└── rollback.yml                            + reimplanta tag da última boa
docs/
├── runbooks/{restore-drills,rollback,secrets-rotation,dsar}.md +
├── infrastructure.md, backend.md, seo.md, performance.md, editorial-pipeline.md   ~ mantidos junto
└── decisions/{0008-busca-postgres,0009-cloudflare-como-codigo,0010-ssr-cache-de-borda}.md +  ; 0002 ~ adendo
```

**Structure Decision**: Monorepo web + API existente, sem novo pacote nem nova aplicação. O
acréscimo estrutural é `infrastructure/` (hoje definição, passa a ser operável) e dois módulos de
domínio. Nenhuma aplicação nova é criada antes de ser necessária (Princípio VIII).

## Complexity Tracking

| Violação / divergência | Por que é necessária | Alternativa mais simples rejeitada e por quê |
| --- | --- | --- |
| **SSR em vez de SSG** (D2-02) — diverge da letra do Princípio I e da D-02 da 001 | SC-006 (≤ 60 s) e SC-008/FR-021 (município novo sem rebuild) são inatingíveis com rebuild por publicação; correção urgente não pode depender de build verde | SSG + rebuild por webhook: mais simples de operar, mas build cresce linear com o acervo, falha de build bloqueia correção e município novo exigiria rebuild. É a escolha certa para acervo pequeno e estável — este não é. **Reversão**: voltar páginas de conteúdo a `prerender`. |
| **Módulos `Audit` e `Newsletter`** (Princípio VIII lista 13 módulos) | Auditoria é transversal (FR-010 cobre conteúdo, permissão e configuração); newsletter tem entidades e regra próprias (consentimento, dupla confirmação) | Embutir em `Users`/`Editorial`: viola coesão e forçaria acesso direto a tabelas alheias — a violação que o Deptrac existe para impedir. Registrado como adendo ao ADR 0002. |
| **Cloudflare via OpenTofu** (tooling novo) | Princípio XII: ambientes reprodutíveis por configuração versionada; Access/WAF/cache/TLS clicados em painel são o "cabeçalho combinado por conversa" | Runbook manual: viável e menos código; rejeitado porque não é verificável nem reprodutível entre staging e produção. **Reversão** documentada. |
| **Busca em PostgreSQL** (D2-12), não Meilisearch | Exerce o critério de reversão do ADR 0006; elimina um serviço e o estado "indexação pendente" | Meilisearch: mais relevância/tolerância a typo, mas um contêiner a operar e a manter sincronizado, para um acervo pequeno. Gatilho de troca é **medido** (p95 > 200 ms ou relevância ruim). |

## Riscos e dependências de caminho crítico

| Risco / dependência | Impacto | Mitigação no plano |
| --- | --- | --- |
| **Conteúdo real não existe** (Dependência do spec) | Lançamento com home vazia | FR-023: acervo vazio é íntegro; **não** é bloqueio técnico. A redação precisa de matérias aprovadas antes de divulgar. |
| **Texto jurídico** (privacidade/expediente) exige pessoa responsável | Build de produção reprova (por design) | D2-21: falha explícita, sem texto inventado. Pode ser preparado em paralelo ao código. |
| **Provedor de VPS e domínio/DNS** não definidos | Sem staging não há V6–V14 | Plano não amarra provedor; `host/bootstrap.sh` reprodutível. Dependência de provisionamento do spec. |
| **≥ 2 contas de redação** (aprovador ≠ autor) | Redação de uma pessoa não publica | D2-04 declara; dependência "contas e papéis". |
| Driver RabbitMQ de terceiro | Fila instável | Saída: driver `redis` por ADR (D2-15); verificar compatibilidade com Laravel 13 na 1ª tarefa. |
| CSP em *enforce* pode quebrar algo legítimo | Página quebrada em produção | 1 semana `Report-Only` em staging antes de aplicar (D2-10). |
| Enumeração de fatos não presentes no spec: `/empresas`, `/eventos`, `/utilidade-publica` exibem demonstração sem origem real | FR-002 violado se publicadas | `routes-launch.md`: retidas como o Diário Oficial, salvo dado real fornecido. **Sinalizado ao usuário.** |

## Pontos para o usuário (decisões do plano que merecem confirmação)

1. **Busca**: o spec (Assunção 4) diz "permanece o ADR 0006 = Meilisearch". O plano escolhe
   **PostgreSQL FTS** com base no critério de reversão do próprio ADR. Confirme, ou volte a
   Meilisearch (custo: +1 serviço e fila de indexação).
2. **SSR com cache de borda** diverge da D-02/Princípio I. Confirme a divergência (ADR 0010).
3. **Aprovador ≠ autor** é regra rígida (D2-04). Redação precisa de ≥ 2 contas com `news.publish`.
4. **`/empresas`, `/eventos`, `/utilidade-publica`**: tratadas como retidas no lançamento (FR-002).
   O spec não as enumera.
5. **WhatsApp removido** da newsletter (D2-23) — dado coletado sem canal de envio.
6. **Sem agente `update-agent-context`**: o repositório não tem `CLAUDE.md`/`AGENTS.md` raiz nem
   o script correspondente em `.specify/scripts/bash/`; etapa de contexto de agente **não executada**.
