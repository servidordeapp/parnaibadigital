# Data Model: Prontidão para Produção

**Feature**: 002-prontidao-producao · **Plan**: [plan.md](./plan.md) · **Research**: [research.md](./research.md)

Escopo: persistência do lançamento. Entidades de **leitura** da 001 (`News`, `Municipality`,
`Category`, `Author`, …) mantêm o contrato de `contracts/openapi-v1.yaml`; aqui estão o esquema
que as sustenta e as entidades novas. Convenções: chaves `ulid` (texto, ordenável); `timestamptz`
UTC; nomes de tabela prefixados pelo módulo dono; **nenhum módulo lê tabela de outro** — cruzam por
contrato/evento (Princípio VIII).

## Mapa de módulos

| Módulo | Tabelas | Estado |
| --- | --- | --- |
| Cities · Neighborhoods | `cities_municipalities`, `cities_neighborhoods` | existente (contrato) → persistido, semeado |
| Categories | `categories` | existente → persistido, semeado |
| Authors | `authors` | existente → persistido |
| News | `news`, `news_neighborhoods`, `news_redirects` | existente → persistido |
| Editorial | `editorial_versions`, `editorial_approvals` | existente (vazio) → implementado |
| Users | `users`, `roles`/`permissions` (adaptador), `two_factor_*` | existente → estendido |
| **Audit** | `audit_entries` | **novo** (ADR 0002 adendo) |
| Media | `media_assets`, `media_derivatives` | existente → implementado |
| Search | *(coluna `tsvector` em `news`; sem tabela própria)* | existente → adaptador PG |
| **Newsletter** | `newsletter_subscriptions`, `newsletter_consents` | **novo** (ADR 0002 adendo) |
| Advertising | `ad_campaigns` | existente → implementado |
| Analytics | `telemetry_events`, `daily_metrics` | existente → implementado |
| Sources · OfficialGazette · AI | — | **sem tabela**: contratos permanecem; US8 |

---

## News (`news`)

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | ulid PK | |
| `slug` | text UNIQUE | minúsculas, sem acento, `^[a-z0-9]+(-[a-z0-9]+)*$`, ≤ 120; **imutável após publicação** (D2-06) |
| `headline`, `standfirst` | text | padrão do DS: `[Bairro] + [fato]` (aviso, não bloqueio) |
| `body` | jsonb | `ContentBlock[]` do contrato; schema estrito (D2-03) |
| `category_slug` | FK | exatamente uma principal |
| `municipality_ibge_code` | text **NOT NULL** FK | **exatamente um município primário** (FR-019) |
| `author_id` | FK | |
| `state` | enum | `draft · in_review · published · unpublished` |
| `version` | int | bloqueio otimista (D2-05); +1 a cada gravação |
| `current_version_id` | FK → `editorial_versions` | |
| `published_at`, `updated_at` | timestamptz | `published_at` só existe em `published`/`unpublished` |
| `sponsored`, `sponsor_name` | bool, text | rótulo na UI e `sponsor` no JSON-LD (FR-006) |
| `cover_media_id` | FK → `media_assets` | `alt` obrigatório |
| `source_ref`, `archived_copy_ref` | text, nullable | **guarda FR-004**; usados pela US8 |
| `ai_assisted`, `ai_provenance` | bool, jsonb nullable | **guarda FR-005** (modelo, versão, instrução) |
| `search_vector` | tsvector **gerada** | `portuguese`+`unaccent`; pesos título A · subtítulo B · corpo C; índice GIN |

**Invariantes (testadas)**
- `state = published` ⇒ existe `editorial_approvals` para a `current_version_id` (SC-018).
- `state ≠ draft` ⇒ `municipality_ibge_code` presente (já garantido por NOT NULL; recusa de publicação
  devolve erro explicativo, FR-019).
- `news_neighborhoods` guarda só bairros **do município primário** (herda a regra de dois níveis, ADR 0005).
- `updated_at` não muda por leitura nem por contagem de telemetria.

### Máquina de estados

```text
            submit               approve+publish             unpublish
 draft ───────────────▶ in_review ───────────────▶ published ───────────▶ unpublished
   ▲                        │  ▲                      │  ▲                     │
   └──── request_changes ───┘  └──── edit (nova ver.) ┘  └──────── republish ──┘
                                     (volta a in_review se alteração substantiva*)
```

Proibido por construção: `draft → published`; `published` sem `EditorialApproval`; aprovador = autor
da versão. (*) Correção de erro de grafia por `editor` com permissão `news.correct` mantém
`published` mas cria nova `ContentVersion` + `EditorialApproval` do corrigente **e** purga da borda
(US4-1) — a regra é decisão de domínio, ver tarefa de implementação.

## ContentVersion (`editorial_versions`)

`id`, `news_id`, `number` (monótono por matéria), `snapshot` (jsonb: título, subtítulo, corpo,
metadados editoriais), `author_id`, `created_at`, `reason` (texto curto). **Append-only**. Diferença
entre versões é calculada na leitura. Recuperar versão = criar **nova** versão copiando o snapshot
(histórico nunca é reescrito).

## EditorialApproval (`editorial_approvals`)

