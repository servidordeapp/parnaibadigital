# Feature Specification: Fundação do Produto — Protótipo Navegável, Design System e Monorepo

**Feature Branch**: `001-fundacao-prototipo-monorepo`

**Created**: 2026-08-11

**Status**: Draft

**Input**: User description: "Importar o protótipo visual do ParnaíbaDigital (Claude Design), analisar o Design System, transformar o protótipo em base de frontend real, estruturar o monorepo, preparar a arquitetura do backend Laravel, definir contratos de API e tipos, documentar decisões arquiteturais e preparar o primeiro ciclo de especificação — sem implementar funcionalidades de negócio."

## Contexto Verificado

Esta especificação foi escrita **após** inspeção do repositório e leitura do projeto de design. Fatos apurados:

**Repositório atual** (`parnaibadigital/`, branch `main`, limpo):

- `.specify/` — Spec Kit 0.12.5.dev0 já inicializado, integração `claude`, numeração sequencial.
- `.specify/memory/constitution.md` — Constituição v2.0.0 já ratificada (12 princípios).
- `backend/api/` — aplicação Laravel **13.8** já instalada (`laravel/framework: ^13.8`, `php: ^8.3`; runtime local PHP 8.5.7). Estrutura ainda é a padrão do framework (`app/Models`, `app/Http`, `app/Providers`), **sem** organização modular por domínio.
- `README.md` — placeholder.
- Não existem: `apps/`, `packages/`, `docs/`, `infrastructure/`, `specs/`.

**Projeto de design** (`claude.ai/design/p/219a9ccf-…`, "ParnaíbaDigital: Protótipo completo", editável):

- `ParnaibaDigital.dc.html` — 232 KB, protótipo navegável único com **26 telas** implementadas.
- Design System `parna-badigital-design-system-fe257784-…` — 7 arquivos de token, `styles.css`, `_ds_bundle.js`, `_ds_manifest.json`, `readme.md`, **31 componentes** em 7 grupos, 23 cards de especímen.

**Divergências entre o prompt de entrada e a realidade apurada** (a realidade prevalece):

| Item | Prompt supôs | Realidade apurada | Decisão |
|---|---|---|---|
| Pasta do backend | `backend/laravel/` | `backend/api/` já existe com Laravel 13.8 | Preservar `backend/api/`; nada é movido |
| Telas do admin | "verificar se existem" | As 11 telas de admin **existem** no protótipo | Reproduzir as 11 |
| Eixo geográfico | Município | O protótipo é construído sobre **bairro**; município é o nível acima | Ambos os níveis são de primeira classe (ver FR-021) |
| Componentes previstos | Modal, Drawer, Toast, Skeleton, DataTable, Gallery, VideoPlayer, Timeline, WeatherWidget, MapWidget | O DS **não** publica esses componentes; o protótipo implementa modal/drawer/toast/skeleton inline | Só entram no inventário os que o protótipo realmente usa |
| Idioma | — | Todo o DS e o protótipo são pt-BR e proíbem rótulos em inglês | Interface e conteúdo em pt-BR |

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Leitor percorre o portal público reproduzido (Priority: P1)

Um morador de Parnaíba abre o portal e navega entre home, uma notícia, uma editoria, a página de um bairro, eventos, utilidade pública, Diário Oficial, empresas, autor, busca e newsletter. Tudo o que ele vê é visualmente idêntico ao protótipo aprovado, funciona em celular e desktop, responde ao tema claro e escuro, e o conteúdo aparece mesmo quando o JavaScript do navegador não executa.

**Why this priority**: é o produto. Todas as demais entregas desta fase existem para sustentar esta. Entregue sozinha, já produz um portal demonstrável, publicável em ambiente de homologação e mensurável contra os orçamentos de performance e SEO da Constituição.

**Independent Test**: percorrer as 14 telas públicas do protótipo lado a lado com a reprodução, em 360px e 1280px, nos dois temas, com e sem JavaScript, e confirmar paridade visual e de navegação.

**Acceptance Scenarios**:

1. **Given** o portal reproduzido aberto na home, **When** o leitor aciona cada item da navegação principal (Cidade, Bairros, Eventos, Utilidade Pública, Diário Oficial, Empresas), **Then** cada destino carrega como documento próprio, com URL própria e resolvível, e a seção ativa recebe o sublinhado de 3px cor-de-sol do protótipo.
2. **Given** qualquer tela pública, **When** o leitor alterna o tema para escuro, **Then** todos os elementos permanecem legíveis com contraste mínimo de 4,5:1 e a escolha persiste ao navegar para outra tela.
3. **Given** o navegador com JavaScript desabilitado, **When** o leitor abre uma notícia, **Then** título, subtítulo, corpo, data, autor, vínculo de bairro e município, selo de curadoria e rodapé de atribuição estão presentes no HTML entregue.
4. **Given** a tela de notícia, **When** o leitor rola até o fim, **Then** o Bloco de Contexto Regional e o Rodapé de Atribuição Legal ("Informações originais publicadas por [Veículo]", com link para a fonte) estão presentes, conforme exigido pelo DS e pelo Princípio V.
5. **Given** uma tela com slots de anúncio, **When** a página carrega, **Then** cada slot já ocupa altura reservada e rotulada, e nenhum conteúdo editorial se desloca depois do carregamento.
6. **Given** um endereço inexistente, **When** o leitor o acessa, **Then** a tela de erro do protótipo é exibida com status HTTP 404 e navegação de retorno funcional.

---

### User Story 2 - Equipe editorial percorre o painel administrativo reproduzido (Priority: P2)

Um editor abre o painel e navega pelas 11 telas administrativas do protótipo — Dashboard, Notícias, Editor, Pipeline de IA, Diário Oficial, Publicidade, Analytics, SEO, Integrações, Usuários e Configurações — vendo estados, contadores, abas e o pipeline animado exatamente como no protótipo, sobre dados demonstrativos.

**Why this priority**: o admin é a superfície que define o vocabulário do pipeline editorial e do módulo de Diário Oficial. Reproduzi-lo cedo trava o entendimento do domínio antes de qualquer implementação de regra. Não é P1 porque não é público, não é indexado e não afeta receita nesta fase.

**Independent Test**: percorrer as 11 telas de admin a partir da navegação lateral, comparando com o protótipo, e confirmar que abas, badges de contagem, filtros e a animação do pipeline se comportam como na origem.

**Acceptance Scenarios**:

1. **Given** o painel aberto, **When** o editor aciona cada item da navegação lateral, **Then** o destino carrega e o item ativo recebe fundo, cor e régua de 3px do protótipo.
2. **Given** a tela de Pipeline de IA, **When** ela permanece aberta, **Then** as 8 etapas (Documento encontrado → Análise → Resumo → Reescrita → SEO → Imagem → Editor → Publicado) avançam com a mesma cadência e ordem do protótipo, e a etapa "Editor — revisão humana obrigatória antes de publicar" nunca é pulada na representação.
3. **Given** a tela de Editor, **When** o editor alterna entre as abas de conteúdo, **Then** o painel troca sem recarregar a tela inteira e sem perder o estado das demais abas.
4. **Given** qualquer tela de admin, **When** o editor a abre em tema escuro, **Then** ela é totalmente legível, sem elemento herdado do tema claro.
5. **Given** o painel, **When** um leitor não autenticado tenta acessá-lo, **Then** ele não é exposto publicamente nem indexável (nesta fase, por bloqueio de acesso e `noindex`; autenticação real é escopo de feature posterior).

---

### User Story 3 - Desenvolvedor constrói uma tela nova sem reabrir decisões visuais (Priority: P2)

Um desenvolvedor precisa criar uma tela que não existe no protótipo. Ele encontra o inventário de componentes, usa os componentes existentes, consome tokens em vez de valores literais, tipa os dados a partir de um contrato compartilhado e entrega a tela consistente com o resto do produto sem consultar o time de design.

**Why this priority**: é o que transforma "protótipo reproduzido" em "base de frontend real". Sem isso, a próxima feature recomeça copiando HTML e a deriva visual começa no primeiro dia.

