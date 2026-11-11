# Research: Prontidão para Produção

**Feature**: 002-prontidao-producao · **Date**: 2026-08-12 · **Plan**: [plan.md](./plan.md)

Cada decisão nomeia o que resolve (P-nn da auditoria do spec, FR/SC), a alternativa mais simples
considerada e o critério de reversão. Numeração `D2-nn` para não colidir com os `D-nn` da fase 001.

Nenhum `NEEDS CLARIFICATION` restou: o spec decidiu o escopo e o plano decide a arquitetura
(Constituição, "Fluxo de Desenvolvimento"). Duas decisões **divergem** de texto anterior e estão
sinalizadas com ⚠ — D2-02 (renderização) e D2-12 (motor de busca).

---

## A. Integridade editorial

### D2-01 — Portão de ambiente: demonstração não constrói para público (P-01 · FR-001/002 · SC-001/002)

**Fato verificado**: `packages/api-client/src/index.ts` resolve `PD_DATA_TRANSPORT` e, **quando a
variável está ausente, devolve `mock`**. Um deploy esquecido de variável publicaria ficção.
O padrão seguro hoje é o padrão perigoso.

**Decisão** — três camadas, nenhuma depende de disciplina:

1. **`PD_ENV` obrigatório** (`development | test | staging | production`). Ausente ou inválido
   → falha. `getDataClient()` só aceita `mock` quando `PD_ENV ∈ {development, test}`; em
   `staging`/`production` com `mock` (ou com transporte ausente) lança erro que nomeia
   `packages/api-client/src/index.ts` e `PD_DATA_TRANSPORT` (cenário 1 da US1).
2. **O pacote de mock deixa de ser importável por código de produção**: `createMockClient` passa
   a `await import()` dinâmico, atrás da guarda. Em build de produção o bundler não o inclui —
   não é só proibido, é ausente.
3. **Varredura do artefato**: teste lê o `dist/` e reprova se encontrar qualquer marcador de
   demonstração (hosts `*.example`/`.example.com`, e todo `slug`/`headline`/nome de autor/empresa
   derivado de `mock/data/` **calculado em tempo de teste**, não listado à mão — lista à mão
   envelhece). Roda em toda entrega (SC-001) e também sobre a resposta HTML de staging.

**Alternativas**: só a guarda 1 — rejeitada, `import` estático ainda embute dados no bundle e uma
variável errada em outro ponto (ex.: um segundo `astro.config`) a contorna. Só revisão humana —
FR-001 proíbe.
**Reversão**: nenhuma; é guarda, não feature.

### D2-02 — ⚠ Renderização: Astro SSR com HTML cacheado na borda, não SSG por publicação (P-12 · FR-021/030 · SC-006/008)

