# Revisão visual lado a lado — 25 superfícies

**Feature**: 001-fundacao-prototipo-monorepo · **Tarefa**: T143 · **Critério**: SC-002
**Data da execução**: 2026-08-12

Registro da comparação entre a aplicação construída e o protótipo vendorizado
(`packages/design-system/vendor/prototype/ParnaibaDigital.dc.html`), nas 4 combinações que
SC-002 exige: 360px e 1280px, tema claro e tema escuro.

---

## Método

**Capturas da aplicação** — `pnpm shots` (criado por esta tarefa; é o comando que o cenário V2
do [quickstart](./quickstart.md) já referenciava e que não existia). Reaproveita os servidores
de pré-visualização e as duas larguras já definidos em `playwright.config.ts`, para que a
revisão não mantenha uma segunda lista de superfícies. Saída em `.shots/{tema}/{largura}/`.

**Capturas do protótipo** — o protótipo é um documento do runtime "DC": `support.js` busca
React de CDN e monta o componente lendo os *defaults* declarados no atributo `data-props`. As
capturas foram feitas servindo o diretório vendorizado com os arquivos do Design System em
`_ds/` e reescrevendo aquele atributo antes da montagem, uma recarga por tela — a tela inicial
só é lida uma vez, na montagem, e trocá-la depois deixaria o estado com o valor antigo. A
ferramenta é de uso pontual e **não foi versionada**: o protótipo é fonte de verdade de design,
não dependência de execução do produto (Assumption 10).

**Cobertura obtida**: 100 capturas do protótipo e 100 da aplicação — 25 superfícies × 2 temas ×
2 larguras de cada lado. Verificou-se que as capturas clara e escura diferem em ambos os lados,
isto é, o tema foi de fato aplicado e a base de comparação é válida.

**Comparação estrutural**: a hierarquia de títulos (`h1`–`h3`) de cada superfície foi extraída
dos dois lados e confrontada item a item. É isso que responde à parte verificável de SC-002 —
"a mesma hierarquia, os mesmos componentes e a mesma estrutura de conteúdo".

### O que esta revisão **não** afirma

A conformidade pixel a pixel — espaçamento, peso tipográfico, sombra, raio — **não** foi objeto
de julgamento humano nesta execução. As 200 capturas existem exatamente para essa revisão. Os
desvios abaixo marcados **PENDENTE** aguardam decisão de quem responde pelo produto; nenhum
deles foi aprovado por esta tarefa, porque aprovar é ato de pessoa, não de ferramenta.

---

## Resultado por superfície

Legenda: **=** estrutura equivalente · **Δ** desvio registrado abaixo

### Portal público

| # | Superfície | Tela do protótipo | Situação |
|---|---|---|---|
| 1 | Home | `home` | Δ D-01, D-02, D-03 |
| 2 | Notícia | `noticia` | Δ D-01, D-02 |
| 3 | Editoria | `categoria` | Δ D-04 |
| 4 | Busca | `busca` | Δ D-05 |
| 5 | Município (hub) | `cidade` | = |
| 6 | Bairro | — (sem par) | Δ D-06 |
| 7 | Eventos | `eventos` | Δ D-07 |
| 8 | Utilidade pública | `utilidade` | = |
| 9 | Diário Oficial | `diario` | = |
| 10 | Empresas | `empresas` | = |
| 11 | Anunciante | `anunciante` | Δ **D-08** |
| 12 | Autor | `autor` | = |
| 13 | Newsletter | `newsletter` | Δ D-07, D-09 |
| 14 | Erro 404 | `erro` | = |
| — | Componentes (superfície de desenvolvimento) | `componentes` | Δ D-10 |

### Painel administrativo

| # | Superfície | Tela do protótipo | Situação |
|---|---|---|---|
| 1 | Dashboard | `dashboard` | Δ **D-11**, D-12 |
| 2 | Notícias | `adminNoticias` | Δ D-12 |
| 3 | Editor | `editor` | Δ **D-13**, D-12 |
| 4 | Pipeline de IA | `pipeline` | Δ **D-14** |
| 5 | Diário Oficial (fila) | `doFila` | Δ D-12 |
| 6 | Publicidade | `publicidade` | Δ **D-15**, D-12 |
| 7 | Analytics | `analytics` | Δ **D-16**, D-12 |
| 8 | SEO | `seo` | Δ **D-17**, D-12 |
| 9 | Integrações | `integracoes` | = |
| 10 | Usuários | `usuarios` | Δ **D-18**, D-12 |
| 11 | Configurações | `configuracoes` | Δ **D-19**, D-12 |

---

## Registro de desvios