**Independent Test**: pedir a alguém que não participou desta fase para montar uma tela composta apenas de componentes existentes, usando somente a documentação, e medir quantos valores literais e quantos componentes duplicados ela introduz (alvo: zero).

**Acceptance Scenarios**:

1. **Given** o inventário de componentes publicado, **When** o desenvolvedor procura um componente por nome ou por função, **Then** encontra sua descrição, variantes, estados e exemplo de uso renderizado.
2. **Given** um componente novo escrito com uma cor literal, **When** a verificação automatizada roda, **Then** ela falha apontando arquivo, linha e o token que deveria ter sido usado.
3. **Given** os tipos compartilhados, **When** o desenvolvedor consome uma entidade de conteúdo, **Then** o campo de vínculo geográfico é obrigatório em tempo de verificação de tipos, e omiti-lo impede a construção.
4. **Given** dois consumidores (portal e admin), **When** ambos usam o mesmo componente, **Then** a definição vive em um único lugar; cópias divergentes são reprovadas na revisão.

---

### User Story 4 - Mantenedor entende e evolui a arquitetura pela documentação (Priority: P3)

Um mantenedor que chega ao projeto lê a documentação arquitetural e entende, sem ler código: como o monorepo é organizado, por que o backend é um monólito modular, quais são os contratos de API previstos, como o pipeline editorial e a ingestão do Diário Oficial devem funcionar, e quais decisões já estão fechadas e por quê.

**Why this priority**: não bloqueia a demonstração do produto, mas é o que impede que a próxima feature reabra decisões já tomadas. P3 porque pode ser concluída em paralelo às demais.

**Independent Test**: dar a documentação a alguém sem contexto e pedir que responda onde uma regra de negócio nova deve morar, qual módulo a hospeda e qual contrato ela expõe — sem abrir o código.

**Acceptance Scenarios**:

1. **Given** a documentação publicada, **When** o mantenedor procura por uma decisão relevante (organização do backend, escolha de fronteiras de módulo, estratégia de mocks, local do backend existente), **Then** encontra um registro de decisão com problema, alternativas rejeitadas e critério de reversão.
2. **Given** a estrutura de domínio do backend, **When** o mantenedor procura onde adicionar uma fonte de ingestão nova, **Then** o ponto de extensão está documentado e não exige alteração no núcleo.
3. **Given** os contratos de API definidos, **When** o mantenedor compara com os dados demonstrativos do frontend, **Then** ambos descrevem as mesmas entidades e campos, sem divergência de nome ou de obrigatoriedade.

---

### Edge Cases

- **Colisão de slug na raiz**: um município e uma seção institucional disputam o mesmo caminho (`/eventos` como município hipotético vs. seção). O registro de slugs deve detectar a colisão na construção e reprovar, nunca resolver por ordem de rota.
- **Bairro homônimo em municípios diferentes**: "Centro" existe em Parnaíba e em Luís Correia. O identificador de bairro é sempre qualificado pelo município; nunca por nome isolado.
- **Notícia sem bairro identificável** (ex.: pauta estadual): o vínculo de município continua obrigatório; o bairro é opcional. A tela de notícia deve renderizar corretamente sem bairro.
- **Tema escuro em superfície de anúncio**: os cinzas frios de anúncio existem para não parecer conteúdo. No tema escuro, o slot deve continuar visualmente distinto do editorial.
- **Ausência de foto**: sem banco de imagens, o placeholder hachurado do DS deve aparecer sem quebrar proporção nem causar deslocamento.
- **Falha de recurso de terceiro** (ícones por CDN, fonte remota, script de anúncio): o conteúdo permanece legível e navegável; ícone ausente nunca deixa um botão sem rótulo acessível.
- **`prefers-reduced-motion` ativo**: a animação do pipeline, o `scale` do hero e as transições de card são suprimidas sem quebrar a leitura de estado.
- **Tela sem estado demonstrativo** (busca sem resultado, listagem vazia, fila do Diário Oficial vazia): cada listagem tem estado vazio definido e anunciado a tecnologia assistiva.
- **Documento oficial sem matéria associada** (presente nos dados demonstrativos: 2 dos 6 documentos): a tela deve representar esse estado sem inventar vínculo.