**Diverge de**: D-02 da 001 (`output: 'static'`) e da letra do Princípio I ("SSG por padrão; SSR
apenas quando depende de dado por requisição"). Registrado em Complexity Tracking.

**O problema**: com conteúdo vindo de banco, SSG significa **reconstruir e reimplantar o site
inteiro a cada publicação**. Três consequências medidas contra o spec:

- SC-006 pede visibilidade em ≤ 60 s; build + upload + propagação de um site cujo tamanho cresce
  linearmente com o acervo não tem teto garantido.
- Uma correção urgente fica refém de o build passar. Falha de build = não consegue corrigir
  manchete errada.
- FR-021/SC-008 pedem município novo sem tocar script; com SSG, "sem rebuild" é impossível.

**Decisão**: `apps/web` passa a `output: 'server'` (adapter Node, em contêiner). Páginas
institucionais (`/expediente`, `/privacidade`, `/anuncie`, `/utilidade-publica`) ficam
`export const prerender = true`. Páginas de conteúdo (notícia, hub, editoria, autor, home, feeds,
sitemaps) renderizam sob demanda **e são servidas do cache da borda**:

- `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400` (notícia) e
  `s-maxage=60` (home e listagens que mudam mais);
- `ETag` calculado do `updatedAt` + versão do template;
- **invalidação por evento** (D2-09) — o TTL é rede de segurança, não estratégia (Princípio XII).

Isto **cumpre** a ordem de cache da Constituição (borda → Redis → banco) e a regra "TTL curto não
compensa ausência de estratégia": o TTL de 5 min existe, mas a publicação purga em segundos.
TTFB < 200 ms vale para *hit* de borda, como o Princípio I já escreve.

**Alternativas**:
- *SSG + rebuild por webhook* — a mais simples de operar; rejeitada pelos três motivos acima.
  Seria a escolha certa para ≤ ~50 matérias/mês e sem município novo; não é o caso.
- *ISR de terceiros (Vercel/Netlify)* — fora da stack fixa (Cloudflare) e cria fornecedor novo.
- *Cloudflare Workers/Pages Functions* — troca de runtime e adapter por ganho que o VPS já dá.

**Efeito nos portões**: SEO, JS-budget e a11y hoje leem `dist/` estático. Passam a rodar contra o
**servidor construído** (`node dist/server/entry.mjs`, `PD_ENV=test`, transporte mock) — a
semântica dos testes é a mesma; muda só de onde o HTML vem. Custo contabilizado em T-fases de
tarefas (tasks).
**Reversão**: se a operação do contêiner SSR se mostrar custosa, as páginas de conteúdo voltam a
`prerender` com rebuild incremental; as rotas e o contrato não mudam.

### D2-03 — Corpo da matéria permanece `ContentBlock[]`; saneamento é estrutural (FR-013 · US3-6)

**Fato verificado**: o contrato já define o corpo como lista de blocos (`paragraph`, `heading`,
`list`, `quote`, `image`) com **texto puro** — não há HTML no modelo.

**Decisão**: não introduzir HTML nem Markdown no corpo. Validação por `FormRequest` com schema
estrito (tipo de bloco, `level` 2–4, tamanho máximo, `MediaRef` existente); texto é **escapado na
saída** por construção (Astro escapa por padrão; nenhum `set:html` no corpo). Ausência de HTML
elimina a classe inteira "marcação perigosa persistida" — não é filtrada, é inexpressável.

**Alternativas**: HTMLPurifier/`mews/purifier` com editor rich-text — rejeitado: exige editor de
~100 KB+ no admin, superfície de XSS e um allowlist a manter. Markdown — rejeitado: reintroduz
HTML embutido como caso de borda.
**Reversão**: se a redação precisar de negrito/link inline, adiciona-se um bloco/`marks`
aditivo no schema (mudança aditiva na mesma versão) — ainda sem HTML.

### D2-04 — Fluxo editorial: quatro estados, aprovação por pessoa distinta (FR-003/045 · SC-018/023)

**Estados**: `draft → in_review → published ⇄ unpublished`. Transições ilegais (`draft → published`)
são **impossíveis no domínio**, não validadas na borda: a máquina de estados é um objeto de
domínio (`Domain/Editorial`) e o único construtor de `published` exige um `EditorialApproval`.

**Aprovação**: `EditorialApproval(version, approver, origin, at)`. `approver ≠ author` da versão
(quatro olhos). Origem = `own_reporting` no lançamento (FR-045); o campo existe como enum para a
esteira (`gazette`, `ingestion`) entrar sem alterar a entidade (FR-046).

**Teste do SC-018** ("tentar cada caminho conhecido"): teste de arquitetura enumera **toda** classe
que possa produzir o estado `published` (por busca no código via Pest arch + teste de
propriedade sobre a máquina) e falha se existir caminho sem aprovação.

**Risco aceito e declarado**: redação com uma única pessoa com papel de editor não consegue
publicar texto próprio. A Dependência "Contas e papéis da redação" do spec cobre isso (≥ 2 contas).
**Alternativa**: permitir autoaprovação para `editor_chefe` — rejeitada: é exatamente o atalho que
o Princípio V existe para impedir; reabrir exige decisão do spec, não do plano.

### D2-05 — Conflito de edição: bloqueio otimista por `version` (Edge Case "duas pessoas")

Coluna `version` inteira em `news`; escrita exige `If-Match: "<version>"`; divergência → `409`
com a versão atual no corpo. A interface mostra diferença entre a versão do usuário e a atual
(reaproveita a comparação de `ContentVersion`, FR-011). Sem lock pessimista, sem WebSocket.

### D2-06 — Despublicação e mudança de slug (FR-020 · SC-007)

- **Slug alterado** → `RedirectRule(from → to, 301)` criada **na mesma transação** da alteração.
  Cadeias são colapsadas (A→B, depois B→C vira A→C, B→C); ciclo é recusado no domínio; `from` é
  único. O endereço antigo **nunca** responde 404 (teste de propriedade).
- **Despublicada** → `410 Gone` com página explicativa (`noindex`); some de feeds, sitemaps,
  busca e hub; é purgada da borda. Republicar restaura `200` no mesmo slug.
- Slug de matéria **publicada** é imutável por padrão e só muda por ação explícita "alterar
  endereço" (gera o redirecionamento). Slug de rascunho é livre.

---

## B. Acesso e segurança

### D2-07 — Autenticação: Laravel Fortify (headless) + Sanctum SPA, mesma origem (P-04 · FR-007/008/009/012)

**Decisão**: `laravel/fortify` sem views (login, 2FA TOTP, recovery codes, confirmação de senha) +
`laravel/sanctum` modo SPA (cookie de sessão, CSRF). Sessão em **Redis**. Papéis e permissões em
`spatie/laravel-permission`, encapsulada num adaptador de `Infrastructure/Users` atrás de uma
porta de domínio (Deptrac continua válido).

**Mesma origem**: o reverse proxy do admin roteia `/api/*` para o Laravel no **mesmo host**
`admin.parnaibadigital.com.br`. O cookie é *host-only* — **não é enviado a `www`**, o que protege o
cache da borda (um `Cookie` de sessão em requisição pública derrubaria a cacheabilidade) e elimina
CORS. O portal público fala com a API **servidor-a-servidor** (rede interna) e só expõe ao
navegador dois pontos: formulário de newsletter (via endpoint do próprio Astro) e telemetria.

**Servidor decide** (FR-008): toda rota `/api/v1/admin/*` passa por `auth:sanctum` +
`EnsureTwoFactor` + `can:<permissão>`. O middleware do Astro admin **também** consulta
`GET /api/v1/admin/session` a cada requisição de página antes de renderizar qualquer dado
(cenário 1 da US2: nenhuma resposta revela dado editorial).

**2FA obrigatório** para papéis administrativos (`admin`, `editor_chefe`): conta com papel
administrativo e sem 2FA confirmado só alcança a tela de cadastro do fator e logout. **Perda do
fator** (Edge Case): recovery codes (Fortify) → ou outro `admin` redefine o fator da conta, ação
auditada e que força novo cadastro; desligar o 2FA sem substituí-lo não existe como operação.

**Rate limit** (FR-012): `RateLimiter` em Redis — login por `e-mail+IP` (5/min) e por IP (20/min);
endpoints públicos de escrita (newsletter, telemetria) por IP; leitura pública tem limite folgado
na borda (regra de WAF no Cloudflare, D2-17).

**Alternativas**: Passport/OAuth — complexidade de cliente OAuth sem terceiro a autorizar.
JWT em storage do navegador — pior contra XSS e sem revogação trivial. Autenticar só na borda
(Cloudflare Access) — não satisfaz FR-008 ("verificar no servidor"); Access entra como **segunda
barreira** (D2-16), nunca como a única.

### D2-08 — Auditoria imutável e versionamento (P-08 · FR-010/011 · SC-005)

- **`audit_entries`**: tabela *append-only*. Imutabilidade por três camadas: (1) o papel de banco
  da aplicação **não tem `UPDATE`/`DELETE`** na tabela (`GRANT INSERT, SELECT` apenas); (2)
  *trigger* `BEFORE UPDATE OR DELETE` que levanta exceção (cinto e suspensório contra papel
  superuser mal usado em migração); (3) nenhum método de escrita além de `append()` no domínio.
- **Escritores**: listeners de **eventos de domínio** (`NewsPublished`, `RoleChanged`,
  `SettingChanged`, `AccountTwoFactorReset`, …) — módulos não escrevem em tabela alheia
  (Princípio VIII). Auditoria vira módulo próprio `Audit`, que só **consome** eventos.
- **Tentativa recusada também é auditada** (US2-3): o handler de `AuthorizationException`
  emite `AccessDenied`.
- **Versões**: `content_versions` (snapshot completo do `ContentBlock[]` + metadados por versão,
  `author`, `at`). Diferença calculada sob demanda, não armazenada.

**Alternativa**: `owen-it/laravel-auditing` — rejeitada: audita *model events* (acopla auditoria
ao Eloquent, contra a regra de domínio puro) e não garante imutabilidade.
**Teto declarado (`ponytail`)**: sem cadeia de hash/assinatura; adicionar se houver requisito de
não-repúdio perante terceiros.

### D2-09 — Invalidação dirigida por evento de publicação (P-12 · FR-030 · SC-006)

Porta de domínio `EdgeCache` (`Domain/News/Contract`) com adaptador Cloudflare
(`POST /zones/{id}/purge_cache`, `files: [...]`) e adaptador nulo (dev/test). O caso de uso
`AffectedSurfaces(news)` é **função pura** que devolve as URLs: a matéria, cada editoria da matéria
(página 1), o hub do município primário (página 1) e do bairro, o autor, a home, os feeds RSS
(global, da editoria, do município) e `sitemap-news.xml`. Listener enfileirado em RabbitMQ chama o
adaptador (lotes de ≤ 30 URLs, limite da API).

- Purga por **URL**, não por tag: tag de cache exige plano Enterprise; o conjunto afetado é
  pequeno e conhecido, então a purga exata é viável.
- **Teto declarado**: páginas ≥ 2 de listagem não são purgadas (deslocam-se por inserção) e
  vivem do TTL de 5 min. Aceitável: é navegação de arquivo, não a correção urgente.
- Invalidação global só por comando manual registrado em auditoria (Princípio XII: "último recurso
  registrado").
- Falha da purga → job falho com *backoff* + alerta (FR-041); nunca silenciosa.

### D2-10 — CSP sem `unsafe-inline` (P-13 · FR-015)

**Fato verificado** (`infrastructure/_headers`): `script-src 'self' 'unsafe-inline'` e
`style-src 'self' 'unsafe-inline'`.

**Decisão**: eliminar a necessidade, depois remover as exceções.
1. `build.inlineStylesheets: 'never'` — CSS sempre externo e com hash no nome.
2. Scripts de enriquecimento são módulos externos; nenhum `<script>` inline executável. Blocos
   `<script type="application/ld+json">` são **dados**, não são avaliados pela CSP.
3. Atributos `style=""` são auditados e removidos em favor de classes/tokens (também reforça o
   Princípio VI). Resíduo irredutível usa `style-src-attr 'unsafe-hashes'` com hash — nunca
   `'unsafe-inline'`.
4. Teste de build varre o HTML gerado e reprova qualquer `<script>` executável inline,
   `on*=` e `style=` fora da lista de hashes.
5. CSP em **`Report-Only` por uma semana em staging**, coletando violações, antes de aplicar.

**Reversão**: se um item legítimo não puder ser externalizado, usa-se *nonce* por resposta (o SSR
da D2-02 viabiliza) — mas nonce quebra cache de borda; é último recurso.

### D2-11 — Segredos e cadeia de suprimento (FR-014 · SC-020)

- **Detecção**: `gitleaks` como portão de CI (histórico + diff) — falha a entrega.
- **Guarda do frontend**: teste de build reprova se qualquer variável sem prefixo `PUBLIC_`
  aparecer no `dist/` ou no bundle de cliente.
- **Armazenamento**: segredos em **GitHub Environments** (`staging`, `production`) por ambiente,
  entregues ao host como arquivo `.env` de modo `0600` na implantação; rotação documentada no
  runbook. Nenhum cofre novo — Princípio XII.
- `composer audit` e `pnpm audit --prod` como portão de severidade `high`+.

---

## C. Conteúdo, persistência e busca

### D2-12 — ⚠ Busca no lançamento: PostgreSQL full-text, Meilisearch não provisionado (P-10 · FR-037 · SC-016)

**Diverge de / exerce**: Assunção 4 do spec diz que "o motor **permanece o do ADR 0006**"
(Meilisearch). O ADR 0006 porém **declara o seu próprio critério de reversão**: *"se o volume
indexado couber confortavelmente em busca full-text do PostgreSQL com relevância aceitável […]
implementa-se o `SearchEngine` sobre o PostgreSQL e o Meilisearch nunca sobe — vitória do
Princípio XII, não decisão revertida."* O volume do lançamento é o que a redação apura à mão
(Assunção 6), não ~5/dia automatizados. O gatilho do ADR está atendido **por construção**.

**Decisão**: adaptador `PostgresSearchEngine` implementando a porta `SearchEngine`:
coluna gerada `tsvector` (config `portuguese` + `unaccent`) sobre título, subtítulo e corpo, com
pesos (título A, subtítulo B, corpo C), índice GIN; classificação `ts_rank_cd`. Atualizada
**na mesma transação** da publicação ⇒ SC-016 (≤ 60 s) é trivialmente satisfeito, sem fila de
indexação nem estado "pendente" (e o Edge Case "motor de busca indisponível" desaparece: o motor
é o banco).

**Mantém-se**: a porta, o `docker-compose.dev.yml` com Meilisearch (não usado), o ADR 0006 —
que ganha adendo (ADR 0008) registrando que o gatilho foi exercido.
**Reversão (mensurável)**: segundo adaptador da mesma porta quando a latência p95 da busca > 200 ms
com o acervo real, ou quando termos reais dos leitores mostrarem relevância inaceitável.
**Ação do usuário**: confirmar este uso do critério do ADR (ver Resumo do plano).

### D2-13 — Persistência: PostgreSQL, Eloquent só em `Infrastructure` (P-03 · FR-017/019)

- Migrações por módulo; modelos Eloquent **privados** ao adaptador; o domínio expõe entidades e
  *repository ports* (Princípio VIII, regra do Deptrac mantida — nenhuma exceção nova).
- `news.municipality_ibge_code` `NOT NULL` com FK para `municipalities(ibge_code)` — "exatamente
  um município primário" (FR-019) é restrição de **banco**, não só validação. Bairros ficam numa
  tabela pivô (secundários).
- **Municípios e bairros são dado semeado de arquivo versionado**
  (`packages/api-client/src/data/municipalities.ts` é a origem existente) por
  `MunicipalitySeeder` idempotente no deploy. Adicionar o sexto município = editar esse arquivo de
  dados + deploy: nenhuma rota, template ou script muda (FR-021/SC-008). O validador de colisão
  de slug da 001 (`validate-slug-registry.ts`) segue sendo portão de CI sobre esse mesmo arquivo —
  **fonte única**, sem duplicar a lista de rotas reservadas em PHP.
- Datas em `timestamptz` UTC; apresentação em `America/Fortaleza`.

### D2-14 — Mídia: R2 atrás da porta `MediaStorage`, derivadas no servidor (Constituição · mídia)

Adaptador Flysystem S3 (R2) para a porta existente `MediaStorage`. Upload valida tipo por
conteúdo (não por extensão), limita tamanho, remove metadados EXIF (inclusive GPS — privacidade
do colaborador). Derivadas (AVIF + WebP + larguras) geradas por job (`intervention/image` com
driver `imagick`/`vips`). Matéria pode ser **publicada com derivada pendente**: serve o original
redimensionado pela borda até o job concluir (Edge Case "armazenamento de mídia").

### D2-15 — Fila: RabbitMQ via driver da comunidade, com saída de emergência

Constituição fixa RabbitMQ; o Laravel não tem driver oficial. Usa-se
`vladimir-yuldashev/laravel-queue-rabbitmq` (mantido, compatível com Laravel 13 — **verificar
versão na tarefa de implementação**). Falha → `failed_jobs` (payload preservado) **e** DLQ do
RabbitMQ; ambos alertam (FR-041).
**Risco**: pacote de terceiro com um mantenedor. **Saída**: driver `redis` (já exigido para
sessão/cache) por ADR de substituição — troca de configuração, não de código de domínio.

---

## D. Entrega, operação e observabilidade

### D2-16 — Hospedagem e entrega: um VPS por ambiente, contêineres, deploy por SSH (P-06 · FR-024/025/026 · SC-014)

**Premissa explícita** (a Assunção 8 cobre domínio/DNS, não o host): um VPS Linux por ambiente
(2 vCPU / 4 GB iniciais), provedor a escolher por custo/região — **dependência de provisionamento
já listada no spec**; o plano não amarra o provedor.

**Pilha por ambiente** (`infrastructure/compose/`): Caddy (reverse proxy + cabeçalhos) · `web`
(Astro Node) · `admin` (Astro Node) · `api` (Laravel, FrankenPHP/php-fpm) · `worker` · `scheduler` ·
PostgreSQL · Redis · RabbitMQ. R2 e Cloudflare são externos.

**Entrega** (`.github/workflows/deploy.yml`): `verify` (os 8 portões + novos) → build de imagens
`ghcr.io/<org>/parnaibadigital-{web,admin,api}:<sha>` → **deploy em staging** → smoke + Lighthouse
+ axe **sobre a URL real de staging** (FR-032) → *environment approval* → produção. Cada passo é
um *deployment* do GitHub (ator, momento, resultado, SHA) — **isto é o `DeliveryRelease`**: não há
tabela, o GitHub Environments já é o registro (ver D2-22).

**Reversão (SC-014 ≤ 15 min)**: workflow `rollback.yml` reimplanta a tag da última *deployment*
bem-sucedida (`docker compose pull && up -d`, mesmas imagens imutáveis). Migrações são
**aditivas por padrão** (expand → contract em duas entregas), o que torna o *rollback* de
aplicação seguro sem *rollback* de esquema. Teste de reversão é cenário de aceite (quickstart).

**Alternativas**: Kubernetes — Princípio XII proíbe pela escala. PaaS (Render/Fly/Railway) —
reduz operação, mas conflita com RabbitMQ+Postgres+Redis fixados e eleva custo recorrente;
reavaliável por ADR. Hospedagem compartilhada (skill `laravel-project-setup`) — **inviável**:
exige RabbitMQ/Redis/processos de longa duração.

### D2-17 — Borda: Cloudflare como código (OpenTofu) e Access como 2ª barreira (P-05 · FR-016 · SC-003)

**Fato verificado**: o bloqueio atual é `# Access-Control: allow-ip …` — um comentário, **e** não
é diretiva válida do formato `_headers`. Além disso `_headers` é consumido por Cloudflare Pages/
Netlify; num VPS com Caddy **ninguém o lê**.

**Decisão**:
- Cabeçalhos de segurança e `Cache-Control` passam à fonte de verdade **`infrastructure/caddy/
  Caddyfile`** (versionado, testável). `_headers` é removido (ou gerado do Caddyfile, se o teste
  de integridade da 001 ainda o referenciar — decidir na tarefa).
- **Cloudflare Access** (Zero Trust, plano gratuito) protege `admin.*` e `homolog.*`: política por
  e-mail/IdP da redação. É a *segunda* barreira; a primeira é a autenticação do Laravel (D2-07).
  Substitui "faixa de IP da redação" — IP de redação com jornalista em campo, em 4G, não funciona.
- **Verificação de FR-016**: teste pós-deploy requisita `admin.*` sem credencial de Access e
  exige `302`→login do Access / `403`; requisita direto ao IP de origem e exige recusa (origem só
  aceita Cloudflare — *Authenticated Origin Pulls* ou allowlist de IPs da Cloudflare no firewall).
- **Cloudflare como código**: OpenTofu em `infrastructure/cloudflare/` — DNS, TLS *Full (strict)*
  com Origin CA, regra de cache (respeitar `s-maxage`), regra de WAF/rate-limit, aplicações Access.
  Justificativa: Princípio XII exige ambientes reprodutíveis; ~10 recursos não justificam outra
  ferramenta, mas justificam *não* clicar em painel.
  **Novo tooling ⇒ ADR 0009**. Reversão: documentar o passo a passo manual e abandonar o `tofu`.

### D2-18 — Observabilidade: logs JSON + Sentry + telemetria própria (P-07 · FR-027/028/029 · SC-012)

- **Logs**: canal `stack` do Laravel com `JsonFormatter` em `stderr`; Astro SSR usa `pino`-like
  mínimo (uma função que escreve JSON — sem dependência nova). Cada requisição recebe
  `X-Request-Id` (ULID; aceita o de entrada se válido), colocado no **`Context` do Laravel**,
  que **se propaga automaticamente para jobs enfileirados** — FR-027 por recurso nativo, sem
  código de propagação.
- **Erros e alertas**: Sentry (`sentry/sentry-laravel`; `@sentry/node` no SSR do Astro — **zero
  JavaScript de Sentry no navegador**, preserva o orçamento). Regra de alerta "novo issue" e
  "falha de job"; e-mail + canal da redação. Monitor de *cron* para o `scheduler`.
  SC-012 (5 min): alerta de novo issue é imediato. Rastreio alerta → requisição pelo
  `request_id` como tag do evento.
- **Fila**: `queue:monitor` agendado, alertando profundidade/latência; `failed_jobs` visível.
- **Disponibilidade**: *uptime monitor* (Sentry) em `/healthz` (verifica Postgres, Redis, RabbitMQ).
- **Core Web Vitals de campo e analytics**: ver D2-19.

**Alternativa**: Grafana/Prometheus/Loki — rejeitado: operar três serviços para equipe pequena.
**Reversão**: Sentry atrás de configuração (`SENTRY_DSN` vazio = desligado); trocar fornecedor não
toca domínio.

### D2-19 — Telemetria própria, sem cookie e sem terceiro (P-11 · FR-029/040 · SC-017)

Um único módulo de cliente (~1 KB gz, `PerformanceObserver` direto para LCP/CLS/INP/TTFB, sem a
biblioteca `web-vitals`) envia **uma** `navigator.sendBeacon` por página para
`POST /api/v1/telemetry`: `{path-template, vitals{lcp,cls,inp,ttfb}, adImpressions[]}`. Servidor:
não grava IP nem identificador; filtra bots por UA; grava linhas em `telemetry_events` e consolida
em `daily_metrics` por *job* noturno. Contagem de visualização = linha por carregamento.

- Sem cookie/identificador ⇒ **sem banner de consentimento** e sem dado pessoal (LGPD simples);
  declarado na política de privacidade.
- Sem JS ⇒ vitals não existem (correto: não há o que medir); a **visualização** de leitor sem JS é
  contada por *access log* da borda **fora do escopo do lançamento** (teto declarado).
- A tela de analytics lê `daily_metrics`; **sem dados → estado vazio** (FR-040). Os contadores
  inventados do protótipo (`views`, `commentCount`) saem da UI pública.

**Alternativas**: Cloudflare Web Analytics (script de terceiro, CSP e Princípio XI); Plausible/
Umami (mais um serviço). Ambos viáveis como reversão se a equipe quiser mais que a tela atual.

### D2-20 — Backup e restauração (P-15 · FR-031 · SC-013)

**Objetivos declarados**: **RPO 1 h · RTO 1 h** (volume de escrita editorial é baixo; 1 h de
perda equivale a poucas matérias, recuperáveis do rascunho/colaborador).
**Método**: `pg_dump -Fc` horário para um bucket R2 **separado**, com versionamento e retenção
(24 h horárias, 30 dias diárias, 12 meses mensais), criptografado (`age`). Mídia já mora em R2 com
versionamento ligado.
**Prova**: `scripts/restore-drill.sh` restaura o último dump num Postgres descartável (staging),
roda verificações de integridade (contagens, FK, última matéria presente) e **cronometra**;
resultado registrado em `docs/runbooks/restore-drills.md`. **Executado ao menos uma vez antes do
lançamento** (SC-013) e trimestralmente.
**Teto declarado (`ponytail`)**: dump lógico serve enquanto o banco for < ~1 GB e RPO de 1 h bastar;
acima disso, `wal-g` com arquivamento contínuo (PITR).

### D2-21 — Legal: dado de identidade validado no build; texto jurídico é humano (P-14 · FR-033–036 · SC-015)

- Páginas novas `/expediente` e `/privacidade` (pré-renderizadas), com **link no rodapé de toda
  superfície pública** (componente de rodapé em `packages/ui` — uma alteração, 14 páginas).
- Dados do veículo (razão social, CNPJ, responsável editorial, e-mail do encarregado/DPO,
  endereço) vivem em `apps/web/src/legal/entity.json`. **Em `staging`/`production` a construção
  falha se algum campo obrigatório estiver vazio ou com marcador** (`TODO`, `{{…}}`) — o mesmo
  mecanismo do FR-001: **não publicar texto legal fabricado**. O corpo da política de privacidade
  é redigido/revisado por pessoa responsável (**dependência de caminho crítico**: o plano não
  inventa texto jurídico).
- **Titular de dados** (FR-036): canal = e-mail declarado; prazo declarado de **15 dias**
  (LGPD, art. 19). Não cria entidade nem tela de pedido (YAGNI): o atendimento é operacional,
  com runbook de exclusão (remover `newsletter_subscriptions`/`consents` por e-mail, auditado).
- **Consentimento** (FR-035): ver D2-23. **Telemetria sem dado pessoal** (D2-19) mantém a lista de
  dados coletados curta e honesta.

### D2-22 — `DeliveryRelease` não vira tabela

O spec lista a entidade; o registro que ela descreve (versão, momento, autor, resultado dos
portões, referência de reversão) **já existe** como *deployment* do GitHub Environments +
artefatos do workflow. Criar tabela duplicaria fonte de verdade que o banco da aplicação nem
alcança durante um incidente de deploy. Entidade documentada em `data-model.md` como
**registro operacional externo**.
**Reversão**: se for preciso exibir histórico no painel (`integracoes.astro`), ler da API do GitHub.

---

## E. Capacidades complementares

### D2-23 — Newsletter: só e-mail, dupla confirmação, resumo agendado (P-11/14 · FR-035/038)

- **Remove o campo WhatsApp** do formulário. Não há canal de envio por WhatsApp no escopo; coletar
  dado sem uso viola minimização (LGPD art. 6º, III) e P-14. Volta com o canal (decisão de dado).
- **Dupla confirmação** (e-mail com link assinado com expiração): só `confirmed` recebe envio;
  cada confirmação grava `NewsletterConsent` com `purpose`, `text_version` (hash do texto exibido),
  momento e origem (IP **não** gravado). Cancelamento: link assinado em todo e-mail + cabeçalho
  `List-Unsubscribe` / `List-Unsubscribe-Post` (RFC 8058, um clique) — "cancelamento em um passo".
- **Envio**: comando agendado `newsletter:send-digest` (07:00 America/Fortaleza) monta o resumo das
  matérias publicadas nas últimas 24 h, filtra por município preferido, envia via **Laravel Mail**
  em lote pela fila. Sem edição manual no lançamento (disparo extra = `php artisan`).
- **Provedor de e-mail**: abstraído pelo *mailer* do Laravel; recomendação inicial Amazon SES
  (custo por mil), com SPF/DKIM/DMARC do domínio — **dependência de DNS (Assunção 8)**. Reversível
  por configuração.
- **Formulário sem JS** (Princípio XI): `POST` nativo para endpoint do Astro → API → `303` para
  página de agradecimento. Anti-abuso: *honeypot* + rate limit por IP (sem CAPTCHA de terceiro).

### D2-24 — Publicidade de venda direta, sem rede de anúncio (P-11 · FR-006/039 · SC-017)

**Decisão**: campanhas **próprias** (imagem + destino + período + espaço), servidas **pelo próprio
HTML** — nenhum script de terceiro entra (Princípio XI, CSP restrita e CLS ficam intactos).
- Espaço reservado com `aspect-ratio` fixo (o contêiner já existe nos layouts da 001); campanha
  escolhida no render por **rodízio ponderado** entre as ativas do espaço; sem campanha ativa → o
  espaço colapsa para um bloco "Anuncie" fixo da mesma altura (CLS = 0).
- Rótulo **"Publicidade"** sempre visível e `rel="sponsored noopener"` no link. Conteúdo
  patrocinado editorial (`sponsored: true`): rótulo na UI e `sponsor` no JSON-LD (FR-006).
- **Clique** passa por `/r/ad/{id}` (302 contado); **impressão** vem na telemetria (D2-19,
  `IntersectionObserver`). Mudança de campanha aparece na borda em ≤ 5 min (TTL) — publicidade não
  exige purga cirúrgica (não é correção editorial).
- Falha de imagem de anúncio = espaço colapsa na altura reservada; a leitura não é afetada.

**Alternativa**: Google Ad Manager/AdSense — receita programática, mas scripts de terceiro que
quebram o orçamento de 50 KB e a CSP; **reavaliável por ADR** se a venda direta não sustentar.
**Teto declarado**: sem segmentação, sem *frequency cap*, relatório = impressões/cliques.

### D2-25 — Comentários e contadores fabricados saem da UI (P-11 · Assunção 10)

`commentCount` e contagens de visualização do protótipo não têm origem real. Saem das superfícies
públicas (campo permanece **opcional** no contrato — mudança aditiva, nada quebra). Nenhuma
superfície de comentário é criada.

---

## F. Escopo e contenção da US8

### D2-26 — Diário Oficial e Pipeline retidos por movimentação de arquivo (FR-042–044/046 · SC-021/022)

- **Público**: `apps/web/src/pages/diario-oficial.astro` é movido para
  `apps/web/src/deferred/diario-oficial.astro` — fora de `pages/`, o Astro **não gera a rota**.
  Removido da navegação, de `sitemap-core.xml`, de feeds e do inventário de rotas; o ID `diario-oficial`
  permanece em `routes.md` marcado *retido*. Teste de rota (SC-021) garante: 404, ausente em
  sitemaps/feeds/nav, `robots.txt` sem referência. Reverter = `git mv` de volta (a 301 de dívida
  da FR-043 nunca nasce).
- **Admin**: `diario-oficial.astro` e `pipeline.astro` trocam dados de demonstração por um
  componente `EmptyState` ("capacidade ainda não ativa") que explica o motivo e o que ativa a
  capacidade; **nenhum número** (SC-022). O visual do pipeline (8 etapas) permanece como diagrama
  explicativo **sem contadores**.
- **Guardas instaladas agora** (FR-003/004/005/010): `EditorialApproval.origin`, campos
  `source_ref`/`archived_copy_ref` **opcionais** em `news`, `ai_assisted` + `ai_provenance`
  (modelo/versão/instrução) como colunas nulas — **mesmas entidades** quando a esteira entrar
  (FR-046). Nenhum conector, fila de ingestão ou cliente de IA é escrito.

---

## Resumo de dependências novas

| Camada | Adição | Justificativa | Remoção |
| --- | --- | --- | --- |
| PHP | `laravel/fortify`, `laravel/sanctum` | auth + 2FA (D2-07) | substituir por implementação própria |
| PHP | `spatie/laravel-permission` | RBAC atrás de porta (D2-07) | trocar adaptador |
| PHP | `vladimir-yuldashev/laravel-queue-rabbitmq` | fila fixada pela Constituição (D2-15) | driver `redis` por ADR |
| PHP | `league/flysystem-aws-s3-v3`, `intervention/image` | R2 + derivadas (D2-14) | trocar adaptador |
| PHP | `sentry/sentry-laravel` | erros e alertas (D2-18) | `SENTRY_DSN` vazio |
| Node | `@astrojs/node`, `@sentry/node` | SSR (D2-02), erros (D2-18) | voltar a `static` |
| Infra | OpenTofu, Caddy, gitleaks | borda como código, cabeçalhos, segredos | runbook manual |
| Cliente | **nenhuma biblioteca** (telemetria ≈ 1 KB própria) | Princípio I | — |

Nenhuma dependência de cliente é adicionada: o orçamento de 50 KB **não é tocado** além de ~1 KB.
