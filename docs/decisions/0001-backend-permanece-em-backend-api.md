# ADR 0001 — O backend permanece em `backend/api/`

**Situação**: aceita · **Data**: 2026-08-11 · **Feature**: 001-fundacao-prototipo-monorepo
**Referências**: FR-020 · Assumption 1 · D-15 · Princípio VIII

## Problema

O pedido original do monorepo sugeria `backend/laravel/` como local do backend. A aplicação
Laravel 13.25 já existia em `backend/api/`, com histórico de commits, `composer.lock`,
configuração e o esqueleto do framework no lugar.

Decidir tarde é pior que decidir agora: cada arquivo novo criado sob o caminho antigo
aumenta o custo de mover, e "a gente move depois" costuma virar dois caminhos convivendo.

## Decisão

**O backend fica onde está: `backend/api/`.** Nenhum arquivo é movido. A modularidade exigida
pelo Princípio VIII entra por namespace e regra de dependência dentro de `app/`, não por
mudança de diretório raiz.

Toda a documentação, os scripts e o workflow de CI referenciam `backend/api/`.

## Alternativas rejeitadas

**Mover para `backend/laravel/`.** Produziria um commit de renomeação atravessando a
aplicação inteira, quebrando `git blame` e a leitura do histórico, para render um nome de
diretório marginalmente mais descritivo. O ganho é estético; o custo é permanente. O nome
`api` também descreve melhor o papel da aplicação nesta arquitetura — ela serve a API que os
dois frontends consomem (Princípio VII), e não é "o Laravel" genérico.

**Manter os dois caminhos, com um symlink ou um redirecionamento de autoload.** Dois nomes
para a mesma coisa é a pior opção das três: quem chega precisa aprender ambos, e as
ferramentas (PHPStan, Deptrac, Pest) passam a exigir configuração para não analisar o mesmo
código duas vezes.

## Consequências

- O `paths` do PHPStan, do Deptrac e do Pest aponta para `backend/api/`; nenhum precisa de
  exceção.
- O `pnpm-workspace.yaml` não inclui `backend/*` — o backend não é pacote Node, e os três
  comandos PHP do `pnpm verify` são executados pelo workflow de CI, não pelo pnpm.
- A estrutura sugerida no pedido original diverge do que foi construído. A divergência está
  registrada no "Structure Decision" do [plan.md](../../specs/001-fundacao-prototipo-monorepo/plan.md).

## Critério de reversão

Mover a aplicação passa a valer a pena quando **uma segunda aplicação PHP** entrar no
repositório e o nome `api` deixar de distinguir — por exemplo, um worker de ingestão
separado. Nesse momento, a renomeação acontece junto da introdução da segunda aplicação, num
único commit de reorganização, e não isolada.
