# Auditoria da lista de exclusão — FR-038

**Feature**: 001-fundacao-prototipo-monorepo · **Tarefa**: T144 · **Critério**: SC-016
**Data da execução**: 2026-08-12

SC-016 exige **zero** itens da lista de exclusão do FR-038 no código entregue. Este é o
registro da verificação.

## Escopo varrido

`apps/`, `packages/*/src`, `scripts/`, `backend/api/app`, `backend/api/routes`,
`backend/api/database`. Excluídos da varredura, por não serem código entregue:
`node_modules/`, `dist/`, `.astro/`, `packages/design-system/vendor/` (Design System
importado, byte-idêntico por SC-017) e `packages/types/src/generated/` (saída do contrato).

## Resultado

| # | Item proibido por FR-038 | Evidência procurada | Achados |
|---|---|---|---|
| 1 | Autenticação completa | `bcrypt`, `password_hash`, `Auth::`, `session(`, `jwt`, `passport`, `sanctum`, `login(` | **0** |
| 2 | Esquema definitivo de banco | `Schema::create`, `extends Model`, `Eloquent` fora do esqueleto | **0** — ver nota A |
| 3 | Pagamentos | `stripe`, `payment`, `pagseguro`, `mercadopago`, `checkout`, `pix`, `cobranca` | **0** |
| 4 | Integração real de publicidade | `adsbygoogle`, `googlesyndication`, `pagead`, `doubleclick`, `gpt.js` | **0** |
| 5 | Integração real com provedor de IA | `openai`, `anthropic`, `claude-`, `gpt-4`, `gemini`, `bedrock` | **0** |
| 6 | Integração real com Diário Oficial | URL de diário, `curl_`, `HttpClient`, `guzzle`, `node-fetch` | **0** |
| 7 | Busca real | `meilisearch`, `elasticsearch`, `algolia`, `typesense` | **0** — ver nota B |
| 8 | Analytics real | `gtag`, `googletagmanager`, `google-analytics`, `plausible`, `matomo`, `posthog`, `mixpanel` | **0** |
| 9 | Coleta automatizada de fontes | `cron`, `schedule->`, `crawler`, `scrape`, `puppeteer`, `rss-parser` | **0** |
| 10 | Filas de produção | `rabbitmq`, `amqp`, `ShouldQueue`, `dispatch(`, `Queue::`, `horizon`, `bull` | **0** |

**Resultado: SC-016 satisfeito.**

## Notas

**A — As três migrações presentes são do esqueleto do Laravel, não do domínio.**
`backend/api/database/migrations/` contém `create_users_table`, `create_cache_table` e
`create_jobs_table`, e `app/Models/User.php` é o model que veio com a instalação. Nenhuma
entidade do produto — notícia, município, bairro, editoria, autor, documento oficial — tem
migração ou model. O esquema do domínio, que é o que FR-038 proíbe, **não existe**.

Deixá-las é a escolha certa: removê-las mexeria no esqueleto do framework sem que nada nesta
fase dependa disso, e o item proibido é o esquema *do produto*.

**B — Meilisearch aparece como decisão e como porta, nunca como integração.**
`app/Domain/Search/Contract/SearchEngine.php` declara a interface; a ADR
[0006](../../docs/decisions/0006-motor-de-busca-meilisearch.md) registra a escolha do motor.
Não há cliente, SDK, credencial ou índice. É exatamente o arranjo que D-14 pediu: decidir sem
integrar. Mesma leitura vale para `MediaStorage` e para as portas de ingestão em
`Domain/Sources/Contract/`.

**C — Toda a camada de domínio do backend é interface.**
Os 8 arquivos PHP sob `app/Domain/` declaram apenas `interface`. Nenhuma implementação,
nenhum caso de uso executável.

**D — Zero endpoints.** `backend/api/routes/` contém `console.php` e `web.php`; **não existe
`api.php`**. A ausência é verificada por `tests/Architecture/NoResourceRoutesTest.php`, que
reprova a introdução de endpoint nesta fase (SC-015).

**E — Nenhuma requisição de terceiro em tempo de execução.** Verificado por navegador, não por
grep: `tests/e2e/third-party-failure.spec.ts` percorre as superfícies públicas e falha se
qualquer requisição sair para origem que não seja a própria aplicação. Cobre o que uma
varredura de texto não alcança — uma URL montada em tempo de execução.
