# Phase 0 — Pesquisa e Decisões Técnicas

**Feature**: 001-fundacao-prototipo-monorepo
**Data**: 2026-08-11
**Entrada**: [spec.md](./spec.md) · [Constituição v2.0.0](../../.specify/memory/constitution.md)

Todas as marcações NEEDS CLARIFICATION do Technical Context foram resolvidas aqui. Cada
decisão declara problema, escolha, justificativa e alternativas rejeitadas. Decisões
marcadas **[ADR]** viram registro em `docs/decisions/` durante a implementação (FR-037).

---

## Fatos apurados no ambiente (base das decisões)

| Item | Valor verificado |
|---|---|
| Node | v24.18.0 |
| pnpm | 11.10.0 |
| npm | 11.16.0 |
| PHP (runtime) | 8.5.7 |
| Composer | 2.10.1 |
| Laravel instalado | 13.25.0 em `backend/api/` (constraint `php: ^8.3`) |
| Spec Kit | 0.12.5.dev0, integração `claude`, sem `.specify/extensions.yml` |
| Script de contexto de agente | **não existe** em `.specify/scripts/bash/` (só check-prerequisites, common, create-new-feature, setup-plan, setup-tasks) |

**Leitura direta do projeto de design** (MCP `DesignSync`, projeto `219a9ccf-…`), 18 caminhos.
Confirmado o que a spec afirmava e apurados três fatos novos, decisivos para o plano:

1. **`styles.css` é só uma cadeia de 7 `@import`** — não contém regra própria. Portanto o
   ponto de entrada do DS é substituível arquivo a arquivo sem tocar componentes.
2. **`colors.css` não declara tema escuro.** Só existe o bloco `:root` claro (rampas
   `--pd-*` + aliases semânticos `--text-*`, `--surface-*`, `--border-*`, `--focus-ring`).
   O tema escuro exigido por FR-009/SC-002 **existe apenas dentro de `ParnaibaDigital.dc.html`**.
3. **`fonts.css` carrega Google Fonts por `@import` remoto** e o `readme.md` declara ícones
   **Lucide via CDN `lucide-static@0.469.0`**. Ambos violam o Princípio I (fontes
   auto-hospedadas, nenhuma requisição a host de terceiro) e o Princípio XI (falha de
   recurso de terceiro não pode degradar leitura). Ver D-08 e D-09.

---

## D-01 — Gerenciador de pacotes e orquestração do monorepo

**Decisão**: pnpm workspaces (`pnpm-workspace.yaml`), sem orquestrador de build adicional.
Scripts agregados por `pnpm -r` e `--filter`. Node fixado por `.nvmrc` + `engines` (>= 24).

**Justificativa**: pnpm 11 já está instalado; workspaces resolvem link entre `apps/*` e
`packages/*` sem ferramenta extra. Com 2 aplicações e 5 pacotes, o grafo de build é raso e
o custo de um orquestrador (cache remoto, config de pipeline) não se paga. Princípio XII
exige que cada peça tenha justificativa; Turborepo não a tem hoje.

**Alternativas rejeitadas**: Turborepo/Nx (cache e grafo desnecessários nesta escala;
adicionáveis depois sem migrar layout); npm workspaces (resolução mais lenta, sem
`--filter` equivalente); múltiplos repositórios (quebraria a fonte única de tokens, FR-003).

**Critério de reversão**: adotar Turborepo quando o build completo de CI passar de ~5 min
ou quando existir a terceira aplicação.

---

## D-02 — Framework do portal público (`apps/web`)

**Decisão**: Astro 5 em `output: 'static'` (SSG) por padrão, TypeScript `strict`, sem
framework de UI cliente (nenhum React/Vue/Svelte no runtime).

**Justificativa**: fixado pela Constituição (tabela de stack). O modo estático atende as
25 superfícies desta fase — todo dado é demonstrativo e conhecido em build. Sem integração
de framework de cliente, o JS entregue é apenas o que escrevermos (D-05), o que torna o
orçamento de 50 KB gz (SC-006) folgado por construção, e não por otimização posterior.

