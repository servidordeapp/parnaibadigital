# Infraestrutura

**Feature**: 001-fundacao-prototipo-monorepo · Princípio XII, D-23

## O que existe aqui é **definição**, não provisionamento

Nada neste diretório é executado em CI. Os arquivos existem para que a configuração seja
versionada e revisável — cabeçalho de segurança combinado por conversa é cabeçalho que some
na primeira migração.

## `docker-compose.dev.yml`

Ambiente de desenvolvimento local: PostgreSQL, Redis, RabbitMQ e Meilisearch. Nenhum deles é
usado por esta fase — o frontend é estático e o backend não tem regra de negócio. Estão
definidos porque são as escolhas já feitas (Meilisearch por D-14), e tê-las escritas evita
que a próxima feature reabra a discussão.

```bash
docker compose -f infrastructure/docker-compose.dev.yml up -d
```

## `_headers`

Cabeçalhos de borda, em formato compatível com Cloudflare Pages / Netlify.

Os que importam:

- **CSP restrita.** O produto não carrega script, fonte nem ícone de terceiro — fontes são
  auto-hospedadas (D-08) e ícones inlinados (D-09). Isso é o que permite uma política
  apertada de verdade, em vez da CSP decorativa cheia de exceções.
- **`X-Frame-Options: DENY`** e `frame-ancestors 'none'` — contra clickjacking.
- **Cache**: ativos com hash são imutáveis; HTML revalida, para que uma correção editorial
  chegue rápido.
- **Bloqueio do painel na borda.** Sem autenticação nesta fase (FR-038), o acesso ao
  subdomínio de admin é restrito por rede. `noindex` e `Disallow: /` são higiene de SEO — o
  bloqueio real é este (Princípio IV).

> **Antes do primeiro deploy do painel**: substituir a faixa de IP de exemplo pela rede da
> redação. Está marcado como comentário no arquivo.

## `.env.example`

Um por aplicação. Nenhum segredo é versionado — os arquivos listam **as chaves**, com valor
vazio ou de exemplo local.

| Variável            | Onde       | Para quê                                                    |
| ------------------- | ---------- | ----------------------------------------------------------- |
| `PD_DATA_TRANSPORT` | web, admin | `mock` (padrão) ou `http` — a escolha acontece num lugar só |
| `PD_API_BASE_URL`   | web, admin | base da API, quando o transporte for `http`                 |

## O que **não** está provisionado

Meilisearch, fila, storage de objetos, provedor de IA, rede de anúncios, envio de e-mail.
Todos decididos ou declarados como porta; nenhum ligado (FR-038). Provisionar antes de haver
consumidor é estrutura antes da necessidade — o que o Princípio XII trata como custo, não
como preparo.
