# Módulo Editorial — Fluxo editorial

As 8 etapas do pipeline e a revisão humana obrigatória. A regra que nenhum outro módulo pode contornar.

## Fronteira

Este módulo publica **apenas** o que está em `Contract/`. Nenhum outro módulo pode referenciar
o interior dele: `App\\Domain\\Editorial\\` fora de `Contract/` é território privado, e o Deptrac
reprova a referência (Princípio VIII, D-16).

Se outro módulo precisa de algo daqui, o caminho é publicar a interface em `Contract/` — não
importar a classe interna. A regra existe porque a alternativa é conhecida: um `use` isolado
hoje vira um grafo de dependências cruzadas em seis meses, e aí a separação em módulos passa a
ser só a estrutura de pastas.

## Conceitos publicados

- `PipelineStage`
- `EditorialReview`

## Camadas

| Camada | Diretório | Pode depender de |
|---|---|---|
| Domain | `app/Domain/Editorial/` | nada — nem de framework, nem de outro módulo |
| Application | `app/Application/Editorial/UseCase/` | o próprio Domain e os `Contract/` de outros módulos |
| Infrastructure | `app/Infrastructure/Editorial/Adapter/` | Application, Domain e o mundo externo (Laravel, HTTP, storage) |

A regra de dependência aponta sempre para dentro. `Domain` não sabe que Laravel existe — é
isso que permite testá-lo sem levantar a aplicação, e que permite trocar o framework sem
reescrever a regra de negócio.

## Estado nesta fase

**Nenhuma regra de negócio implementada** (FR-038): não há model persistido, migração,
endpoint nem coletor. O que existe aqui é a fronteira declarada, para que a próxima feature
saiba onde uma regra nova mora sem precisar abrir o código.