**Alternativas rejeitadas**: `output: 'server'` desde já (nenhuma página desta fase depende
de dado por requisição; SSR aumenta TTFB e custo sem ganho — será adotado por rota, via
`export const prerender = false`, quando a API real existir); Next.js/Nuxt (violam a
tabela de stack e trazem runtime de cliente por padrão).

---

## D-03 — Framework do painel administrativo (`apps/admin`)

**Decisão**: mesma stack do portal — Astro 5 + TypeScript + Tailwind, build estático,
`noindex` + `Disallow: /` no `robots.txt` próprio.

**Justificativa**: a Constituição fixa "TypeScript + Tailwind sobre o Design System
importado" e não impõe SPA. Nesta fase o admin é reprodução visual sobre dados
demonstrativos — sem autenticação, sem persistência, sem regra (FR-038). Usar a mesma
stack permite que `packages/ui` seja consumido pelos dois sem uma segunda camada de
adaptação, o que é o mecanismo que garante SC-012 (zero componentes duplicados). Uma
segunda toolchain dobraria configuração de lint, teste, tokens e build por zero ganho hoje.

**Alternativas rejeitadas**: SPA React/Vite (o admin real precisará de estado de formulário
rico, mas isso é feature posterior; construir a SPA agora criaria componentes duplicados —
uma versão `.astro` e uma `.tsx` do mesmo card — que é exatamente o defeito que FR-008 e
SC-012 proíbem); Filament/Livewire dentro do Laravel (descartaria o protótipo visual
aprovado e o Design System, violando FR-002 e o Princípio VI).

**Critério de reversão**: quando o admin ganhar edição real (feature posterior), avaliar
ilhas React pontuais **dentro** do Astro antes de considerar troca de aplicação.

---

## D-04 — Tailwind e fonte única de tokens

**Decisão**: Tailwind CSS 4 via `@tailwindcss/vite`, configuração CSS-first. Os tokens do
DS são importados como CSS e **referenciados** por `@theme inline` — nenhum valor é
reescrito no Tailwind.

```css
/* packages/design-system/src/index.css (esboço) */
@import "../vendor/<ds>/tokens/colors.css";      /* byte-idêntico ao original */
@import "./theme/dark.css";                       /* overlay — ver D-07 */
@theme inline {
  --color-surface-page: var(--surface-page);
  --color-text-body:    var(--text-body);
  --spacing-5:          var(--space-5);
  --radius-md:          var(--radius-md);
  /* … mapeamento 1:1, sem literais */
}
```

**Justificativa**: `@theme inline` gera as utilitárias do Tailwind apontando para as
variáveis CSS do DS em vez de copiar seus valores. Consequência direta: trocar
`--pd-blue-600` no arquivo do DS muda utilitária, componente e tema escuro ao mesmo tempo —
que é a definição operacional de FR-003 e o que torna SC-003 verificável. Tailwind 3 exigiria
duplicar a paleta em `tailwind.config.js` (JS) além do CSS, criando duas fontes.

**Alternativas rejeitadas**: Tailwind 3 + config JS (duplicação de valores, proibida pelo
Princípio VI); Tailwind com paleta própria (redesenho, proibido por FR-002); CSS puro sem
Tailwind (a Constituição fixa Tailwind; e utilitárias reduzem CSS morto no build).

---

## D-05 — Camada de componentes e interatividade

**Decisão**: `packages/ui` publica componentes **`.astro`** (renderização 100% servidor).
Interatividade é entregue por módulos TypeScript pequenos, sem framework, carregados por
`<script>` de módulo do próprio Astro e sempre como **enriquecimento** de HTML já funcional.
Os componentes `.jsx` do projeto de design são referência de leitura, não são executados.

Inventário de interatividade desta fase (todos os alvos de FR-014):
alternância de tema, paleta de comando `Ctrl/Cmd+K`, gaveta móvel, abas, filtro de editoria,
paginação (links reais + realce), avisos temporários, animação do pipeline do admin.
Nenhum deles precisa de estado compartilhado nem de reconciliação de árvore.

**Justificativa**: o Princípio XI exige que ler notícia, navegar, buscar, paginar e assinar
newsletter funcionem sem JavaScript de cliente. Se o componente é `.astro`, isso é
garantido por construção, não por teste. O orçamento de 50 KB gz não sobrevive a um runtime
de framework somado ao código de aplicação.

