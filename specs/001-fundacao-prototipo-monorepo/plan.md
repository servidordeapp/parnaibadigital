# Implementation Plan: Fundação do Produto — Protótipo Navegável, Design System e Monorepo

**Branch**: `001-fundacao-prototipo-monorepo` | **Date**: 2026-08-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-fundacao-prototipo-monorepo/spec.md`

**Artefatos desta fase**: [research.md](./research.md) · [data-model.md](./data-model.md) ·
[contracts/](./contracts/) · [quickstart.md](./quickstart.md)

## Summary

Transformar o protótipo aprovado (26 telas em `ParnaibaDigital.dc.html`) e seu Design System
(31 componentes, 7 arquivos de token) numa base de frontend real, dentro de um monorepo com
duas aplicações e cinco pacotes compartilhados, com o backend Laravel existente reorganizado
em módulos de domínio — **sem implementar nenhuma regra de negócio**.

Abordagem técnica, derivada da Fase 0:

- **Portal e painel são a mesma stack** (Astro 5 estático + TypeScript + Tailwind 4), o que
  permite que `packages/ui` seja a única definição de cada componente para os dois — o
  mecanismo que torna "zero duplicação" (SC-012) verificável em vez de aspiracional.
- **Tokens têm fonte única de verdade real**: os arquivos do DS entram vendorizados e
  byte-idênticos, e o Tailwind os *referencia* por `@theme inline` em vez de copiá-los.
  Mudar um token muda utilitária, componente e tema escuro ao mesmo tempo.
- **Zero framework de UI no cliente**: componentes são `.astro` renderizados no servidor;
  as oito interações do protótipo entram como enriquecimento em TypeScript puro. Estimativa
  de JS entregue: < 8 KB gz contra um orçamento de 50 KB.
- **Três correções obrigatórias sobre o DS importado**, cada uma como overlay ao lado do
  original, nunca por edição dele: tema escuro extraído do protótipo (o DS não o tem),
  fontes auto-hospedadas no lugar do `@import` do Google Fonts, e ícones Lucide inlinados em
  build no lugar do CDN.
- **Contrato antes de código**: OpenAPI 3.1 é a fonte de verdade; os tipos TypeScript são
  gerados dele e os dados demonstrativos são validados contra ele em build. Nenhum endpoint
  é implementado.

## Technical Context

**Language/Version**: TypeScript 5.9 (Node 24.18 — verificado no ambiente) · PHP 8.4
(runtime local 8.5.7; constraint do `composer.json` elevada de `^8.3` para `^8.4`, D-22)

**Primary Dependencies**: Astro 5 (`output: 'static'`) · Tailwind CSS 4 via
`@tailwindcss/vite` (configuração CSS-first, `@theme inline`) · Laravel 13.25 (já instalado
em `backend/api/`) · Zod 4 (build/servidor apenas) · `@fontsource*` · `lucide-static`

**Storage**: **Nenhuma nesta fase.** Dados demonstrativos em módulos TypeScript tipados
dentro de `packages/api-client/src/mock/data/`. Sem banco, sem migração, sem model
persistido (FR-038). PostgreSQL/Redis/RabbitMQ existem apenas como definição de ambiente
documentada em `infrastructure/`.

**Testing**: Vitest (contratos, registro de slugs, validação de mocks, asserções de SEO sobre
o `dist/`) · Playwright + `@axe-core/playwright` (25 superfícies, 2 temas, 2 larguras,
projeto dedicado sem JavaScript) · Lighthouse CI (orçamentos) · Pest + PHPStan nível 8 +
Deptrac (backend)

**Target Platform**: Web — navegadores modernos, **mobile-first** (rede móvel regional,
4G, dispositivo médio). Build estático servido por CDN; backend PHP-FPM (não exercitado
nesta fase).

**Project Type**: Monorepo web — 2 aplicações frontend + 5 pacotes compartilhados +
1 backend modular monolítico.

**Performance Goals**: Lighthouse ≥ 95 nas 4 categorias · LCP < 2,0 s · CLS < 0,05 ·
INP < 200 ms · TTFB < 200 ms em hit de borda · **≤ 50 KB de JS comprimido por página**
(estimativa do plano: < 8 KB).

**Constraints**: Conteúdo indexável renderizado no servidor · funcionalidade essencial
operante sem JavaScript · zero literal visual fora de token · DS vendorizado byte-idêntico ·
todo conteúdo com município primário obrigatório · nenhuma rede de anúncios, provedor de IA,
motor de busca, fila ou coletor integrado.

**Scale/Scope**: 25 superfícies de produto (14 públicas + 11 administrativas) + 1 superfície
de desenvolvimento · 36 componentes (31 do DS + 5 adições justificadas) · 5 municípios,
9 bairros, 12 editorias · dados demonstrativos: 12 artigos, 6 documentos oficiais, 6 eventos,
6 empresas, 8 etapas de pipeline, 4 grupos de utilidade pública · ~5 artigos/dia em produção.

## Constitution Check

*GATE: avaliado antes da Fase 0 e reavaliado após a Fase 1.*

Constituição do ParnaíbaDigital **v2.0.0** (12 princípios). Resultado: **PASSA**, com duas
entradas em Complexity Tracking.

| # | Princípio | Avaliação | Como este plano o satisfaz |
|---|---|---|---|
| I | Performance em Primeiro Lugar | ✅ | SSG por padrão (D-02); zero framework de cliente (D-05); fontes auto-hospedadas e subsetadas (D-08); ícones inlinados sem CDN (D-09); alturas de slot de anúncio vindas de token (D-21); Lighthouse CI como portão (D-19) |
| II | SEO em Primeiro Lugar | ✅ | Declaração completa de schema, canônica, sitemap e vínculo geográfico por superfície em [contracts/routes.md](./contracts/routes.md); sitemaps e feeds gerados do conteúdo (D-20); registro de slugs de município validado em build (D-13) — resolve o `TODO(CITY_SLUG_REGISTRY)` da Constituição |
| III | Acessibilidade | ✅ | Componentes semânticos por contrato ([component-inventory.md](./contracts/component-inventory.md), item 4); axe-core em cada superfície nos dois temas; `alt` obrigatório no schema `MediaRef`; `prefers-reduced-motion` respeitado |
| IV | Segurança | ✅ (por ausência) | Nada de autenticação, sessão ou permissão nesta fase (FR-038). Admin não indexável e bloqueado na borda. Nenhum segredo versionado; nenhuma credencial no frontend. Cabeçalhos de segurança como configuração versionada (D-23) |
| V | Integridade Editorial | ✅ | `GazetteStatus` sem aresta de `fila_ia` para `publicado` ([data-model.md](./data-model.md)); `PipelineStage` com a etapa "Editor" fixa e não omissível; `attribution` obrigatória quando `curation.kind = curated`; `sourceRef` do documento oficial nunca opcional; `sponsored` no contrato |
| VI | Consistência do Design System | ✅ | DS vendorizado byte-idêntico com verificação de hash (D-06); Tailwind referencia tokens, não os copia (D-04); duas verificações de literal, incluindo classes utilitárias arbitrárias (D-17); inventário com definição única por componente |
| VII | Backend API-First | ✅ | OpenAPI 3.1 é a fonte de verdade e os tipos são gerados dele (D-10); frontends consomem exclusivamente `packages/api-client` (D-12); porta `SearchEngine` decidida sem acoplar SDK (D-14); zero regra de negócio no frontend (FR-026, contrato item 5) |
| VIII | Monólito Modular | ✅ | 14 módulos de domínio com separação Domain/Application/Infrastructure/Http (D-15), fronteiras verificadas por Deptrac (D-16); tipos de extensão de ingestão (`Source`, `Connector`, `IngestionJob`, …) definidos sem implementação; nenhuma aplicação além das duas necessárias |
| IX | Testabilidade | ✅ | Matriz de teste mapeada portão a portão (D-19); TDD obrigatório onde a Constituição manda (domínio, contratos); componentes visuais cobertos por a11y + dois temas; sem baseline de pixel, que produziria teste instável |
| X | Observabilidade | ➖ N/A | Não há runtime de servidor, fila ou job nesta fase. Coleta de Core Web Vitals de campo (RUM) e logs estruturados entram com o primeiro deploy — registrado como pendência |
| XI | Progressive Enhancement | ✅ | Componentes `.astro` renderizados no servidor (D-05); formulários por submissão HTML nativa; navegação por `<a href>` real; projeto de teste dedicado sem JavaScript; ícones e fontes sem dependência de terceiro no caminho crítico |
| XII | Simplicidade de Infraestrutura | ✅ | pnpm workspaces sem orquestrador (D-01); um linter por linguagem (D-18); nenhum serviço provisionado (D-23); Meilisearch decidido mas **não** provisionado; cada dependência de cliente com custo declarado em KB (tabela em research.md) |

**Restrições Arquiteturais Obrigatórias**: stack conforme a tabela da Constituição. Único
ponto em aberto que ela delegava a este plano — o motor de busca — foi decidido:
**Meilisearch atrás da porta `SearchEngine`** (D-14), sem integração nesta fase.

**Reavaliação pós-Fase 1**: os artefatos de design (data-model, contratos, quickstart) não
introduziram violação nova. As duas entradas de Complexity Tracking abaixo permanecem as
únicas, ambas conscientes e ambas com critério de reversão.

## Project Structure

### Documentation (this feature)

```text
specs/001-fundacao-prototipo-monorepo/
├── plan.md                        # Este arquivo
├── spec.md                        # Especificação (entrada)
├── research.md                    # Fase 0 — 23 decisões
├── data-model.md                  # Fase 1 — entidades, invariantes, máquina de estados
├── quickstart.md                  # Fase 1 — 13 cenários de validação
├── contracts/
│   ├── openapi-v1.yaml            # Contrato de leitura da API (fonte de verdade dos tipos)
│   ├── routes.md                  # 25 superfícies + declaração de SEO exigida pelo Princípio II
│   └── component-inventory.md     # 31 componentes do DS + 5 adições justificadas
├── checklists/
│   └── requirements.md            # Já existente
└── tasks.md                       # Fase 2 — gerado por /speckit-tasks, NÃO por este comando
```

### Source Code (repository root)

```text
apps/
├── web/                           # Portal público — Astro 5 estático
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.astro                    # Home
│   │   │   ├── noticia/[slug].astro
│   │   │   ├── editoria/[slug].astro
│   │   │   ├── [municipio]/index.astro        # Hub de município (getStaticPaths do registro)
│   │   │   ├── [municipio]/[bairro].astro
│   │   │   ├── busca.astro · eventos.astro · utilidade-publica.astro
│   │   │   ├── diario-oficial.astro · empresas.astro · anuncie.astro
│   │   │   ├── autor/[slug].astro · newsletter.astro · 404.astro
│   │   │   ├── componentes/                   # Inventário vivo (noindex, FR-005)
│   │   │   ├── robots.txt.ts · sitemap-*.xml.ts
│   │   │   └── rss/[secao].xml.ts · rss/[municipio].xml.ts
│   │   ├── layouts/ · lib/ (acesso a dados, SEO, JSON-LD) · scripts/ (enriquecimento TS)
│   │   └── styles/
│   ├── scripts/validate-slug-registry.ts      # prebuild — SC-009
│   └── astro.config.mjs · tsconfig.json
└── admin/                         # Painel — mesma stack, noindex, sem autenticação
    └── src/pages/                 # 11 superfícies (ver contracts/routes.md)