---

## Requirements *(mandatory)*

### Requisitos Funcionais — Ativo de Design

- **FR-001**: O sistema MUST preservar, versionados no repositório, os arquivos do Design System importado: os 7 arquivos de token (`base`, `colors`, `elevation`, `fonts`, `motion`, `spacing`, `typography`), `styles.css`, `_ds_bundle.js`, `_ds_manifest.json` e `readme.md`, sem edição de conteúdo no momento da importação.
- **FR-002**: O sistema MUST tratar `ParnaibaDigital.dc.html` e o Design System como fonte de verdade visual. Nenhuma tela é simplificada, substituída por template genérico ou redesenhada nesta fase.
- **FR-003**: O sistema MUST expor os tokens do Design System como **fonte única** consumida por todas as aplicações. Nenhum valor de cor, espaçamento, tipografia, elevação ou movimento é duplicado entre pacotes ou aplicações.
- **FR-004**: O sistema MUST reprovar automaticamente qualquer valor literal de cor, espaçamento ou tipografia fora dos tokens, indicando arquivo, linha e token correspondente.
- **FR-005**: O sistema MUST publicar um inventário navegável dos componentes do Design System, com variantes, estados (repouso, hover, press, foco, desabilitado, selecionado) e exemplo renderizado em ambos os temas.
- **FR-006**: O sistema MUST reproduzir os 31 componentes publicados pelo Design System, agrupados como na origem: `core` (Button, IconButton, Icon, Input, Select, Checkbox, Tag, Badge, Card, PhotoFrame), `brand` (Wordmark), `news` (HeroStory, NewsCard, NewsListItem, NeighborhoodTagBar, SectionHeading, CurationStamp, RegionalContextBox, AttributionFooter, ShareBar), `navigation` (SiteHeader, WeatherStrip, Breadcrumb, Tabs, Pagination, SiteFooter), `widgets` (WidgetCard, PharmacyList, JobList, EventList), `tourism` (LodgingCard, DestinationCard, LodgingList), `ads` (AdSlot).
- **FR-007**: O sistema MUST implementar como componentes reutilizáveis os padrões que o protótipo usa mas o Design System ainda não publica — modal de índice/comando, gaveta de navegação móvel, aviso temporário (toast), esqueleto de carregamento e tabela de dados do admin — e MUST registrá-los no inventário como adições, com justificativa.
- **FR-008**: O sistema MUST NOT introduzir componente novo quando um equivalente já existe no Design System. Duplicação de componente é defeito.
- **FR-009**: O sistema MUST suportar os temas claro e escuro em **todo** componente e **toda** tela, incluindo o admin, com a mesma paleta declarada pelo protótipo.
- **FR-010**: O sistema MUST preservar o comportamento responsivo do protótipo, incluindo a virada para coluna única abaixo de 900px e a migração da barra lateral para depois do sexto card, sem introduzir pontos de quebra novos.

### Requisitos Funcionais — Telas Reproduzidas

