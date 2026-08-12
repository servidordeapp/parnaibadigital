# Pipeline editorial

**Feature**: 001-fundacao-prototipo-monorepo · **Princípio V**

## As 8 etapas, na ordem fixa

| #     | Etapa                                   | O que acontece                                         |
| ----- | --------------------------------------- | ------------------------------------------------------ |
| 1     | Documento encontrado                    | Varredura dos diários oficiais e fontes locais         |
| 2     | Análise                                 | Classificação de órgão, tipo de ato e relevância local |
| 3     | Resumo                                  | Resumo de três parágrafos em linguagem simples         |
| 4     | Reescrita                               | Título `[Bairro] + [fato]` e lide de 20 palavras       |
| 5     | SEO                                     | Slug, meta description, schema com vínculo geográfico  |
| 6     | Imagem                                  | Seleção no acervo local e crédito                      |
| **7** | **Editor — revisão humana obrigatória** | **Uma pessoa aprova. Sem isso, não publica.**          |
| 8     | Publicado                               | Portal, feeds, newsletter e alertas                    |

## Por que a etapa 7 não é pulável

Um produto que gera texto a partir de documento oficial e publica sozinho erra em público, no
nome de uma marca jornalística, sobre a vida de gente que mora ali. O custo de um erro desses
não é técnico.

A revisão humana não é uma etapa a mais na lista — é a **única** que a automação não
atravessa. E "não pulável" só significa alguma coisa se estiver no código, não no documento:

1. **No tipo.** `PipelineStage.requiresHumanReview` é `true` na etapa 7 e em nenhuma outra.
2. **Na máquina de estados.** `GazetteStatus` não tem aresta de `fila_ia` para `publicado`.
   A transição direta não é "proibida por convenção": ela não existe.
3. **No domínio.** `EditorialDraft` é um tipo próprio, não uma matéria com um booleano.
   `approvedBy()` devolver `null` é o estado normal de um rascunho, e nada publica um
   rascunho.
4. **Na representação.** `tests/e2e/admin-pipeline.spec.ts` exige a etapa presente em toda
   renderização, inclusive durante a animação e sob `prefers-reduced-motion`.

O item 4 costuma causar estranheza — por que testar uma tela por causa de uma regra editorial?
Porque a tela é o que a equipe olha todo dia. Se ela mostrar a automação atravessando a
revisão, ela está descrevendo um produto diferente do que existe.

## Transparência, do outro lado

O que o pipeline produz precisa se declarar ao leitor:

- **Selo de curadoria** (`CurationStamp`) em toda superfície de notícia. O DS é explícito:
  nunca esconder.
- **Rodapé de atribuição** quando o texto nasce de fonte externa: "Informações originais
  publicadas por [Veículo]", com link. É obrigatório por schema — `curation.kind = "curated"`
  sem `attribution` reprova a construção (regra 3 de `data-model.md`).
- **Aviso no rodapé de todas as telas**: "Conteúdo curado por automação com supervisão
  editorial humana".

A atribuição só aparece quando o texto é curado. Atribuir fonte a apuração própria seria
igualmente enganoso — a regra é "diga a verdade sobre a origem", não "mostre sempre".

## Estado nesta fase

Nenhum provedor de IA está integrado (FR-038). O painel reproduz a sequência; não a executa.
As portas de `AI` estão declaradas em `app/Domain/AI/Contract/`, sem implementação.