**Alternativas rejeitadas**: ilhas React (~45 KB gz de runtime só para React+DOM,
consumindo o orçamento inteiro antes da primeira linha de aplicação); Web Components com
biblioteca (Lit ~5 KB gz — mais barato, mas nenhuma interação desta fase precisa de shadow
DOM ou de ciclo de vida reativo; FR-027 exige justificar cada KB); Alpine.js (~15 KB gz,
mesma objeção, e move lógica para atributos HTML, dificultando checagem de tipos).

---

## D-06 — Preservação do Design System importado **[ADR]**

**Decisão**: os arquivos importados vivem em `packages/design-system/vendor/parna-badigital-design-system-fe257784-…/`,
byte-idênticos (SC-017), com `MANIFEST.sha256` versionado e uma verificação de CI que
recalcula os hashes. Toda adaptação vive **ao lado**, em `packages/design-system/src/`,
nunca por edição do original.

Adaptações previstas nesta fase, cada uma como arquivo próprio em `src/theme/`:
`dark.css` (D-07), `fonts-local.css` (D-08), `icons.css` (D-09).

**Justificativa**: FR-001 e SC-017 exigem identidade byte a byte; a Assumption 10 diz que a
verdade visual nasce no projeto de design remoto e é reimportada. Editar o original tornaria
a reimportação um merge manual a cada ciclo. Com overlay, reimportar é substituir a pasta
`vendor/` e reexecutar o hash.

**Alternativas rejeitadas**: editar os arquivos do DS diretamente (reprovado por SC-017);
copiar valores para dentro do Tailwind (reprovado por FR-003); consumir o DS por CDN do
projeto de design (dependência de terceiro no caminho crítico, viola Princípio I e XI).

---

## D-07 — Tema escuro: extração e localização **[ADR]**

**Problema**: FR-009 exige tema escuro em todo componente e toda tela, e SC-002 exige
paridade com o protótipo nos dois temas — mas `tokens/colors.css` do DS **não tem** bloco
escuro. A paleta escura existe só dentro de `ParnaibaDigital.dc.html`.

**Decisão**: extrair do protótipo a redefinição escura **apenas dos aliases semânticos**
(`--text-*`, `--surface-*`, `--border-*`, `--focus-ring`, scrims), publicá-la em
`packages/design-system/src/theme/dark.css` sob `[data-theme="dark"]` e
`@media (prefers-color-scheme: dark)` guardado por `:root:not([data-theme="light"])`.
As rampas `--pd-*` permanecem intocadas — tema escuro é remapeamento de alias, não paleta nova.
Seletor de tema: atributo `data-theme` no `<html>`, escrito por script inline de ~15 linhas
antes da primeira pintura (evita flash), persistido em `localStorage`, com fallback ao
sistema. Sem JS, o `@media` responde e a página continua correta.

**Justificativa**: os aliases já são a camada de indireção que o DS criou exatamente para
isso (`--surface-page: var(--pd-white)`). Redefini-los é a menor mudança que satisfaz FR-009
sem tocar um único componente. Nenhum valor literal novo é introduzido além dos que o
protótipo já declara — e esses são rastreáveis ao protótipo, que é a fonte de verdade (FR-002).

**Alternativas rejeitadas**: inventar uma paleta escura (redesenho, viola FR-002);
`filter: invert()` (destrói fotos e a distinção do slot de anúncio exigida pelo edge case
"tema escuro em superfície de anúncio"); manter dois arquivos de token completos
(duplicação de valores, viola FR-003).

**Pendência de retorno ao design**: `dark.css` é adaptação local de algo que deveria nascer
no DS. Registrar tarefa de devolver o bloco escuro ao projeto de design (`DesignSync`
`write_files` em `tokens/colors.css`) para que a próxima reimportação já o traga.

---

## D-08 — Fontes auto-hospedadas **[ADR]**