packages/
├── design-system/
│   ├── vendor/parna-badigital-design-system-fe257784-…/   # BYTE-IDÊNTICO ao importado
│   │   ├── tokens/{base,colors,elevation,fonts,motion,spacing,typography}.css
│   │   ├── styles.css · _ds_bundle.js · _ds_manifest.json · _adherence.oxlintrc.json · readme.md
│   ├── src/
│   │   ├── index.css                          # @import dos tokens + @theme inline
│   │   └── theme/{dark,fonts-local,icons}.css # Overlays — D-07, D-08, D-09
│   └── MANIFEST.sha256                        # Verificado em CI — SC-017
├── ui/                            # 36 componentes .astro — definição única (SC-012)
│   └── src/{core,brand,news,navigation,widgets,tourism,ads,overlay,feedback,data}/
├── types/
│   └── src/generated/api-v1.ts    # Gerado do OpenAPI, versionado (D-10)
├── api-client/
│   └── src/
│       ├── ports/                 # Interfaces de repositório
│       ├── transports/{mock,http}.ts
│       ├── data/municipalities.ts # Registro CANÔNICO de slugs (D-13)
│       └── mock/data/             # Dados demonstrativos do protótipo
└── validation/                    # Schemas Zod — build/servidor apenas (D-11)

backend/api/                       # Laravel 13.25 PRESERVADO no lugar (FR-020, D-15)
└── app/
    ├── Domain/<Módulo>/           # 14 módulos, sem dependência de framework
    ├── Application/<Módulo>/
    ├── Infrastructure/<Módulo>/
    └── Http/                      # Existente
    # + deptrac.yaml, phpstan.neon, tests/ (Pest)

