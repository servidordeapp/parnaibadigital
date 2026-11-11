# Backend

**Feature**: 001-fundacao-prototipo-monorepo · Princípios VII e VIII

## Monólito modular, não microsserviços

Uma aplicação Laravel, 14 módulos de domínio dentro dela. A escolha é do Princípio VIII e
tem um critério: **fronteira lógica verificada custa quase nada; fronteira física custa
operação**. Enquanto a verificação automatizada segurar a separação, não há razão para pagar
o preço de processos separados.

O Laravel permanece em `backend/api/` — não foi movido para `backend/laravel/`. Movê-lo
produziria ruído de histórico sem ganho (ADR 0001).

## As quatro camadas

```text
Http           → recebe e responde. Nada decide aqui.
Application    → orquestra passos para atender um pedido.
Domain         → a regra. Não conhece Laravel, não conhece HTTP, não conhece banco.
Infrastructure → fala com o mundo: banco, fila, storage, API externa.
```

**A regra de dependência aponta sempre para dentro.** `Domain` não importa nada de
`Illuminate\\` — e isso é verificado em teste, não pedido em revisão. O ganho é concreto: a
regra de negócio é testável sem levantar a aplicação, e trocar o framework não significa
reescrevê-la.

## Os 14 módulos

`News` · `Categories` · `Cities` · `Neighborhoods` · `Authors` · `Sources` ·
`OfficialGazette` · `Editorial` · `AI` · `Advertising` · `Analytics` · `Users` · `Media` ·
`Search`

Cada um tem `README.md` próprio declarando a fronteira, e um diretório `Contract/`.

## A regra de fronteira

> Um módulo publica **apenas** o que está em `Contract/`. Referenciar
> `App\\Domain\\<Outro>\\<QualquerCoisa>` fora de `Contract\\` é violação.

Duas verificações independentes, e as duas rodam:

1. **Deptrac** (`composer deptrac`) — análise estática de camadas, declarativa.
2. **`tests/Architecture/ModuleBoundariesTest.php`** (`composer test`) — roda junto da suíte,
   sem exigir ferramenta extra, e falha nomeando o arquivo, o módulo invadido e o que fazer.

A redundância é deliberada: uma verificação que exige lembrar de rodá-la deixa de ser portão.

## Onde uma regra nova mora

Comece pela pergunta **"isto continuaria verdade se trocássemos o banco, o framework e a
interface?"**

- **Sim** → `Domain/<Módulo>/`. Exemplos: "documento em `fila_ia` não pode ter matéria",
  "matéria curada exige atribuição", "bairro pertence a exatamente um município".
- **Não, depende de coordenar passos** → `Application/<Módulo>/UseCase/`. Exemplos:
  "aprovar rascunho e publicar", "ingerir uma fonte desde a última execução".
- **Não, depende de um fornecedor** → `Infrastructure/<Módulo>/Adapter/`. Exemplos: adaptador
  de Meilisearch, cliente de storage, coletor de RSS.

Se a regra é sobre **como algo aparece na tela**, ela não pertence ao backend — vai na página
`.astro`, e nunca dentro de um componente (FR-026).

## Portas declaradas nesta fase

Nenhuma tem implementação (FR-038). O que existe é o formato do encaixe:

| Porta                                                                                       | Módulo    | Para quê                                   |
| ------------------------------------------------------------------------------------------- | --------- | ------------------------------------------ |
| `Source`, `Connector`, `IngestionJob`, `RawDocument`, `NormalizedContent`, `EditorialDraft` | `Sources` | acrescentar uma fonte sem alterar o núcleo |
| `SearchEngine`                                                                              | `Search`  | Meilisearch decidido (D-14), não integrado |
| `MediaStorage`                                                                              | `Media`   | storage sem SDK de fornecedor no domínio   |

`EditorialDraft` merece nota: é um **tipo próprio**, não uma matéria com `publicado = false`.
Um booleano é fácil de inverter por engano; um tipo distinto obriga a passar pelo caso de uso
de aprovação — que é como o Princípio V vira código em vez de intenção.

## Nenhum endpoint nesta fase

`routes/api.php` não ganha rota de recurso, e `tests/Architecture/NoResourceRoutesTest.php`
reprova a construção se ganhar (SC-015). A tentação é real — com os módulos criados e os
tipos gerados, expor `/api/news` é trabalho de dez minutos. E seria escopo vazando.

## Ferramentas

| Comando            | O que faz                                |
| ------------------ | ---------------------------------------- |
| `composer test`    | Pest, incluindo os testes de arquitetura |
| `composer analyse` | PHPStan/Larastan nível 8                 |
| `composer deptrac` | fronteiras de camada e de módulo         |