**Decisão**: substituir o `@import` remoto de `tokens/fonts.css` por `@fontsource-variable/archivo`,
`@fontsource-variable/source-sans-3` e `@fontsource/ibm-plex-mono`, servidos do próprio
domínio, subsetados para `latin` + `latin-ext` (pt-BR precisa de `latin-ext`), com
`font-display: swap` e `preload` apenas dos pesos acima da dobra. O overlay
`src/theme/fonts-local.css` redeclara **as mesmas três variáveis** `--font-display`,
`--font-body`, `--font-mono`; o `fonts.css` vendorizado não é importado pelas aplicações.

**Justificativa**: Princípio I proíbe requisição a host de fonte de terceiro; FR-034 exige
auto-hospedagem com subconjunto. O próprio `readme.md` do DS marca as fontes como
"substituição declarada" e diz que os nomes de token permanecem na troca — ou seja, esta é a
troca que o DS previu. Nenhum componente muda.

**Alternativas rejeitadas**: manter o Google Fonts (viola Princípio I e adiciona duas
conexões ao caminho crítico do LCP); baixar `.woff2` manualmente para `public/` (mesmo
resultado, sem atualização versionada nem subsetting reproduzível).

---

## D-09 — Ícones: Lucide sem CDN **[ADR]**

**Decisão**: `lucide-static` como dependência de build; os ~20 glifos do vocabulário fixo do
DS são inlinados como SVG no HTML pelo componente `Icon.astro` (leitura em build, zero
requisição em runtime, zero JS). O componente mantém `currentColor` e os três tamanhos
(12–14 / 16–18 / 20–22) declarados pelo DS.

**Justificativa**: o DS aplica os ícones como `mask-image` a partir do CDN
`lucide-static@0.469.0`. Um ícone que falha por CDN indisponível deixa botão sem rótulo
visual — o edge case "falha de recurso de terceiro" da spec proíbe isso, e o Princípio XI
também. Inlinar em build custa alguns KB de HTML gzipado e elimina uma origem externa.

**Alternativas rejeitadas**: sprite SVG externo (uma requisição a mais, e `mask-image` de
sprite não permite `currentColor` por glifo sem `<use>` + fetch); `lucide` (pacote com JS de
runtime — desnecessário, os ícones são estáticos); desenhar SVG à mão (o DS proíbe
explicitamente).

---

## D-10 — Tipos compartilhados e contratos de API

**Decisão**: OpenAPI 3.1 escrito à mão é a **fonte de verdade** do contrato
(`specs/001-…/contracts/openapi-v1.yaml`). `packages/types` expõe os tipos TypeScript
**gerados** dele por `openapi-typescript` (script `pnpm types:generate`, saída versionada e
verificada em CI por regeneração + `git diff --exit-code`).

**Justificativa**: o Princípio VII manda o contrato ser o artefato revisado e o código
implementá-lo. Gerar tipos a partir do YAML garante que os dados demonstrativos, o cliente e
os futuros endpoints Laravel descrevam as mesmas entidades — que é o critério verificável do
Acceptance Scenario 3 da User Story 4. Versionar a saída mantém o repositório utilizável sem
etapa de geração.

**Alternativas rejeitadas**: tipos TS escritos à mão como fonte (o backend PHP não os lê;
divergência silenciosa é questão de tempo); Zod como fonte + inferência (bom para runtime,
mas não produz contrato legível por outro consumidor nem por ferramenta PHP); gerar OpenAPI
a partir do código Laravel (inverteria o Princípio VII — código antes de contrato — e não há
endpoint nesta fase).

---

## D-11 — Validação em runtime (`packages/validation`)

**Decisão**: Zod v4, usado **apenas em tempo de build/servidor**: valida os dados
demonstrativos contra os schemas do contrato ao gerar as páginas e valida respostas da API
em desenvolvimento. Nunca é enviado ao cliente.

**Justificativa**: dado demonstrativo que diverge do contrato é o modo de falha mais provável
desta fase (12 artigos, 6 documentos, 6 eventos, 6 empresas escritos à mão). Validar na
geração transforma isso em build reprovado em vez de tela quebrada. Custo de cliente: zero.

**Alternativas rejeitadas**: Valibot (menor, mas a vantagem é bundle de cliente — que aqui é
zero de qualquer forma; Zod tem melhor integração com `openapi-typescript` e mais uso na
equipe); nenhuma validação (o edge case "documento oficial sem matéria associada" e a
obrigatoriedade de município em FR-021 precisam falhar cedo).