- **FR-011**: O sistema MUST reproduzir as **14 telas públicas** do protótipo: home, notícia, categoria/editoria, busca, bairro/cidade, eventos, utilidade pública, Diário Oficial, empresas, anunciante, autor, newsletter, erro (404) e galeria de componentes.
- **FR-012**: O sistema MUST reproduzir as **11 telas administrativas** do protótipo: Dashboard, Notícias, Editor, Pipeline de IA, Diário Oficial (fila), Publicidade, Analytics, SEO, Integrações, Usuários e Configurações.
- **FR-013**: O sistema MUST NOT reproduzir a tela `mobile` do protótipo como rota do produto: ela é um enquadramento de pré-visualização de dispositivo, não uma superfície. A responsividade que ela demonstra é coberta pelo FR-010.
- **FR-014**: O sistema MUST preservar as interações demonstradas pelo protótipo: alternância de tema com persistência, índice/paleta de comando por `Ctrl/Cmd+K` e fechamento por `Esc`, gaveta de navegação móvel, abas (editor, cidade, utilidade pública), filtro de editoria, estado de busca, paginação, estados de carregamento, avisos temporários e a progressão animada do pipeline.
- **FR-015**: O sistema MUST manter cada microinteração dentro do vocabulário de movimento do Design System (120 ms para hover/press, 200 ms para revelar, `cubic-bezier(.22,.8,.36,1)`, sem bounce, sem parallax, sem entrada em cascata) e MUST respeitar `prefers-reduced-motion`.
- **FR-016**: O sistema MUST preservar o conteúdo demonstrativo do protótipo — os 12 artigos, 6 documentos oficiais, 6 eventos, 6 empresas, 8 etapas de pipeline e os 4 grupos de utilidade pública (Concursos, Empregos, Licitações, Editais) — como dados de demonstração realistas, claramente identificados como tal.
- **FR-017**: O sistema MUST manter toda a interface e todo o conteúdo demonstrativo em português do Brasil, sem rótulos em inglês, sem emoji e usando exclusivamente o vocabulário de ícones declarado pelo Design System.
- **FR-018**: O sistema MUST exibir, em toda superfície de notícia, o selo de curadoria e o carimbo de atualização, e MUST encerrar todo conteúdo curado com a atribuição verificável à fonte original — conforme o contrato de confiança do Design System e o Princípio V.

### Requisitos Funcionais — Estrutura, Contratos e Dados

- **FR-019**: O sistema MUST organizar o repositório como monorepo com aplicações separadas do portal público e do painel administrativo, pacotes compartilhados de design system, componentes, tipos, cliente de API e validação, e um espaço próprio de documentação e de infraestrutura.
- **FR-020**: O sistema MUST preservar a aplicação Laravel existente em `backend/api/` **no local em que está** e MUST reorganizar seu código em módulos de domínio (News, Categories, Cities, Neighborhoods, Authors, Sources, OfficialGazette, Editorial, AI, Advertising, Analytics, Users, Media, Search) com separação entre domínio, aplicação, infraestrutura e camada HTTP. Qualquer divergência em relação à estrutura sugerida no pedido MUST ser registrada como decisão.
- **FR-021**: O sistema MUST tratar **município e bairro como dois níveis distintos** da taxonomia geográfica: o município é o nível canônico de roteamento na raiz e identificado por código IBGE; o bairro é qualificado pelo município e nunca identificado por nome isolado. Toda peça de conteúdo carrega exatamente um município primário e zero ou mais bairros.
- **FR-022**: O sistema MUST manter um registro canônico de slugs de município, validado na construção contra as rotas reservadas do portal, de modo que adicionar um município seja operação de dados e não de código.
- **FR-023**: O sistema MUST definir tipos compartilhados para as entidades do produto antes de qualquer implementação de endpoint, e MUST usar esses mesmos tipos para tipar os dados demonstrativos do frontend.
- **FR-024**: O sistema MUST definir os contratos de leitura da API versionada (`/api/v1/…`) para notícias, notícia por slug, categorias, municípios, município por slug, bairros, busca, eventos, Diário Oficial, autores, empresas e utilidade pública — **como contrato revisável, sem implementação de endpoint** nesta fase.
- **FR-025**: O sistema MUST fazer com que os frontends consumam dados exclusivamente por um cliente compartilhado e tipado, de forma que a troca de dados demonstrativos por API real não exija alteração em componente de tela.
- **FR-026**: O sistema MUST NOT conter regra de negócio no frontend público: nenhuma decisão de publicação, elegibilidade, precedência editorial ou cálculo de domínio vive nas aplicações de interface.
- **FR-027**: O sistema MUST NOT criar aplicação, pacote ou dependência que não seja consumido por esta fase. Toda adição de dependência de cliente declara o que faz, seu custo em KB comprimidos e por que HTML/CSS nativo não resolve.

### Requisitos Funcionais — Fundação de SEO e Performance