docs/
├── architecture.md · frontend.md · backend.md · design-system.md · seo.md
├── performance.md · editorial-pipeline.md · ingestion.md · infrastructure.md
└── decisions/                     # ADRs — no mínimo as 5 exigidas por FR-037

infrastructure/                    # docker-compose.dev.yml, _headers, .env.example (não executado em CI)
scripts/                           # check-tokens.ts, check-ds-integrity.ts
.github/workflows/                 # Os 8 portões de qualidade
pnpm-workspace.yaml · .nvmrc · package.json
```

**Structure Decision**: monorepo pnpm com duas aplicações e **exatamente cinco** pacotes
compartilhados, conforme FR-019. Três desvios da estrutura sugerida no pedido original, todos
deliberados e registrados:

1. **`backend/api/`, não `backend/laravel/`** — a aplicação Laravel 13.25 já existe ali;
   movê-la produziria ruído de histórico sem ganho (FR-020, Assumption 1). Vira ADR.
2. **Sem `packages/config`** — o pedido sugeria seis pacotes; configuração compartilhada
   (TS base, ESLint, Prettier) cabe em arquivos raiz herdados por `extends`. FR-027 proíbe
   pacote não consumido por esta fase.
3. **Dados demonstrativos dentro de `packages/api-client`, não em pacote próprio** — são
   consumidos exclusivamente pelo transporte `mock`; separá-los criaria um pacote com um só
   consumidor (D-12).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **Deptrac** — sexta ferramenta de verificação no backend (Princípio XII: cada peça exige justificativa) | O Princípio VIII declara que acesso direto ao namespace interno de outro módulo é violação. Sem verificação automatizada isso é uma frase de documento, e a primeira pressa a desfaz | PHPStan com regras customizadas: dá para fazer, mas escrever e manter as regras de camada custa mais que um arquivo de configuração declarativo. Revisão humana apenas: não é portão, e o Princípio VIII pede que seja. **Reversão**: remover quando os módulos virarem pacotes Composer com fronteira física |
| **Valores literais dentro de `packages/design-system/src/theme/dark.css`** — exceção ao Princípio VI, que proíbe literal visual | O Design System importado **não publica tema escuro**; a paleta escura só existe dentro do protótipo. FR-009 exige tema escuro em toda superfície. Os valores extraídos precisam entrar em algum lugar | Inventar uma paleta escura: redesenho, proibido por FR-002. Duplicar o arquivo de tokens inteiro: viola FR-003. A exceção é confinada a um arquivo, redefine **apenas aliases semânticos** (nunca rampas `--pd-*`), exige `stylelint-disable` com justificativa, e é rastreável ao protótipo — que é a fonte de verdade visual. **Reversão**: devolver o bloco escuro ao projeto de design (`DesignSync`) e reimportar; o overlay some |

**Pendência registrada, não violação**: Princípio X (Observabilidade) não é exercitado nesta
fase por ausência de runtime de servidor, fila e produção. RUM de Core Web Vitals, logs
estruturados com correlação e métricas de fila entram com a primeira feature que tenha
deploy — devem ser exigidos no Constitution Check daquela feature, não nesta.
