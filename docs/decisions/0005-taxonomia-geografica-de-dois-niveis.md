# ADR 0005 — Taxonomia geográfica de dois níveis

**Situação**: aceita · **Data**: 2026-08-11 · **Feature**: 001-fundacao-prototipo-monorepo
**Referências**: FR-022 · FR-024 · SC-009 · SC-010 · D-13 · Princípio II

## Problema

O produto cobre cinco municípios do litoral do Piauí — Parnaíba, Luís Correia, Ilha Grande,
Buriti dos Lopes e Cajueiro da Praia — e os bairros dentro deles. É um portal regional: a
pergunta que traz leitor do buscador é "o que aconteceu **no meu bairro**", e a resposta
precisa de uma página com endereço próprio.

Três problemas concretos:

1. **Homônimo.** "Centro" existe em Parnaíba e em Luís Correia. Um slug plano de bairro faz
   as duas notícias caírem na mesma página, e o leitor de uma cidade lê o trânsito da outra.
2. **Colisão de rota.** Se o hub de município fica na raiz (`/parnaiba`), qualquer município
   novo cujo slug coincida com uma seção (`/eventos`, `/busca`, `/empresas`) sequestra a
   seção — silenciosamente, porque o roteador atende a primeira que casar.
3. **Conteúdo sem lugar.** Uma notícia sem vínculo geográfico não entra em nenhum hub, não
   recebe `contentLocation` no JSON-LD e não aparece na busca regional. Ela existe e é
   invisível — que é a pior falha possível num produto cuja tese é justamente a cobertura de
   proximidade.

## Decisão

**Dois níveis: município é obrigatório, bairro é opcional e sempre qualificado.**

### O tipo impede o erro

`municipalityIbgeCode` é **obrigatório** em `News` no OpenAPI, portanto obrigatório no tipo
gerado. Omiti-lo não compila. `packages/types/tests/geo-required.test.ts` prova isso por
`@ts-expect-error` — se alguém tornar o campo opcional, o teste falha por _não_ haver erro.

Bairro é identificado por `{municipio}:{bairro}`, nunca só pelo nome. `centro` sozinho não é
um identificador válido no sistema; `parnaiba:centro` é.

### Chave estável: código IBGE

Municípios são chaveados por **código IBGE** (Parnaíba 2207702, Luís Correia 2205805, Ilha
Grande 2204550, Buriti dos Lopes 2202101, Cajueiro da Praia 2202174), não por slug. Slug é
apresentação e pode mudar; código IBGE é identidade e não muda. É também a chave que permite
cruzar com dado público sem tabela de-para.

### Registro canônico + validação em build

`packages/api-client/src/data/municipalities.ts` guarda os cinco municípios e, ao lado, a
lista de rotas reservadas de `contracts/routes.md`. `apps/web/scripts/validate-slug-registry.ts`
roda no `prebuild` das duas aplicações e **reprova a construção** nomeando o slug e a rota
conflitante (SC-009). O caso está coberto por teste: introduzir o slug `eventos` derruba o
build com a mensagem de conflito.

As páginas de município saem de `getStaticPaths()` **lido do registro** — nenhuma rota
codificada por município. Acrescentar uma cidade é editar uma linha de dados (SC-010).

### SEO

Cada nível tem endereço próprio, canônica absoluta e `Place` no JSON-LD; `NewsArticle`
carrega `contentLocation` apontando para o `Place` do município. É isso que faz a busca por
"trânsito Parnaíba" encontrar a página de Parnaíba, e não a home.

## Alternativas rejeitadas

**Um nível só (município).** Mais simples, e joga fora a tese do produto. A cobertura de
bairro é o que diferencia um portal regional de um agregador estadual, e a manchete no padrão
`[Bairro] + [fato]` que o protótipo estabelece ficaria sem página de destino.

**Três níveis (município → bairro → logradouro).** Estrutura antes da necessidade. Não há
volume editorial que sustente uma página por rua — cinco artigos por dia produziriam
centenas de páginas vazias, que é penalidade de _thin content_ em vez de alcance.

**Slug plano de bairro, sem qualificação.** Quebra no primeiro homônimo, e o litoral do Piauí
tem "Centro" em quase toda cidade. O custo de descobrir isso depois é redirecionamento e
perda de posição já conquistada.

**Bairro obrigatório também.** Notícias existem legitimamente sem bairro: uma decisão da
prefeitura vale para o município inteiro. Forçar bairro produziria vínculo inventado — e a
página de notícia precisa renderizar corretamente sem ele, o que é caso de teste explícito.

**Registro no backend desde já.** Não há backend nesta fase (FR-038). O registro em
TypeScript é o que permite validar em build.

## Consequências

- Adicionar um município: uma linha em `municipalities.ts`. As páginas, o sitemap e o feed
  RSS por município saem sozinhos, porque todos derivam do registro.
- Um slug de município que colida com seção reservada nunca chega a produção — reprova antes.
- Conteúdo sem município não existe no sistema: o compilador recusa antes do teste.

## Critério de reversão

Quando o backend expuser `/api/v1/municipalities`, o registro migra para lá e o arquivo
TypeScript vira **cache gerado** em vez de fonte. O validador de build permanece — a colisão
de slug com rota reservada é um problema de roteamento do frontend, e continua sendo problema
dele mesmo com o dado vindo da API.

Um terceiro nível só se justifica se o volume editorial por bairro crescer a ponto de a
página de bairro virar lista longa demais para ser útil — sinal concreto, mensurável, e que
não existe hoje.