`id`, `news_id`, `version_id` FK, `approver_id`, `origin` (enum `own_reporting | gazette | ingestion`),
`origin_ref` (nullable), `at`. Restrições: `approver_id <> (autor da versão)` (verificada no domínio e
por `CHECK` via função); **append-only**. `origin ≠ own_reporting` não é criável no lançamento (sem
conector), mas o tipo já existe (FR-046).

## RedirectRule (`news_redirects`)

`id`, `from_path` **UNIQUE**, `to_path`, `status` (301), `reason` (`slug_changed`), `news_id`, `at`.
Regras: cadeia colapsada (D2-06); ciclo recusado; `from_path` nunca coincide com um slug publicado
atual (CHECK por trigger); consultada **antes** do 404/410 na resolução de notícia.

## Account / Role (`users` estendida + adaptador RBAC)

`users`: `id`, `name`, `email` UNIQUE (citext), `password`, `status` (`active | suspended`),
`two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `last_login_at`.
Papéis iniciais (dado, não código): `admin`, `editor_chefe`, `editor`, `reporter`, `comercial`
(publicidade/newsletter somente leitura de métricas).

| Permissão | admin | editor_chefe | editor | reporter | comercial |
| --- | :-: | :-: | :-: | :-: | :-: |
| `news.write` (próprias/rascunho) | ✓ | ✓ | ✓ | ✓ | |
| `news.review` / `news.publish` | ✓ | ✓ | ✓ | | |
| `news.unpublish` / `news.slug.change` | ✓ | ✓ | | | |
| `ads.manage` | ✓ | | | | ✓ |
| `analytics.view` | ✓ | ✓ | ✓ | | ✓ |
| `users.manage` · `settings.manage` · `audit.view` | ✓ | | | | |

**Papel administrativo** = `admin` e `editor_chefe` ⇒ 2FA obrigatório (FR-009/SC-004). Conta sem
2FA confirmado nesses papéis fica restrita a `enroll-2fa` e `logout` (D2-07). Mudança de papel e
redefinição de 2FA são auditadas.

## AuditEntry (`audit_entries`)

`id` (bigserial), `at`, `actor_id` (nullable: sistema), `actor_ip_hash` (HMAC, não IP cru),
`request_id` (correlação, D2-18), `action` (`news.published`, `role.changed`, `access.denied`, …),
`subject_type`, `subject_id`, `before` (jsonb), `after` (jsonb).
**Imutável**: `GRANT INSERT, SELECT` ao papel da aplicação; trigger rejeita `UPDATE`/`DELETE`
(D2-08). Índices: `(subject_type, subject_id, at)`, `(actor_id, at)`, `(action, at)`.
Cobertura exigida (SC-005): alteração de conteúdo publicado, papel, permissão, configuração, 2FA
e purga global de cache.

## NewsletterSubscription / NewsletterConsent

`newsletter_subscriptions`: `id`, `email` (citext **UNIQUE**), `municipality_ibge_code` (nullable,
preferência), `status` (`pending | confirmed | unsubscribed`), `confirm_token_hash`,
`confirmed_at`, `unsubscribed_at`, `created_at`.
`newsletter_consents` (**append-only**): `id`, `subscription_id`, `purpose` (`daily_digest`),
`text_version` (hash do texto exibido), `given_at`, `revoked_at` (nullable). Reinscrição cria novo
consentimento; nunca altera o antigo. **Sem IP, sem user-agent.** Exclusão a pedido do titular
(FR-036) remove assinatura+consentimentos e grava `AuditEntry` sem o e-mail em claro (apenas hash).

## AdCampaign (`ad_campaigns`)

`id`, `slot` (enum dos espaços existentes nos layouts), `advertiser`, `media_id`, `alt`,
`target_url` (https, validada), `starts_at`, `ends_at`, `weight` (1–10), `status`
(`draft | active | paused`), `clicks` (contador agregado na consolidação). Janela ativa = `status =
active ∧ now ∈ [starts_at, ends_at]`. Rótulo "Publicidade" não é campo editável.

## Telemetry (`telemetry_events`, `daily_metrics`)

`telemetry_events`: `id`, `at`, `path_template` (ex.: `/noticia/[slug]` — **nunca** o slug/URL com
dado), `lcp_ms`, `cls`, `inp_ms`, `ttfb_ms`, `ad_impressions` (jsonb), `is_bot=false` (bots
descartados antes de gravar). **Sem IP, sem identificador.** Retenção: 30 dias.
`daily_metrics`: `(day, path_template, views, lcp_p75, cls_p75, inp_p75, ttfb_p75, ad_impressions,
ad_clicks)` — alimenta a tela de analytics (FR-040). Retenção: 25 meses.

## Registro operacional externo — DeliveryRelease (sem tabela)

Fonte: **GitHub Deployments** dos Environments `staging`/`production` (SHA, ator, momento, resultado
dos portões, link do *run*) + imagens imutáveis no GHCR (a "referência de reversão" é a tag da
última *deployment* bem-sucedida). Ver D2-22.

---

## Fora deste modelo (US8, pós-lançamento)

`Source`, `Connector`, `RawDocument`, `NormalizedContent`, `IngestionRun`, documentos do Diário
Oficial. **FR-046 verificável**: nenhuma tabela acima precisa de `ALTER` destrutivo para a esteira
entrar — `origin`, `source_ref`, `archived_copy_ref`, `ai_assisted`, `ai_provenance` já existem.
