# ADR 0004 — Estratégia de dados demonstrativos

**Situação**: aceita · **Data**: 2026-08-11 · **Feature**: 001-fundacao-prototipo-monorepo
**Referências**: FR-016 · FR-019 · FR-025 · FR-027 · SC-011 · D-12 · Princípio VII

## Problema

As 25 superfícies precisam de conteúdo para serem navegáveis, e esta fase não tem backend
implementado nem banco (FR-038). O conteúdo vem, então, de dados demonstrativos.

O risco não é obter os dados — é o formato deles vazar para dentro das telas. Se uma página
lê um JSON diretamente, ela passa a conhecer a origem; vinte e cinco páginas fazendo isso
significam vinte e cinco lugares para mudar quando o backend existir. A promessa de SC-011 —
"trocar a origem dos dados não toca nenhum componente" — só é verificável se existir
**exatamente um** ponto de troca.

## Decisão

**Portas, dois transportes, uma chave de seleção.**

```text
tela  →  packages/api-client (porta)  →  transporte mock  →  src/mock/data/*.ts
                                     ↘   transporte http  →  (stub; nenhuma chamada real)
```

- **Portas** em `packages/api-client/src/ports/`: `NewsRepository`, `GeoRepository`,
  `GazetteRepository`, `EventRepository`, `CompanyRepository`, `UtilityRepository`,
  `SearchRepository`, `AuthorRepository` — tipadas por `@parnaibadigital/types`, que por sua
  vez é **gerado do OpenAPI**. A assinatura que a tela consome nasce do contrato, não do
  formato do mock.
- **Transporte `mock`**: lê `packages/api-client/src/mock/data/`. Ativo nesta fase.
- **Transporte `http`**: existe, implementa a mesma porta, e não faz chamada nenhuma —
  esta fase não tem endpoint (SC-015).
- **A seleção acontece num lugar só**: `PD_DATA_TRANSPORT` lida em
  `packages/api-client/src/index.ts`. Nenhum componente de tela sabe qual transporte está
  ativo; `tests/transport-swap.test.ts` prova isso.

**Os dados demonstrativos são validados na construção.** `validate-mocks.ts` roda todo mock
contra os schemas Zod de `@parnaibadigital/validation`, que espelham o OpenAPI. Um artigo sem
município primário, uma imagem sem `alt`, um conteúdo `curated` sem atribuição: qualquer um
reprova o build. Dado demonstrativo que não passaria no contrato real é dado que ensina a
tela a esperar algo errado.

**Dado canônico não é dado demonstrativo.** `packages/api-client/src/data/municipalities.ts`
— os cinco municípios e seus códigos IBGE — é canônico, mora fora de `mock/` e continua
válido quando o transporte virar `http`. A distinção está na pasta, e é proposital.

## Alternativas rejeitadas

**Um pacote `packages/mock-data` separado.** Seria um sexto pacote consumido por um único
consumidor (o transporte mock). FR-019 fixa cinco pacotes e FR-027 proíbe pacote não
consumido por esta fase. É uma pasta, não um pacote.

**MSW interceptando `fetch`.** Simula uma rede que não existe: o build é estático e não há
requisição a interceptar. Adiciona service worker e complexidade de build para produzir o
mesmo resultado.

**Ler JSON diretamente nas páginas.** Espalha o conhecimento da origem por 25 telas e mata
SC-011 — não haveria um ponto de troca, haveria 25.

**Content collections do Astro.** Acopla o formato dos dados ao framework do portal. O
painel administrativo é outra aplicação Astro e teria de duplicar a definição, ou pior,
importar o `src/content/` do portal.

**Gerar os dados por faker.** Dados aleatórios não reproduzem o protótipo. SC-002 exige
paridade visual com telas específicas — manchete `[Bairro] + [fato]`, tom urgente,
selo de curadoria. Os 12 artigos são os 12 artigos do protótipo, e não 12 artigos plausíveis.

## Consequências

- Trocar para o backend real é editar `PD_DATA_TRANSPORT` e implementar `transports/http.ts`.
  Nenhum `.astro` muda.
- Os dados demonstrativos incluem os casos difíceis de propósito: dois documentos oficiais
  **sem** matéria associada, notícia **sem** bairro, grupo de utilidade pública **vazio**.
  Um conjunto de dados só com o caminho feliz esconde exatamente os defeitos de layout que
  aparecem em produção.
- `packages/validation` roda em build e servidor, nunca no cliente (D-11) — Zod não entra no
  orçamento de 50 KB de JS.

## Critério de reversão

Quando o backend expuser os endpoints do `openapi-v1.yaml`, o transporte `http` passa a ser o
padrão e `mock/` **permanece**, servindo os testes e o ambiente de desenvolvimento offline.
Só faz sentido remover `mock/` se manter os dados demonstrativos alinhados ao contrato passar
a custar mais que o valor de desenvolver sem backend no ar — o que a validação automática em
build torna improvável.
