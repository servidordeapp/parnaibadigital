# Quickstart — Validação da Fundação

**Feature**: 001-fundacao-prototipo-monorepo

Guia de execução e validação. **Não** contém código de implementação — isso pertence a
`tasks.md` e à fase de implementação. Cada cenário aqui prova um critério de aceitação da
[spec](./spec.md) e pode ser executado isoladamente.

## Pré-requisitos

| Ferramenta | Versão mínima | Verificado no ambiente |
|---|---|---|
| Node | 24 | v24.18.0 |
| pnpm | 11 | 11.10.0 |
| PHP | 8.4 | 8.5.7 |
| Composer | 2 | 2.10.1 |

Nenhum serviço de infraestrutura é necessário: PostgreSQL, Redis, RabbitMQ e Meilisearch
não são dependência de execução desta fase (D-23, Assumption 12).

## Instalação

```bash
pnpm install                       # workspaces: apps/* e packages/*
composer install -d backend/api    # backend; nenhuma migração roda
```

## Execução

```bash
pnpm --filter @parnaibadigital/web dev      # portal público  → http://localhost:4321
pnpm --filter @parnaibadigital/admin dev    # painel          → http://localhost:4322
pnpm --filter @parnaibadigital/web build    # build estático em apps/web/dist
```

---

## Cenários de validação

### V1 — As 25 superfícies existem e são alcançáveis (SC-001)

```bash
pnpm test:e2e --grep "@surfaces"
```

Percorre a navegação principal do portal e a lateral do admin, visita as 14 rotas públicas e
as 11 do painel do [contrato de rotas](./contracts/routes.md) e confirma que cada uma
responde 200 com endereço próprio. **Esperado**: 25 rotas verdes; a rota inexistente
retorna **404 real**, não 200 com página de erro.

### V2 — Paridade visual nos dois temas e nas duas larguras (SC-002)

```bash
pnpm test:e2e --grep "@themes"     # 360px e 1280px, claro e escuro
pnpm shots                          # captura as 25 superfícies em 4 combinações
```

O teste automatizado prova ausência de elemento herdado do tema errado e contraste ≥ 4,5:1.
A **paridade com o protótipo é revisão humana lado a lado** — as capturas de `pnpm shots`
existem para essa revisão. Qualquer desvio é registrado e aprovado antes da entrega.

### V3 — Conteúdo sem JavaScript (SC-007, Princípio XI)

```bash
pnpm test:e2e --project=no-js
```

Executa as 14 públicas com `javaScriptEnabled: false`. **Esperado**: título, subtítulo,
corpo, data, autor, vínculo de bairro e município, selo de curadoria e rodapé de atribuição
presentes no HTML; navegação, busca, paginação e formulário de newsletter operáveis.

### V4 — Tokens sem literais (SC-003, FR-004)

```bash
pnpm check:tokens
```

**Esperado**: zero achados. Para provar que o portão funciona, introduza `color: #123456` em
qualquer componente — a saída deve nomear arquivo, linha e o token que deveria ter sido
usado, e o comando deve sair com código diferente de zero.

### V5 — Acessibilidade (SC-004)

```bash
pnpm test:a11y
```

axe-core em cada superfície, nos dois temas. **Esperado**: zero violações WCAG 2.1 AA.

### V6 — SEO por superfície (SC-008)

```bash
pnpm build && pnpm test:seo
```

Sobre o `dist/`, verifica em cada página pública: canônica absoluta, Open Graph e Twitter
Cards completos, JSON-LD válido para o tipo declarado no [contrato de rotas](./contracts/routes.md),
e presença do vínculo geográfico. Verifica ainda a geração de `robots.txt`, dos sitemaps
(inclusive News e Image) e de um feed RSS por editoria e por município.

### V7 — Orçamentos de performance (SC-005, SC-006)

```bash
pnpm build && pnpm test:perf
```

Lighthouse CI sobre o build, perfil móvel/4G. **Esperado**: ≥ 95 nas quatro categorias,
LCP < 2,0 s, CLS < 0,05, INP < 200 ms, e **≤ 50 KB de JS comprimido** por página — a
estimativa do plano é < 8 KB (D-05).

### V8 — Registro de slugs impede colisão (SC-009)

Adicione ao registro um município com slug `eventos` e rode `pnpm build`.
**Esperado**: build reprovado, com mensagem nomeando o slug e a rota reservada em conflito.
Remova a entrada e o build volta a passar.

### V9 — Adicionar município é operação de dados (SC-010)

Acrescente um sexto município (nome, slug, código IBGE) ao registro e rode `pnpm build`.
**Esperado**: página hub, feed RSS e entrada em sitemap gerados **sem alterar nenhuma rota,
template ou script**. `git status` mostra exatamente um arquivo de dados modificado.

### V10 — Trocar a origem dos dados não toca componente (SC-011)

```bash
PD_DATA_TRANSPORT=http pnpm --filter @parnaibadigital/web build
```

**Esperado**: a construção falha na camada de dados (o transporte HTTP é stub, sem API), e
**nenhum componente de tela precisa de alteração** para a troca. `git diff` vazio fora da
variável de ambiente.

### V11 — Contratos definidos, zero endpoints (SC-015)

```bash
pnpm types:generate && git diff --exit-code packages/types/src/generated
pnpm validate:mocks
```

O primeiro comando prova que os tipos versionados correspondem ao
[OpenAPI](./contracts/openapi-v1.yaml). O segundo valida os dados demonstrativos contra os
mesmos schemas. **Esperado**: ambos verdes, e `backend/api/routes/api.php` sem rota de
recurso implementada.

### V12 — Fronteiras de módulo do backend (Princípio VIII)

```bash
composer -d backend/api test        # Pest
composer -d backend/api analyse     # PHPStan nível 8
composer -d backend/api deptrac     # fronteiras de módulo e de camada
```

**Esperado**: zero violações. Para provar o portão, faça um módulo referenciar diretamente o
namespace interno de outro — o Deptrac deve reprovar.

### V13 — Design System byte-idêntico (SC-017)

```bash
pnpm check:ds-integrity
```

Recalcula os hashes de `packages/design-system/vendor/**` contra `MANIFEST.sha256`.
**Esperado**: zero divergências. Adaptações vivem em `src/theme/` e nunca no diretório
vendorizado (D-06).

---

## Portão único de CI

```bash
pnpm verify
```

Encadeia, na ordem: `lint` → `typecheck` → `check:tokens` → `check:ds-integrity` →
`validate:mocks` → `test` (unit) → `build` → `test:seo` → `test:a11y` → `test:e2e` →
`test:perf`, mais os três comandos PHP de V12. Corresponde exatamente aos oito portões de
qualidade da Constituição. Nenhum é dispensável pelo próprio autor.

## Definição de pronto desta fase

Todos os cenários V1–V13 verdes, a revisão visual lado a lado de V2 aprovada, e as nove áreas
de documentação arquitetural publicadas com as cinco decisões exigidas por FR-037 registradas
em `docs/decisions/`.
