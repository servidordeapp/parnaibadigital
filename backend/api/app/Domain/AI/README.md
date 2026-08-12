# Módulo AI — Assistência por automação

Resumo, reescrita e classificação. Sempre atrás de porta — nenhum SDK de fornecedor entra no domínio.

## Fronteira

Este módulo publica **apenas** o que está em `Contract/`. Nenhum outro módulo pode referenciar
o interior dele: `App\\Domain\\AI\\` fora de `Contract/` é território privado, e o Deptrac
reprova a referência (Princípio VIII, D-16).

Se outro módulo precisa de algo daqui, o caminho é publicar a interface em `Contract/` — não
importar a classe interna. A regra existe porque a alternativa é conhecida: um `use` isolado
hoje vira um grafo de dependências cruzadas em seis meses, e aí a separação em módulos passa a
ser só a estrutura de pastas.

## Conceitos publicados

- `SummarizerPort`
- `RewriterPort`
- `ClassifierPort`

## Camadas

| Camada | Diretório | Pode depender de |
|---|---|---|
| Domain | `app/Domain/AI/` | nada — nem de framework, nem de outro módulo |
| Application | `app/Application/AI/UseCase/` | o próprio Domain e os `Contract/` de outros módulos |
| Infrastructure | `app/Infrastructure/AI/Adapter/` | Application, Domain e o mundo externo (Laravel, HTTP, storage) |

A regra de dependência aponta sempre para dentro. `Domain` não sabe que Laravel existe — é
isso que permite testá-lo sem levantar a aplicação, e que permite trocar o framework sem
reescrever a regra de negócio.

## Estado nesta fase

**Nenhuma regra de negócio implementada** (FR-038): não há model persistido, migração,
endpoint nem coletor. O que existe aqui é a fronteira declarada, para que a próxima feature
saiba onde uma regra nova mora sem precisar abrir o código.