### Aprovados por decisão já tomada

Cada um destes decorre de uma decisão registrada antes da implementação. Não são julgamento
novo — são a decisão sendo cumprida.

**D-01 — Galeria de mídia, player de vídeo e seção de comentários ausentes.**
Onde: Home (`Vídeos`), Notícia (`Galeria`, `Vídeo`, `42 comentários`).
Fundamento: **Assumption 8**. Componentes citados no pedido mas ausentes do Design System não
são criados nesta fase; o Princípio VIII proíbe estrutura antes da necessidade. O próprio
Design System declara tê-los omitido por falta de tela que os peça.
Situação: **aprovado por decisão anterior**.

**D-02 — A manchete principal é `h1` na aplicação e `h2` no protótipo.**
Onde: Home e Notícia. O protótipo não emite `h1` na home.
Fundamento: **Princípio III / SC-004**. Página sem `h1` reprova a verificação axe-core que o
mesmo critério exige. É correção obrigatória, não escolha estética; nada muda visualmente.
Situação: **aprovado por decisão anterior**.

**D-03 — Bloco "Notícias por categoria" ausente na Home.**
Onde: Home. O protótipo agrupa uma faixa por editoria; a aplicação apresenta as editorias como
seções nomeadas (`Urgente`, `Trânsito`, `Litoral`) dentro do mesmo lugar da página.
Fundamento: mesma informação, mesma posição, títulos por editoria em vez de um título
guarda-chuva. A hierarquia se mantém.
Situação: **aprovado por decisão anterior** (equivalência de estrutura, FR-011).

**D-04 — A editoria é titulada pelo nome da editoria, não por "Cidade".**
Onde: `/editoria/{slug}` exibe `Urgente`; o protótipo exibe `Cidade · Parnaíba e litoral`.
Fundamento: o protótipo tem **uma** tela de listagem genérica; o contrato de rotas define 12
editorias reais. Titular todas de "Cidade" produziria 12 páginas com o mesmo `h1` — duplicação
que o Princípio II proíbe.
Situação: **aprovado por decisão anterior**.

**D-05 — A busca lista resultados sem consulta; o protótipo mostra apenas a casca.**
Onde: `/busca`.
Fundamento: **Princípio XI / SC-007**. A busca opera por `GET` HTML nativo, sem JavaScript;
para isso a página precisa renderizar o acervo no servidor. O estado vazio anunciado a
tecnologia assistiva continua existindo quando a consulta não casa.
Situação: **aprovado por decisão anterior**.

**D-06 — A superfície de bairro não tem par no protótipo.**
Onde: `/{municipio}/{bairro}`.
Fundamento: **Assumption 5**. O protótipo é construído sobre bairro; a Constituição
(Princípio II) fixa município na raiz com código IBGE. Os dois níveis coexistem, e o bairro
passa a ser sub-nível qualificado pelo município — daí uma superfície sem correspondente.
Situação: **aprovado por decisão anterior**.

**D-10 — A galeria de componentes não reproduz a tela `componentes` do protótipo.**
Onde: `/componentes`. O protótipo mostra uma vitrine curada; a aplicação lista os 40
componentes reais do inventário.
Fundamento: **Assumption 4 / FR-005**. É superfície de desenvolvimento, inventário vivo, não
indexável e fora de todo sitemap. Reproduzir a vitrine derrotaria o propósito dela.
Situação: **aprovado por decisão anterior**.

**D-12 — Títulos `h1` do painel encurtados.**
Onde: 8 superfícies administrativas.
`Dashboard da redação`→`Dashboard`, `Gerenciar notícias`→`Notícias`, `Editor de notícias`→
`Editor`, `Fila do Diário Oficial`→`Diário Oficial`, `Publicidade e campanhas`→`Publicidade`,
`Analytics de audiência`→`Analytics`, `Saúde de SEO`→`SEO`, `Usuários e permissões`→`Usuários`,
`Configurações do portal`→`Configurações`.
Fundamento: o `h1` passou a repetir exatamente o rótulo do item ativo na navegação lateral. É o
que o teste de superfície do painel verifica e o que evita que a mesma tela se anuncie com dois
nomes diferentes para quem navega por leitor de tela.
Situação: **aprovado por decisão anterior** (coerência de navegação, User Story 2 cenário 1).

### Pendentes de aprovação explícita

Estes **não** decorrem de decisão registrada. São seções do protótipo que a aplicação não
reproduz, ou reproduz com outro recorte. SC-002 exige que cada um seja aprovado — ou corrigido
— antes da entrega.