- **FR-028**: O sistema MUST entregar todo conteúdo indexável já renderizado no servidor: título, subtítulo, corpo, data, autor e vínculo geográfico existem no HTML inicial de cada tela pública.
- **FR-029**: O sistema MUST emitir, em cada tela pública, URL canônica absoluta, metadados Open Graph e Twitter Cards completos, e os dados estruturados aplicáveis ao tipo de página (`NewsArticle`, `Organization`, `WebSite` com ação de busca, `BreadcrumbList`, `Place` em página de município, `Event` em eventos).
- **FR-030**: O sistema MUST gerar automaticamente `robots.txt`, sitemap XML por seção, News Sitemap, Image Sitemap e feeds RSS por seção e por município, a partir do conteúdo — nunca mantidos à mão.
- **FR-031**: O sistema MUST manter toda funcionalidade essencial de leitura — abrir notícia, navegar seções, municípios e bairros, buscar, paginar e assinar newsletter — operante sem JavaScript de cliente.
- **FR-032**: O sistema MUST reservar espaço fixo e rotulado para cada slot de anúncio antes do carregamento, respeitando o mapa de posicionamento do Design System (topo, in-feed após o 4º card, barra lateral fixa, in-article após o 2º parágrafo; máximo de 3 slots acima da dobra; nunca dois slots consecutivos sem conteúdo editorial entre eles). **Nenhuma rede de anúncios real é integrada nesta fase.**
- **FR-033**: O sistema MUST servir toda imagem em formato moderno com alternativa, com dimensões ou proporção explícitas, carregamento adiado fora da dobra e prioridade alta apenas no elemento de maior conteúdo.
- **FR-034**: O sistema MUST auto-hospedar as fontes com subconjunto de caracteres, sem requisição a host de fonte de terceiros.
- **FR-035**: O sistema MUST bloquear a integração na ausência de qualquer um dos portões da Constituição: lint, verificação de tipos, testes de domínio e contrato, acessibilidade WCAG 2.1 AA automatizada, orçamento de performance, verificações de SEO e verificação de tokens.

### Requisitos Funcionais — Documentação e Processo

- **FR-036**: O sistema MUST publicar documentação arquitetural cobrindo arquitetura geral, frontend, backend, design system, SEO, performance, pipeline editorial, ingestão e infraestrutura.
- **FR-037**: O sistema MUST registrar como decisão arquitetural, com problema, alternativas rejeitadas e critério de reversão, no mínimo: a manutenção do backend em `backend/api/`, a organização modular do domínio, a estratégia de fonte única de tokens, a estratégia de dados demonstrativos e o modelo de dois níveis de taxonomia geográfica.
- **FR-038**: O sistema MUST NOT implementar, nesta fase: autenticação completa, esquema definitivo de banco, pagamentos, integração real de publicidade, integração real com provedor de IA, integração real com Diário Oficial, busca real, analytics real, coleta automatizada de fontes ou filas de produção.

### Key Entities

Entidades derivadas do protótipo e do Design System. Nesta fase, existem como **contratos tipados e dados demonstrativos** — não como esquema de banco.

