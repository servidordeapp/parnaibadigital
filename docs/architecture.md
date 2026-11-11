# Arquitetura

**Feature**: 001-fundacao-prototipo-monorepo

Este documento responde a pergunta que mais se repete num monorepo: **onde uma coisa nova
mora**. Se depois de lê-lo você ainda precisar abrir o código para descobrir isso, o
documento falhou.

---

## O mapa

```text
apps/
├── web/       Portal público — Astro 5 estático, 14 superfícies
└── admin/     Painel editorial — mesma stack, noindex, sem autenticação

packages/
├── design-system/  Tokens do DS vendorizados + os 3 overlays obrigatórios
├── ui/             39 componentes .astro — DEFINIÇÃO ÚNICA para as duas aplicações
├── types/          Tipos GERADOS do OpenAPI (nunca escritos à mão)
├── api-client/     Portas de repositório, transportes e dados demonstrativos
└── validation/     Schemas Zod e as 7 regras transversais

backend/api/    Laravel 13 — 14 módulos de domínio, sem regra de negócio nesta fase
docs/           Este diretório
infrastructure/ docker-compose de desenvolvimento, cabeçalhos de borda, .env.example
scripts/        Verificadores de token e de integridade do DS
```

## As três fronteiras que importam

### 1. `packages/ui` é a única definição de componente

Portal e painel são a **mesma stack** justamente para que isso seja possível (D-05). Um
componente vive em `packages/ui/src/<grupo>/` e é importado pelo barril
`@parnaibadigital/ui` — nunca pelo caminho interno.

O que sustenta a regra: `packages/ui/tests/no-duplicates.test.ts` reprova a construção se o
mesmo nome de componente aparecer duas vezes, ou se um componente nascer dentro de uma
aplicação. Sem esse teste, "zero duplicação" seria aspiração (SC-012).

### 2. As telas conversam com **portas**, nunca com transportes

```text
tela → @parnaibadigital/api-client (porta) → transporte (mock | http)
```

A escolha do transporte acontece **em um lugar só**, por `PD_DATA_TRANSPORT`. É isso que
permite trocar módulo TypeScript por HTTP na próxima fase sem alterar uma linha de página —
e é o custo que essa camada existe para não pagar depois (D-12).

### 3. O contrato vem antes do código

`specs/001-fundacao-prototipo-monorepo/contracts/openapi-v1.yaml` é a fonte de verdade.
`packages/types` é **gerado** dele, e um teste reprova se alguém esquecer de regerar. Tipo de
domínio escrito à mão seria a segunda fonte de verdade — e a que divergiria primeiro.

---

## Fluxo de dados desta fase

```text
mock/data/*.ts  →  transporte mock  →  porta  →  página .astro  →  HTML estático
       ↑                                              ↓
validate:mocks (Zod + 7 regras)              JSON-LD, sitemaps, RSS
```

Tudo acontece em **tempo de construção**. Não há runtime de servidor no frontend: é isso que
permite o portal inteiro sair como arquivo estático servido por CDN, e é a base do orçamento
de performance (Princípio I).

---

## O que é e o que **não** é desta fase

| É desta fase                                       | Não é desta fase                                  |
| -------------------------------------------------- | ------------------------------------------------- |
| 25 superfícies navegáveis com dados demonstrativos | Qualquer regra de negócio                         |
| Design System importado, verificado por hash       | Banco de dados, migração, model persistido        |
| Tipos gerados do contrato OpenAPI                  | Endpoint de API implementado                      |
| 14 módulos de domínio com fronteira verificada     | Autenticação, sessão, permissão                   |
| Portas de ingestão, busca e storage declaradas     | Coletor, Meilisearch, SDK de storage              |
| SEO completo: schema, sitemap, RSS, canônica       | Rede de anúncios, provedor de IA, envio de e-mail |

A lista da direita é FR-038, e não é uma lista de pendências: é o **escopo que esta fase
deliberadamente não tem**. Se uma implementação parecer exigir algo dela, é sinal de escopo
vazando, não de tarefa faltando.

---

## Onde uma regra nova mora

| A regra é sobre…                                         | Vai em                                                |
| -------------------------------------------------------- | ----------------------------------------------------- |
| como um conteúdo se comporta (invariante, estado válido) | `backend/api/app/Domain/<Módulo>/`                    |
| orquestrar passos para atender um pedido                 | `backend/api/app/Application/<Módulo>/UseCase/`       |
| falar com banco, fila, storage, API externa              | `backend/api/app/Infrastructure/<Módulo>/Adapter/`    |
| como um dado é **exibido**                               | a tela `.astro`, nunca o componente (FR-026)          |
| aparência de um componente                               | `packages/ui` — e só se o DS não publicar equivalente |
| forma de um dado que trafega                             | `contracts/openapi-v1.yaml`, e então regerar os tipos |

Ver `docs/backend.md` para o detalhe das camadas e `docs/frontend.md` para o do frontend.