---

## D-12 — Cliente de dados e estratégia de mocks **[ADR]**

**Decisão**: `packages/api-client` expõe uma interface única (`NewsRepository`,
`GeoRepository`, `GazetteRepository`, …) com **dois transportes**: `mock` (dados
demonstrativos, ativo nesta fase) e `http` (implementação vazia/stub, sem chamada real). Os
dados demonstrativos vivem **dentro** de `packages/api-client/src/mock/data/`, tipados por
`packages/types`. Nenhum componente de tela conhece o transporte; a escolha é feita uma vez,
por variável de ambiente, na camada de dados da aplicação.

**Justificativa**: SC-011 exige que trocar a origem dos dados não toque nenhum componente —
isso só é verificável se existir exatamente um ponto de troca. FR-027 proíbe pacote não
consumido: um `packages/mock-data` separado seria um sexto pacote consumido apenas pelo
api-client, então ele é uma pasta, não um pacote. Mantém-se o conjunto de 5 pacotes exigido
por FR-019.

**Alternativas rejeitadas**: MSW interceptando fetch (simula rede que não existe; adiciona
service worker e complexidade de build para o mesmo resultado); ler JSON direto nas páginas
(espalha conhecimento da origem por 25 telas, mata SC-011); `content collections` do Astro
(acopla o formato dos dados ao framework do portal; o admin não os leria).

---

## D-13 — Registro canônico de slugs de município **[ADR]**

**Decisão**: `packages/api-client/src/data/municipalities.ts` — dado **canônico**, não
demonstrativo, chaveado por código IBGE, com os 5 municípios da spec. Uma lista de rotas
reservadas (`/noticias`, `/eventos`, `/utilidade-publica`, `/diario-oficial`, `/empresas`,
`/busca`, `/autor`, `/newsletter`, `/componentes`, `/anuncie`, …) vive ao lado. O script
`scripts/validate-slug-registry.ts` roda como `prebuild` das duas aplicações e reprova a
construção em caso de colisão, imprimindo o slug e a rota conflitante.

**Justificativa**: resolve o `TODO(CITY_SLUG_REGISTRY)` aberto pela Constituição e satisfaz
FR-022, SC-009 e SC-010. Ficar dentro do api-client (e não em um pacote `config` novo)
respeita FR-019/FR-027. As páginas de município são geradas por
`getStaticPaths()` a partir do registro, o que torna "adicionar município" uma edição de
dados — critério exato de SC-010.

**Critério de reversão**: quando o backend expuser `/api/v1/municipalities`, o registro migra
para lá e o arquivo TS passa a ser cache gerado; o validador de build permanece.

---

## D-14 — Motor de busca: decisão exigida pela Constituição **[ADR]**

**Decisão**: **Meilisearch**, atrás da porta de domínio `SearchEngine`. **Nada é integrado
nesta fase** (FR-038): define-se apenas a interface e a ADR. A busca do protótipo funciona
sobre dados demonstrativos, filtrando em build.

**Justificativa**: a Constituição manda decidir no `/speckit.plan`. Meilisearch é
auto-hospedável no mesmo host da aplicação (Princípio XII: infraestrutura mínima, custo
previsível), tem tokenização e *stop words* de português prontas, e seu custo não escala com
o tráfego — que, num produto financiado por anúncio, é o eixo que cresce. Algolia cobra por
operação de busca e por registro: o mesmo crescimento de tráfego que gera receita geraria
custo variável, e a migração de saída é cara pelo acoplamento do SDK de cliente.

**Alternativas rejeitadas**: Algolia (custo variável atrelado ao tráfego, dependência de
terceiro no caminho de uma funcionalidade essencial que o Princípio XI exige funcionar sem
JS); busca full-text do PostgreSQL (suficiente para ~5 artigos/dia, e continua sendo a opção
de partida — mas a porta existe justamente para não decidir isso agora; se ela bastar, o
Meilisearch nunca é provisionado, e isso é vitória do Princípio XII).

---

## D-15 — Organização modular do Laravel **[ADR]**