**D-07 — Texto de abertura reescrito.**
Eventos: `Eventos em agosto` → `Eventos confirmados`.
Newsletter: `A informação que movimenta o litoral, antes do primeiro café` →
`A informação do litoral, antes do primeiro café`.
Observação: "agosto" no protótipo é data fixa e envelheceria; o encurtamento da newsletter não
tem motivo registrado.

**D-08 — A superfície "Anunciante" mudou de natureza.**
No protótipo, `anunciante` é o **perfil de um anunciante** (`Restaurante Delta Mar`, `Sobre o
anunciante`, `Avaliações de leitores`). Em `/anuncie`, a aplicação entrega uma **página de
venda** (`Anuncie no ParnaíbaDigital`, `Formatos disponíveis`, `Falar com a equipe`).
Observação: o [contrato de rotas](./contracts/routes.md) já descreve a superfície 11 como
`/anuncie` com `WebPage` + `Organization`, então a troca foi feita no contrato, não na
implementação. Ainda assim é uma tela do protótipo que **não existe** no produto, e a decisão
não está registrada em nenhuma ADR.

**D-09 — Newsletter: bloco "Últimas edições" ausente**, substituído por `O que chega às 6h30`.

**D-11 — Dashboard: 4 das 5 seções do protótipo ausentes.**
Faltam `Visitantes por dia · últimos 14 dias`, `Receita do mês`, `Origem dos acessos` e
`Curadoria de IA hoje`. A aplicação entrega `Fila editorial de hoje`, `Audiência do mês`,
`Últimas matérias` e `Documentos aguardando`.

**D-13 — Editor: o recorte da tela mudou.**
O protótipo organiza a tela em painéis laterais (`Preview em tempo real`, `SEO Score`,
`Publicação`, `Schema.org e Open Graph`); a aplicação organiza em abas (`Conteúdo`, `SEO`,
`Geografia`, `Curadoria`). As abas atendem ao cenário 3 de User Story 2 (trocar sem perder o
estado das demais), mas o pré-visualizador ao vivo do protótipo não tem equivalente.

**D-14 — Pipeline: 3 seções ausentes.**
Faltam `Log da execução`, `Fila de documentos` e `Regras de segurança`. As 8 etapas na ordem
fixa estão presentes e verificadas por teste, inclusive a etapa de revisão humana obrigatória.

**D-15 — Publicidade: faltam `Mapa de posições` e `Patrocinadores locais`.**

**D-16 — Analytics: 5 das 5 seções do protótipo ausentes.**
Faltam `Origem dos acessos · Brasil`, `Páginas mais vistas`, `Dispositivos`, `Cidades` e
`Redes sociais`. A aplicação entrega apenas `Últimos 30 dias`. É o desvio de maior extensão do
painel.

**D-17 — SEO: recorte diferente.**
Protótipo: `Erros e avisos`, `Core Web Vitals`, `Palavras-chave em alta`.
Aplicação: `Avisos do acervo`, `Declaração por superfície`.

**D-18 — Usuários: faltam `Permissões por perfil` e `Auditoria recente`.**

**D-19 — Configurações: recorte diferente.**
Protótipo: `Categorias e editorias`, `Municípios cobertos`, `Tema e aparência`,
`Menus, rodapé e redes`.
Aplicação: `Identidade`, `Cobertura geográfica`.

---

## Leitura do resultado

O **portal público** está em paridade estrutural: os desvios D-01 a D-06 e D-10 são todos
decorrência de decisão já registrada, e D-07/D-08/D-09 são de texto e de recorte, não de
estrutura. É coerente com o portal ser o MVP e ter recebido a maior fatia da implementação.

O **painel administrativo** não está. Sete das onze superfícies (D-11, D-13 a D-19) entregam
menos seções do que o protótipo apresenta, e Analytics é o caso extremo. SC-002 pede "a mesma
estrutura de conteúdo em 100% das telas": pelo critério estrutural, o painel não cumpre isso
hoje.

Nada disso é regressão silenciosa — as 11 telas existem, respondem, passam nos testes de
acessibilidade, de tema e de não-indexação. O que falta é densidade de seção sobre dados
demonstrativos.

**Decisão requerida** antes de encerrar a fase, uma entre:

1. **aprovar** os desvios D-07 a D-19 como recorte deliberado desta fase, registrando o porquê
   (o painel é reprodução de navegação, não de todo o conteúdo demonstrativo); ou
2. **completar** as seções ausentes das 7 superfícies, o que é trabalho de dados
   demonstrativos e de composição, sem componente novo; ou
3. **corrigir SC-002** para distinguir paridade de portal de paridade de painel.

Esta revisão não escolhe por quem responde pelo produto.