- **News (Notícia)**: manchete no padrão `[Bairro] + [fato]`, resumo, corpo, editoria, tom (urgente / marca / destaque), autor, momento de publicação e de atualização, contadores demonstrativos de audiência e comentários, selo de curadoria, atribuição à fonte original. Vincula-se a exatamente um município e a zero ou mais bairros.
- **Municipality (Município)**: nome, slug de raiz, código IBGE, contagem de notícias. Cinco presentes nos dados demonstrativos: Parnaíba, Luís Correia, Ilha Grande, Buriti dos Lopes, Cajueiro da Praia.
- **Neighborhood (Bairro)**: nome, slug, município ao qual pertence. Presentes: São José, Centro, Nossa Senhora de Fátima, Piauí, Frei Higino, Reis Veloso, Pedra do Sal, Porto das Barcas, Ilha Grande.
- **Category (Editoria)**: nome, slug, tom visual. Presentes: Urgente, Trânsito, Litoral, Saúde, Serviços, Educação, Economia, Delta, Meio ambiente, Política, Cultura, Emprego.
- **Author (Autor)**: nome, biografia, retrato, notícias assinadas. A assinatura institucional "Redação ParnaíbaDigital" é um autor válido.
- **OfficialGazetteDocument (Documento do Diário Oficial)**: número, órgão, secretaria, data, tipo (portaria, edital, licitação, decreto, resolução, contrato), resumo, situação no fluxo (Fila de IA, Em revisão, Publicado, Arquivado), referência ao documento original e vínculo opcional com a matéria gerada.
- **Event (Evento)**: título, data, horário, local, município, categoria, preço ou gratuidade.
- **Company (Empresa)**: nome, categoria, bairro, avaliação, número de avaliações, telefone, situação de funcionamento.
- **UtilityItem (Item de utilidade pública)**: grupo (Concursos, Empregos, Licitações, Editais), órgão, título, detalhe, valor, prazo e selo de situação.
- **PipelineStage (Etapa do pipeline)**: nome, ícone, descrição e posição fixa na sequência Documento encontrado → Análise → Resumo → Reescrita → SEO → Imagem → Editor → Publicado.
- **AdSlot (Slot de anúncio)**: posicionamento, dimensões reservadas, rótulo. Sem rede real associada nesta fase.
- **NewsletterSubscription (Assinatura de newsletter)**: canal e destino declarados pelo protótipo (e-mail, WhatsApp). Sem envio real nesta fase.
- **AnalyticsMetric (Métrica)**: nome, valor, variação, período — apenas para reproduzir as telas de Analytics e Dashboard.
- **User (Usuário)**: nome, papel editorial, situação. Apenas para reproduzir a tela de Usuários; sem autenticação nesta fase.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: As **25 superfícies** do protótipo (14 públicas + 11 administrativas) são alcançáveis por navegação e cada uma tem endereço próprio e resolvível.
- **SC-002**: Em revisão lado a lado com o protótipo, em 360px e 1280px, nos temas claro e escuro, **100% das telas** apresentam a mesma hierarquia, os mesmos componentes e a mesma estrutura de conteúdo; qualquer desvio é registrado e aprovado explicitamente antes da entrega.
- **SC-003**: A verificação automatizada encontra **zero** valores literais de cor, espaçamento ou tipografia fora dos tokens.
- **SC-004**: A verificação automatizada encontra **zero** violações WCAG 2.1 nível AA nas 25 superfícies, em ambos os temas.
- **SC-005**: Toda tela pública atinge **Lighthouse ≥ 95** em Performance, SEO, Boas Práticas e Acessibilidade (móvel, 4G, dispositivo médio), com **LCP < 2,0 s**, **CLS < 0,05** e **INP < 200 ms**.
- **SC-006**: Nenhuma tela pública entrega mais de **50 KB** de JavaScript comprimido no carregamento inicial.
- **SC-007**: Com JavaScript de cliente desabilitado, **100%** das telas públicas continuam legíveis e navegáveis, e nenhuma exige script para exibir seu conteúdo principal.
- **SC-008**: **100%** das telas públicas emitem URL canônica, metadados sociais completos e dados estruturados válidos para seu tipo, verificados automaticamente.
- **SC-009**: O registro de slugs de município impede colisão na construção: uma colisão introduzida deliberadamente reprova a construção com mensagem apontando o conflito.
- **SC-010**: Adicionar um sexto município aos dados demonstrativos produz sua página hub, seu feed e sua entrada em sitemap **sem alterar nenhuma rota, template ou script de construção**.
- **SC-011**: Substituir todos os dados demonstrativos por uma origem diferente não exige alteração em nenhum componente de tela — apenas na camada de acesso a dados.
- **SC-012**: **Zero** componentes duplicados entre o portal e o admin: cada componente compartilhado tem exatamente uma definição.
- **SC-013**: Um desenvolvedor sem participação nesta fase monta uma tela nova usando apenas a documentação, sem introduzir valor literal nem componente duplicado.
- **SC-014**: Cada uma das nove áreas de documentação arquitetural existe, e cada decisão listada no FR-037 tem registro com problema, alternativas rejeitadas e critério de reversão.
- **SC-015**: Os contratos de leitura da API estão definidos e revisados, e **zero** endpoints foram implementados nesta fase.
- **SC-016**: **Zero** itens da lista de exclusão do FR-038 aparecem no código entregue.
- **SC-017**: Os arquivos do Design System importado estão versionados e **byte-idênticos** à origem no momento da importação; qualquer alteração posterior é rastreável a um registro de decisão.