**Decisão**: preservar `backend/api/` no lugar (FR-020) e adicionar, sem remover o esqueleto
padrão do framework:

```
backend/api/app/
├── Domain/<Módulo>/{Model,Contract,Event,ValueObject}     # sem dependência de framework
├── Application/<Módulo>/{UseCase,Query,DTO}
├── Infrastructure/<Módulo>/{Persistence,Adapter}          # implementa as portas do Domain
└── Http/{Controllers,Requests,Resources,Middleware}       # existente
```

Módulos: News, Categories, Cities, Neighborhoods, Authors, Sources, OfficialGazette,
Editorial, AI, Advertising, Analytics, Users, Media, Search.
PSR-4 já cobre `App\` → `app/`; nenhuma alteração de autoload é necessária.
Nesta fase os módulos entram como **estrutura + interfaces de porta + testes de fronteira**,
sem migração, sem endpoint, sem model persistido (FR-038).

**Justificativa**: Princípio VIII. Manter o esqueleto padrão do Laravel evita brigar com
convenções do framework (descoberta de comandos, providers, testes); a modularidade entra
por namespace e por regra de dependência, não por reescrita de bootstrap.

**Alternativas rejeitadas**: pacotes Composer por módulo (`nwidart/laravel-modules` ou
monorepo PHP) — custo de release e de tooling sem ganho enquanto tudo mora no mesmo deploy;
mover a aplicação para `backend/laravel/` (ruído de histórico sem ganho, já registrado na
Assumption 1); DDD tático completo com agregados e repositórios genéricos desde já
(estrutura antes da necessidade, proibida pelo Princípio VIII).

---

## D-16 — Enforcement de fronteira de módulo

**Decisão**: **Deptrac** (`qossmic/deptrac`, dev-dependency) com camadas
`Domain`, `Application`, `Infrastructure`, `Http` e uma camada por módulo. Regras: `Domain`
não depende de nada; `Application` depende só de `Domain`; `Infrastructure` e `Http`
dependem de `Application`/`Domain`; **módulo não referencia namespace interno de outro
módulo** — apenas contratos publicados.

**Justificativa**: o Princípio VIII declara "acesso direto a tabelas ou modelos internos de
outro módulo é violação". Sem verificação automatizada, isso é uma frase; a primeira pressa
a desfaz. Deptrac é um binário de CI, sem impacto em runtime e sem dependência de produção.

**Alternativas rejeitadas**: PHPStan com regras customizadas (dá para fazer, mas escrever e
manter as regras de camada custa mais que o arquivo de configuração do Deptrac); revisão
humana apenas (não é portão, e o Princípio VIII pede que seja).

---

## D-17 — Verificação de tokens (portão "Tokens" da Constituição)

**Decisão**: duas verificações complementares, ambas bloqueantes:

1. **Stylelint** + `stylelint-declaration-strict-value` sobre `**/*.css` e blocos `<style>`
   de `.astro`: propriedades de cor, espaçamento, raio, sombra, tipografia e duração só
   aceitam `var(--…)`; literais reprovam com arquivo, linha e propriedade.
   Exceção declarada por `stylelint-disable` só é permitida em `packages/design-system/src/theme/`
   com comentário de justificativa (é onde os valores do protótipo entram, D-07).
2. **Script próprio** `scripts/check-tokens.ts` sobre `.astro`/`.ts`: detecta hex, `rgb()`,
   `hsl()` e literais `px` em atributos `class`/`style`, e sugere o token mais próximo por
   comparação com o mapa gerado dos tokens do DS — atendendo à exigência de FR-004 de
   **indicar o token que deveria ter sido usado**.

**Justificativa**: Stylelint sozinho não vê classes utilitárias arbitrárias do Tailwind
(`bg-[#123456]`, `p-[13px]`), que é o caminho mais fácil de burlar o portão. O script cobre
essa lacuna e é o que torna SC-003 uma medição e não uma opinião.

**Alternativas rejeitadas**: só ESLint (não entende CSS); só revisão (não é portão);
proibir classe arbitrária por configuração do Tailwind (não existe chave para isso em v4).

---

## D-18 — Lint, formatação e checagem de tipos

**Decisão**: ESLint 9 (flat config) + `typescript-eslint` + `eslint-plugin-astro` +
`eslint-plugin-jsx-a11y` (regras a11y aplicáveis a `.astro`); Prettier + `prettier-plugin-astro`
para formatação; `astro check` para tipos em `.astro`; `tsc --noEmit` nos pacotes;
Stylelint para CSS (D-17). No backend: Pint (formatação) e **PHPStan/Larastan nível 8**.

**Justificativa**: um linter por linguagem, um formatador, um verificador de tipos por
runtime — o conjunto mínimo que fecha os portões "Lint e formatação" e "Checagem de tipos"
da Constituição. `eslint-plugin-astro` é o único que compreende o SFC do Astro.

**Alternativas rejeitadas**: oxlint (mais rápido, e o DS traz um `_adherence.oxlintrc.json`
que preservamos vendorizado como referência — mas oxlint não analisa `.astro`, que é onde
está quase todo o nosso código; manter dois linters JS violaria o Princípio XII);
Biome (idem quanto a `.astro`).

---

## D-19 — Estratégia de teste

**Decisão**, mapeada aos portões da Constituição:

| Alvo | Ferramenta | Portão coberto |
|---|---|---|
| Contratos, registro de slugs, transformações do cliente de dados, validação de mocks | **Vitest** | Testes de domínio e contrato |
| 25 superfícies: navegação, dois temas, 360px/1280px, estados vazios | **Playwright** | SC-001, SC-002 |
| Acessibilidade em cada superfície, nos dois temas | **@axe-core/playwright** | Acessibilidade (SC-004) |
| Sem JavaScript (`javaScriptEnabled: false`) nas 14 públicas | **Playwright** (projeto dedicado) | SC-007 / Princípio XI |
| Orçamentos e Lighthouse ≥ 95 | **Lighthouse CI** (`@lhci/cli`) sobre o build estático | SC-005, SC-006 |
| Canônica, OG/Twitter, JSON-LD válido, sitemaps, feeds | **Vitest** sobre o HTML do `dist/` + validação de schema | SC-008 / Princípio II |
| Tokens | Stylelint + script próprio (D-17) | SC-003 |
| Domínio PHP e fronteiras de módulo | **Pest** + PHPStan + Deptrac | Princípios VIII e IX |

TDD é obrigatório apenas onde a Constituição manda (domínio, contratos, ingestão); os
componentes derivados do protótipo entram por teste de acessibilidade e de dois temas.

**Alternativas rejeitadas**: testes de regressão visual por screenshot (SC-002 é revisão
lado a lado humana nesta fase; baseline de pixel em 25 telas × 2 temas × 2 larguras produz
instabilidade que o Princípio IX classifica como teste falhando); Cypress (sem execução
multi-navegador nativa e sem modo sem-JS tão direto).

---

## D-20 — SEO: geração de sitemaps, feeds e dados estruturados

**Decisão**: endpoints próprios em `apps/web/src/pages/`, todos derivados do cliente de
dados (nunca mantidos à mão): `robots.txt.ts`, `sitemap-index.xml.ts`, `sitemap-<seção>.xml.ts`,
`sitemap-news.xml.ts` (últimas 48 h, ≤ 1000 URLs), `sitemap-images.xml.ts`,
`rss/<seção>.xml.ts` e `rss/<municipio>.xml.ts` (via `@astrojs/rss`). JSON-LD emitido por um
componente `<StructuredData>` que recebe a entidade tipada e serializa o schema do tipo da
página.

**Justificativa**: `@astrojs/sitemap` não gera News Sitemap nem Image Sitemap com
`contentLocation`, e não conhece nosso eixo município/bairro — as três coisas que o
Princípio II considera centrais. Escrever os endpoints custa pouco (cada um é uma função
sobre a lista de conteúdo) e mantém a geração no mesmo lugar do modelo de dados.

**Alternativas rejeitadas**: `@astrojs/sitemap` (cobre só o caso genérico; teríamos plugin
para uma metade e código para a outra); sitemap servido pelo Laravel (nesta fase não há API;
e o HTML é estático, então o conteúdo canônico está no build do portal).

---

## D-21 — Publicidade e reserva de espaço

**Decisão**: `AdSlot.astro` renderiza um contêiner com altura fixa vinda dos tokens
(`--ad-leaderboard-h`, `--ad-rect-h`, `--ad-halfpage-h`, `--ad-mobile-banner-h`,
`--ad-inread-h`), rotulado `[Anúncio AdSense]`, em cinza frio `--pd-ad-*`. **Nenhuma rede
real é integrada** (FR-032/FR-038); o slot renderiza o placeholder do protótipo. Uma
verificação de build reprova página com mais de 3 slots acima da dobra ou com dois slots
consecutivos sem conteúdo editorial entre eles.

**Justificativa**: o DS já publicou as alturas exatas dos formatos AdSense como tokens de
layout justamente para eliminar CLS. Usá-los é a implementação literal de FR-032 e a defesa
de CLS < 0,05 (SC-005).

---

## D-22 — Alinhamento de versão do PHP

**Decisão**: elevar a constraint de `backend/api/composer.json` de `"php": "^8.3"` para
`"php": "^8.4"`, mantendo o runtime local 8.5.7 (compatível). Nenhuma outra alteração no
backend.

**Justificativa**: a Constituição fixa PHP 8.4 na tabela de stack; a constraint atual
permite 8.3, que a tabela não autoriza. É divergência de uma linha, corrigida agora antes de
qualquer código de domínio depender de recurso de 8.3.

**Alternativas rejeitadas**: emendar a Constituição para `^8.3` (perderia recursos de 8.4 já
disponíveis no runtime instalado, sem ganho); deixar como está (o portão de conformidade
apontaria a divergência em toda revisão).

---

## D-23 — Infraestrutura desta fase

**Decisão**: `infrastructure/` recebe `docker-compose.dev.yml` (PostgreSQL, Redis, RabbitMQ,
Meilisearch) **documentado e não executado por CI**, além de `.env.example` por aplicação e
os cabeçalhos de segurança/cache como configuração versionada (`_headers` para a borda).
Nenhum serviço é dependência de execução para demonstrar o protótipo (Assumption 12).

**Justificativa**: Princípio XII pede ambientes reprodutíveis por configuração versionada,
mas o build desta fase é estático e não consulta serviço nenhum. Subir infraestrutura em CI
custaria minutos por execução para validar zero comportamento.

---

## Resumo das dependências de cliente adicionadas (exigência FR-027)

| Dependência | Chega ao navegador? | Custo | Por que HTML/CSS nativo não resolve |
|---|---|---|---|
| Astro 5 | Não (compilador) | 0 KB | — |
| Tailwind 4 | Só o CSS gerado | ~8–12 KB gz de CSS total | — |
| `@fontsource*` | Sim (woff2 subsetado) | ~35–60 KB por família/peso, cacheado | Fonte é ativo; a alternativa era CDN de terceiro (D-08) |
| `lucide-static` | Só o SVG inlinado | ~0,3 KB gz por ícone usado | Sem biblioteca: SVG à mão, proibido pelo DS |
| Zod | **Não** (build/servidor) | 0 KB no cliente | — |
| Scripts próprios de UI | Sim | alvo < 6 KB gz somados | São o enriquecimento; o HTML já funciona sem eles |

**Total estimado de JS no cliente por página pública: < 8 KB gz** — folga de 6× sobre o
orçamento de 50 KB de SC-006.

---

## Questões deixadas em aberto para `/speckit-clarify` (não bloqueiam a Fase 1)

1. **Domínio do admin**: subdomínio (`admin.parnaibadigital.com.br`) ou subcaminho
   (`/admin`)? Assumido subdomínio, porque subcaminho compartilharia o namespace raiz com os
   slugs de município (D-13) e aumentaria a superfície de colisão.
2. **Devolver `dark.css` ao projeto de design** (pendência de D-07): fazer nesta feature ou
   na próxima reimportação? Assumido: registrar tarefa, executar após aprovação visual.
3. **Foto real**: sem banco de imagens, todas as superfícies usam `PhotoFrame`. O orçamento
   de LCP é medido sobre placeholder; ao chegarem fotos reais, remedir.
