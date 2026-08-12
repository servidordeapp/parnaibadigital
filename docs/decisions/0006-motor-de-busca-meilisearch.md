# ADR 0006 — Motor de busca: Meilisearch atrás da porta `SearchEngine`

**Situação**: aceita (decisão tomada; **nada integrado nesta fase**) · **Data**: 2026-08-11
**Feature**: 001-fundacao-prototipo-monorepo
**Referências**: D-14 · FR-038 · Princípio XI · Princípio XII · Constituição v2.0.0

## Problema

A Constituição exige que o motor de busca seja **decidido no plano** — é um dos pontos que
ela delega explicitamente ao `/speckit.plan`, em vez de fixar. Ao mesmo tempo, FR-038 proíbe
implementar busca real nesta fase.

Decidir sem integrar parece contraditório, mas não é: o custo de uma escolha de motor de
busca não está na integração, está no **acoplamento do SDK**. Um cliente de busca proprietário
espalha chamadas por telas e por regras, e a saída depois custa reescrever tudo que o tocou.
Decidir cedo e escrever a porta é o que impede esse espalhamento antes que ele comece.

## Decisão

**Meilisearch**, consumido exclusivamente através da porta de domínio
`backend/api/app/Domain/Search/Contract/SearchEngine.php`.

**Nesta fase existe apenas a interface.** Nenhuma instância provisionada, nenhum SDK
instalado, nenhum índice. O `docker-compose.dev.yml` traz o serviço definido — e não
executado por CI (D-23).

A busca do protótipo (`/busca`) funciona sobre os dados demonstrativos, filtrando em build,
por `GET` HTML nativo. Ela é funcional sem JavaScript, como o Princípio XI exige.

## Alternativas rejeitadas

**Algolia.** Cobra por operação de busca e por registro indexado. Num produto financiado por
publicidade, o mesmo crescimento de tráfego que gera receita geraria custo variável — e o
custo chega antes da receita, porque impressão de anúncio paga menos por evento do que uma
busca custa. Some-se o acoplamento: o padrão de uso do Algolia é busca-como-você-digita pelo
cliente, com o SDK no navegador, o que colide com o Princípio XI (busca é funcionalidade
essencial e precisa operar sem JavaScript) e com o orçamento de 50 KB. A migração de saída é
cara exatamente por isso.

**Busca full-text do PostgreSQL** (`tsvector` + `pg_trgm`). É suficiente para ~5 artigos por
dia, não adiciona serviço nenhum, e o Princípio XII a favorece. **Não foi rejeitada por ser
ruim** — foi rejeitada como _decisão antecipada_. A porta `SearchEngine` existe justamente
para não escolher isso agora: se o PostgreSQL bastar quando a busca for implementada, o
Meilisearch nunca é provisionado, e isso conta como vitória do Princípio XII, não como
decisão revertida.

**Elasticsearch / OpenSearch.** Operacionalmente pesado para o porte: JVM, tuning de heap,
cluster para ter disponibilidade. Resolve problemas de escala que este produto não tem e
provavelmente não terá.

**Adiar a decisão.** É o que a Constituição proíbe. Deixar em aberto significa que a primeira
pessoa a precisar de busca decide sozinha, sob prazo, e a escolha entra pelo caminho mais
curto — que costuma ser o SDK de cliente do fornecedor mais fácil de contratar.

## Por que Meilisearch, quando chegar a hora

- **Auto-hospedável no mesmo host da aplicação.** Um contêiner, sem cluster, sem JVM
  (Princípio XII: infraestrutura mínima, custo previsível).
- **Custo não escala com tráfego.** É o eixo que cresce num produto de publicidade.
- **Português pronto**: tokenização e _stop words_ sem configuração adicional. Busca por
  "ação" precisa achar "acao", e isso não é detalhe num portal brasileiro.
- **Tolerância a erro de digitação por padrão** — relevante para tráfego móvel regional.
- Se for preciso sair, a porta é o único ponto que conhece o motor.

## Consequências

- `SearchRepository` no frontend (`packages/api-client/src/ports/`) e `SearchEngine` no
  backend são a mesma fronteira vista dos dois lados. Nenhuma tela conhece o motor.
- A busca desta fase é honesta sobre o que é: filtro sobre dados demonstrativos. Não há
  promessa de relevância; há endereço, formulário nativo e estado vazio anunciado a
  tecnologia assistiva.
- Nenhum SDK entra no `composer.json` nesta fase — verificável.

## Critério de reversão

A decisão é revista **quando a busca for de fato implementada**, e o gatilho é medível: se o
volume indexado couber confortavelmente em busca full-text do PostgreSQL com relevância
aceitável nos termos que os leitores realmente usam, implementa-se o `SearchEngine` sobre o
PostgreSQL e o Meilisearch nunca sobe. Trocar depois é escrever um segundo adaptador da
mesma porta — que é precisamente o que esta ADR compra ao decidir agora sem integrar.