---

## Assumptions

Escolhas feitas na ausência de definição explícita. Cada uma é reversível em `/speckit-clarify`.

1. **Backend permanece em `backend/api/`.** A aplicação Laravel 13.8 já existe ali. Movê-la para `backend/laravel/` produziria apenas ruído de histórico. O pedido original ("não force esta estrutura se houver razão técnica melhor") autoriza a divergência; ela vira registro de decisão.
2. **Todas as 11 telas de admin entram nesta fase**, como reprodução visual sobre dados demonstrativos, sem autenticação, sem persistência e sem regra de negócio. O pedido mandava verificar quais existem no protótipo antes de assumir: existem todas.
3. **A tela `mobile` do protótipo não vira rota.** É um enquadramento de pré-visualização de dispositivo, não uma superfície do produto.
4. **A galeria de componentes (`componentes`) entra como superfície de desenvolvimento**, não indexável, servindo de inventário vivo exigido pelo FR-005.
5. **Município é o nível canônico de roteamento na raiz; bairro é sub-nível.** O protótipo é construído sobre bairro, mas a Constituição (Princípio II) fixa município na raiz com código IBGE. Os dois níveis coexistem: bairro qualificado pelo município.
6. **Dados demonstrativos vivem em um pacote compartilhado**, tipados pelos mesmos contratos da API futura, atrás do mesmo cliente de dados — para que a troca por API real não toque componentes.
7. **Componentes ausentes no Design System mas usados pelo protótipo** (modal, gaveta, aviso temporário, esqueleto, tabela do admin) são implementados e registrados como adições justificadas, não descartados nem redesenhados.
8. **Componentes citados no pedido mas ausentes do protótipo e do Design System** (galeria de mídia, player de vídeo, linha do tempo, widget de clima como componente próprio, widget de mapa, seção de comentários) **não** são criados nesta fase. O Princípio VIII proíbe estrutura antes da necessidade; o Design System declara explicitamente tê-los omitido por ausência de tela que os peça.
9. **Substituições declaradas pelo Design System permanecem**: sem arquivo de logotipo (assinatura em tipo vivo), sem binários de fonte oficiais (famílias do Google Fonts, auto-hospedadas conforme FR-034), ícones Lucide, fotografias como placeholder. Trocá-las é operação de token e ativo, não de refatoração de componente.
10. **A fonte de verdade visual permanece no projeto de design remoto.** Este repositório recebe uma cópia versionada; alterações visuais nascem lá e são reimportadas, nunca editadas apenas aqui.
11. **O idioma do produto e da interface é pt-BR**, conforme o Design System. A documentação técnica acompanha o idioma da Constituição (pt-BR).
12. **Nenhum serviço de infraestrutura é provisionado nesta fase.** PostgreSQL, Redis, RabbitMQ, CDN e storage de objetos aparecem como definição de ambiente e documentação; nenhum é dependência de execução para demonstrar o protótipo.

## Dependencies

- Acesso de leitura ao projeto de design `219a9ccf-dc49-489d-a5fb-7ebb3da9f8a9` (confirmado disponível, com permissão de edição).
- Constituição do ParnaíbaDigital v2.0.0 — vinculante; conflitos entre esta especificação e a Constituição resolvem-se a favor da Constituição.
- Aplicação Laravel existente em `backend/api/` (Laravel 13.8, PHP ^8.3).
- Registro canônico de slugs de município com código IBGE — pendência já aberta pela Constituição (`TODO(CITY_SLUG_REGISTRY)`), resolvida por esta feature via FR-022.

## Out of Scope

Explicitamente fora desta fase, para especificação posterior: autenticação e 2FA, RBAC efetivo, esquema definitivo de banco e migrações de produção, pagamentos, integração com Google AdSense ou Ad Manager, integração com provedor de IA, integração real com o Diário Oficial, coleta automatizada de qualquer fonte, motor de busca real, analytics real, filas de produção, envio de newsletter, comentários, e qualquer aplicação além do portal público e do painel administrativo.
