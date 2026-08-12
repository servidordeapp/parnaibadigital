# ParnaíbaDigital

Portal de notícias do Delta do Parnaíba — Parnaíba, Luís Correia, Ilha Grande, Buriti dos Lopes
e Cajueiro da Praia.

Este repositório está na **fase de fundação**: as 25 superfícies do protótipo reproduzidas sobre
dados demonstrativos tipados, com o Design System preservado e os portões de qualidade ativos.
Não há banco, autenticação, coleta automatizada nem integração de terceiro — a lista completa do
que **não** existe nesta fase está em [FR-038](specs/001-fundacao-prototipo-monorepo/spec.md) e
a verificação está registrada em
[`exclusions-audit.md`](specs/001-fundacao-prototipo-monorepo/exclusions-audit.md).

## Estrutura

| Caminho                   | O que vive aqui                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------- |
| `apps/web/`               | Portal público — Astro estático, 14 superfícies, porta 4321                            |
| `apps/admin/`             | Painel editorial — Astro estático, 11 superfícies, porta 4322                          |
| `packages/design-system/` | Design System importado (`vendor/`, **nunca editado**) e as adaptações em `src/theme/` |
| `packages/ui/`            | Componentes `.astro` compartilhados pelas duas aplicações                              |
| `packages/types/`         | Tipos gerados do contrato OpenAPI — saída versionada                                   |
| `packages/validation/`    | Schemas Zod e as 7 regras transversais do domínio                                      |
| `packages/api-client/`    | Portas de dados, transportes (mock/http) e os dados demonstrativos                     |
| `backend/api/`            | Laravel — monólito modular, contratos declarados, **zero endpoint** nesta fase         |
| `docs/`                   | Documentação arquitetural e ADRs em `docs/decisions/`                                  |
| `infrastructure/`         | Ambiente de desenvolvimento e cabeçalhos — não executado em CI                         |
| `scripts/`                | Verificadores que reprovam a construção (tokens, integridade do DS)                    |
| `specs/`                  | Especificação, plano, contratos e tarefas da fase                                      |

## Pré-requisitos

Node 24 (`.nvmrc`), pnpm 11, PHP 8.4 e Composer 2. Nenhum serviço de infraestrutura é necessário:
PostgreSQL, Redis, RabbitMQ e Meilisearch aparecem como definição de ambiente, não como
dependência de execução.

```bash
pnpm install
composer install -d backend/api
```

## Comandos

```bash
pnpm dev                 # portal público  → http://localhost:4321
pnpm dev:admin           # painel          → http://localhost:4322
pnpm build               # build estático das duas aplicações
pnpm verify              # todos os portões, na ordem em que a CI os roda
```

Portões individuais, do mais barato ao mais caro:

| Comando                   | O que reprova                                                   |
| ------------------------- | --------------------------------------------------------------- |
| `pnpm lint`               | ESLint, Stylelint e Prettier                                    |
| `pnpm typecheck`          | TypeScript estrito e `astro check`                              |
| `pnpm check:tokens`       | qualquer cor, espaçamento ou tipografia literal fora dos tokens |
| `pnpm check:ds-integrity` | qualquer byte alterado em `packages/design-system/vendor/**`    |
| `pnpm validate:mocks`     | dado demonstrativo que não satisfaz o schema do contrato        |
| `pnpm test`               | testes de unidade, de contrato e de documentação                |
| `pnpm test:seo`           | canônica, Open Graph, JSON-LD e sitemaps sobre o `dist/`        |
| `pnpm test:a11y`          | violação WCAG 2.1 AA, nas 25 superfícies e nos dois temas       |
| `pnpm test:e2e`           | comportamento em 360px, 1280px e **sem JavaScript**             |
| `pnpm test:perf`          | orçamento Lighthouse e ≤ 50 KB de JS comprimido por página      |

Backend:

```bash
composer -d backend/api test      # Pest
composer -d backend/api analyse   # PHPStan nível 8
composer -d backend/api deptrac   # fronteiras de módulo e de camada
```

## Regras que a construção faz valer

Não são convenções de revisão — cada uma tem um comando que reprova.

- **O Design System vendorizado nunca é editado.** Adaptação vive em `src/theme/`; o
  `MANIFEST.sha256` reprova qualquer divergência.
- **Zero literal visual.** Cor, espaçamento, raio, sombra, tipografia e duração vêm de token.
- **A página serve sem JavaScript.** Conteúdo, navegação, busca e paginação funcionam com script
  desligado; o projeto `no-js` do Playwright prova isso a cada execução.
- **Todo conteúdo tem vínculo geográfico.** Omitir o município em `News` não compila.
- **Adicionar município é operação de dados.** Rotas, feeds e sitemaps derivam do registro
  canônico; nenhuma rota é escrita por município.
- **Nenhum recurso de terceiro no caminho crítico.** Fontes auto-hospedadas, ícones inlinados em
  build.

## Documentação

| Documento                                                  | Responde                                                |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| [`docs/architecture.md`](docs/architecture.md)             | monorepo, fronteiras, fluxo de dados                    |
| [`docs/frontend.md`](docs/frontend.md)                     | Astro estático, ilhas, orçamento de JS                  |
| [`docs/backend.md`](docs/backend.md)                       | camadas, regra de dependência, onde uma regra nova mora |
| [`docs/design-system.md`](docs/design-system.md)           | como consumir token e escolher componente               |
| [`docs/seo.md`](docs/seo.md)                               | taxonomia geográfica, canônicas, schemas, sitemaps      |
| [`docs/performance.md`](docs/performance.md)               | orçamentos e o que reprova o build                      |
| [`docs/editorial-pipeline.md`](docs/editorial-pipeline.md) | as 8 etapas e a revisão humana não-pulável              |
| [`docs/ingestion.md`](docs/ingestion.md)                   | como adicionar uma fonte sem alterar o núcleo           |
| [`docs/infrastructure.md`](docs/infrastructure.md)         | ambiente de desenvolvimento e cabeçalhos                |

Decisões tomadas e seus critérios de reversão estão em
[`docs/decisions/`](docs/decisions/). A Constituição do projeto vive em
`.specify/memory/constitution.md` e vence qualquer conflito com a especificação.
