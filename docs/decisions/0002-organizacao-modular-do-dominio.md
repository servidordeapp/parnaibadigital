# ADR 0002 — Organização modular do domínio

**Situação**: aceita · **Data**: 2026-08-11 · **Feature**: 001-fundacao-prototipo-monorepo
**Referências**: FR-020 · D-15 · D-16 · Princípio VIII · SC-015

## Problema

O Princípio VIII exige monólito modular: módulos com fronteira, e "acesso direto a tabelas ou
modelos internos de outro módulo é violação". O esqueleto padrão do Laravel organiza por
**tipo técnico** (`app/Models`, `app/Http/Controllers`, `app/Jobs`) — organização que não tem
onde registrar uma fronteira de módulo, porque tudo é vizinho de tudo.

Um portal de notícias com curadoria de IA tem áreas que evoluem em ritmos diferentes:
publicação editorial, ingestão de fontes, Diário Oficial, publicidade, analytics. Sem
separação, a regra de uma vaza para a outra no primeiro prazo apertado.

## Decisão

**Quatro camadas × catorze módulos, dentro do `app/` do Laravel existente**, sem tocar no
bootstrap do framework:

```text
backend/api/app/
├── Domain/<Módulo>/{Contract,…}   # a regra. Não conhece Laravel, HTTP nem banco
├── Application/<Módulo>/UseCase/  # orquestra passos para atender um pedido
├── Infrastructure/<Módulo>/Adapter/  # fala com o mundo: banco, fila, storage, API externa
└── Http/                          # recebe e responde. Nada decide aqui
```

Módulos: News, Categories, Cities, Neighborhoods, Authors, Sources, OfficialGazette,
Editorial, AI, Advertising, Analytics, Users, Media, Search.

**A fronteira é verificada, não pedida em revisão.** Duas verificações, deliberadamente
redundantes:

1. **Deptrac** (`backend/api/deptrac.yaml`) — análise estática de camada. Cada token pertence
   a exatamente uma camada; o interior de um módulo (`Domain_News`, `Application_News`,
   `Infrastructure_News`) **nunca aparece como destino permitido** de outro módulo. O único
   ponto de contato é `App\Domain\<Módulo>\Contract\`.
2. **`tests/Architecture/ModuleBoundariesTest.php`** (Pest) — roda junto da suíte, sem exigir
   ferramenta extra instalada, e falha nomeando o arquivo, o módulo invadido e o que fazer.

A redundância é intencional: o Deptrac é o portão preciso, o teste é o que dá a mensagem
legível a quem quebrou a regra às 18h de uma sexta-feira.

Nesta fase os módulos entram como **estrutura, contratos e testes de fronteira** — sem
migração, sem endpoint, sem model persistido (FR-038, SC-015).

## Alternativas rejeitadas

**Pacotes Composer por módulo** (`nwidart/laravel-modules` ou monorepo PHP com `path`
repositories). Dá fronteira **física**, que é mais forte que a lógica. Custa um ciclo de
release por módulo, `composer.json` por módulo e configuração de tooling multiplicada por
catorze — tudo isso enquanto os catorze módulos vivem no mesmo deploy e são alterados pelas
mesmas pessoas no mesmo commit. É pagar preço de distribuição sem ter distribuição.

**Manter a organização por tipo técnico e confiar em revisão de código.** É o estado de
partida, e o Princípio VIII pede explicitamente um portão. Revisão humana detecta a primeira
violação e perde a décima.

**DDD tático completo desde já** — agregados, repositórios genéricos, event sourcing. É
estrutura antes da necessidade, que o próprio Princípio VIII trata como custo. Os módulos
recebem `Contract/` porque a porta é o que a próxima fase vai implementar; não recebem
agregado porque ainda não há invariante de escrita para proteger.

## Consequências

- `Domain` não importa `Illuminate\` — verificado por teste. É o que permite testar regra de
  negócio sem levantar a aplicação.
- Um módulo que precisa de outro consome `App\Domain\<Outro>\Contract\…`. Se o contrato não
  tem o que ele precisa, a conversa é sobre **publicar** algo no contrato, e não sobre
  alcançar o interior — que é exatamente a conversa que se quer forçar.
- Sexta ferramenta de verificação no backend (Deptrac), registrada em Complexity Tracking no
  [plan.md](../../specs/001-fundacao-prototipo-monorepo/plan.md).
- `PhpInternal` é camada permitida para `Domain` e para os contratos: `DateTimeImmutable` num
  contrato é vocabulário da linguagem, não acoplamento a fornecedor.

## Critério de reversão

**Da verificação**: o Deptrac sai quando os módulos virarem pacotes Composer com fronteira
física — nesse momento o compilador faz o trabalho dele.

**Da estrutura**: se, depois de duas ou três features, a divisão em catorze módulos se
mostrar errada — um módulo que ninguém toca, dois que sempre mudam juntos —, a correção é
fundir ou dividir módulos, não abandonar a camada. Sinal concreto de que a divisão está
errada: um `Contract/` que cresce a cada feature porque o vizinho sempre precisa de mais.
