<!--
Sync Impact Report
==================
Version change: 1.0.0 → 2.0.0
Bump rationale: MAJOR. A constituição genérica anterior (4 princípios agnósticos de
produto) foi integralmente redefinida para o produto ParnaíbaDigital. Princípios
anteriores foram removidos ou reescritos com obrigações incompatíveis (orçamentos de
performance, taxonomia geográfica obrigatória, integridade editorial, stack fixa).
Trabalho previamente conforme pode tornar-se não conforme.

Modified principles:
  - I. Code Quality Is Non-Negotiable → absorvido em "Portões de Qualidade" e
    IX. Testabilidade / VI. Consistência do Design System
  - II. Test-First Discipline → IX. Testabilidade (escopo ajustado: TDD obrigatório
    apenas em domínio/contratos, não em componentes visuais derivados do protótipo)
  - III. User Experience Consistency → III. Acessibilidade em Primeiro Lugar +
    VI. Consistência do Design System
  - IV. Performance Is a Requirement → I. Performance em Primeiro Lugar (orçamentos
    substituídos pelos alvos do produto: Lighthouse >= 95, LCP < 2s, CLS < 0.05)

Added sections:
  - II. SEO em Primeiro Lugar (SEO geolocalizado como requisito central)
  - IV. Segurança em Primeiro Lugar
  - V. Integridade Editorial
  - VII. Backend API-First
  - VIII. Monólito Modular
  - X. Observabilidade
  - XI. Progressive Enhancement
  - XII. Simplicidade de Infraestrutura
  - Restrições Arquiteturais Obrigatórias (stack, camadas de cache, mídia, busca)
  - Contrato de URLs e Taxonomia Geográfica

Removed sections:
  - Nenhuma seção estrutural removida; conteúdo genérico substituído.

Templates requiring updates:
  - ✅ .specify/templates/plan-template.md — "Constitution Check" é agnóstico
    ("[Gates determined based on constitution file]"); Technical Context já exige
    Performance Goals + Constraints. Sem edição necessária.
  - ✅ .specify/templates/spec-template.md — Success Criteria comporta métricas de
    performance/SEO exigidas pelos Princípios I e II.
  - ⚠ .specify/templates/tasks-template.md — declara "Tests are OPTIONAL". O
    Princípio IX torna testes obrigatórios para domínio, contratos e SEO. Template
    upstream não editado; ver TODO.
  - ✅ .specify/templates/checklist-template.md — sem referências constitucionais.
  - ⚠ README.md — apenas placeholder; sem referências a princípios ainda.
  - ⚠ docs/ — ainda não existe. Documentação arquitetural exigida pela seção
    "Fluxo de Desenvolvimento" será criada na primeira feature de fundação.

Follow-up TODOs:
  - TODO(TASKS_TEMPLATE_TESTS): /speckit-tasks DEVE emitir tarefas de teste para
    domínio, contratos de API e asserções de SEO/performance, independentemente da
    nota "Tests are OPTIONAL" do template upstream.
  - TODO(CITY_SLUG_REGISTRY): registro canônico de slugs de municípios (com código
    IBGE) precisa ser criado antes da primeira rota de cidade — ver Princípio II.
-->

# Constituição do ParnaíbaDigital

Portal de notícias regional independente (parnaibadigital.com.br), cobrindo Parnaíba e o
litoral do Piauí. Este documento governa todas as decisões técnicas do produto.

## Princípios Fundamentais

### I. Performance em Primeiro Lugar

Performance é requisito arquitetural, não otimização posterior. Vinculam todas as páginas
públicas:

- **Orçamentos**: Lighthouse (mobile, 4G, dispositivo médio) >= 95 em Performance, SEO,
  Best Practices e Accessibility. LCP < 2,0 s. CLS < 0,05. INP < 200 ms. TTFB < 200 ms em
  hit de borda.
- **JavaScript**: cada página pública entrega no máximo **50 KB** de JS comprimido no
  carregamento inicial. Ilhas interativas usam hidratação sob demanda (`client:visible`,
  `client:idle`); `client:load` exige justificativa escrita no PR.
- **Nenhuma biblioteca JavaScript de cliente é adicionada sem justificativa** que declare:
  o que faz, custo em KB comprimidos, e por que HTML/CSS nativo não resolve.
- **Renderização**: conteúdo é estático (SSG) por padrão. SSR apenas quando a página
  depende de dado por requisição. O portal público NÃO é uma SPA; navegação é por
  documento, não por roteador de cliente.
- **Imagens**: toda imagem servida em AVIF com fallback WebP, com `width`/`height` ou
  `aspect-ratio` explícitos (CLS), `loading="lazy"` fora da dobra e `fetchpriority="high"`
  apenas no LCP.
- **Fontes**: auto-hospedadas, subsetadas, `font-display: swap`, pré-carregadas apenas as
  usadas acima da dobra. Nenhuma requisição a host de fonte de terceiros.
- **Publicidade não degrada Core Web Vitals**: todo slot de anúncio reserva espaço fixo
  antes do carregamento e é carregado de forma assíncrona/adiada. Um anúncio nunca causa
  reflow de conteúdo editorial.
- **Otimização exige medição prévia.** Toda alegação de ganho apresenta números
  antes/depois do mesmo ambiente. Regressão de orçamento **reprova o build**; não é
  mesclada com ticket de acompanhamento.

**Justificativa**: o público-alvo acessa majoritariamente por rede móvel regional. Latência
e peso de página determinam alcance e receita publicitária mais do que qualquer
funcionalidade adicional.

### II. SEO em Primeiro Lugar (Geolocalizado)

SEO geolocalizado é requisito central do produto, não uma camada de metadados.

- **Toda notícia MUST estar associada a pelo menos um município**, identificado por código
  IBGE, não por texto livre. Associações opcionais: estado, bairro, local nomeado e ponto
  de interesse, com coordenadas quando disponíveis.
- **Municípios são cidadãos de primeira classe do roteamento**: cada município tem página
  hub própria em namespace raiz (`/parnaiba`, `/luis-correia`, `/ilha-grande`,
  `/buriti-dos-lopes`, `/cajueiro-da-praia`, …). Como slugs de município ocupam a raiz, um
  **registro canônico de slugs** MUST existir e ser validado em build para impedir colisão
  com rotas institucionais, categorias ou artigos.
- **Uma URL canônica por conteúdo.** Toda página emite `<link rel="canonical">` absoluto.
  Listagens filtradas, paginação e parâmetros de campanha nunca criam conteúdo duplicado
  indexável.
- **URLs são estáveis e amigáveis**: slugs em minúsculas, sem acentos, sem stop words
  desnecessárias. Alterar um slug publicado exige redirecionamento 301 permanente; URLs
  publicadas nunca retornam 404 por edição editorial.
- **Dados estruturados obrigatórios** (JSON-LD, validado em CI):
  - `NewsArticle` em toda notícia, com `datePublished`, `dateModified`, `author`,
    `publisher` e `contentLocation` apontando para o `Place` do município.
  - `Organization` e `WebSite` (com `SearchAction`) no site.
  - `BreadcrumbList` em toda página com hierarquia.
  - `Place` nas páginas de município; `Event` em eventos; `FAQPage` quando houver FAQ.
- **Metadados sociais obrigatórios**: Open Graph e Twitter Cards completos, com imagem
  dedicada por artigo.
- **Descoberta**: `robots.txt`, sitemap XML por seção, **News Sitemap** (apenas conteúdo
  das últimas 48 h, <= 1000 URLs), Image Sitemap e feeds RSS por seção e por município.
  Sitemaps são gerados automaticamente; nunca mantidos à mão.
- **Conteúdo indexável é renderizado no servidor.** Título, subtítulo, corpo, data, autor e
  vínculo geográfico existem no HTML inicial. Conteúdo essencial injetado por JavaScript de
  cliente é violação.
- Toda página nova declara no `plan.md` seu tipo de schema, sua canônica, sua entrada em
  sitemap e seu vínculo geográfico. Ausência desses itens reprova o Constitution Check.

**Justificativa**: o produto compete por intenção de busca local. A vantagem defensável é
cobertura geográfica estruturada e legível por máquina — não volume de texto.

### III. Acessibilidade em Primeiro Lugar

- Piso obrigatório: **WCAG 2.1 nível AA**, verificado por checagem automatizada em CI.
- HTML semântico é obrigatório: landmarks (`header`, `nav`, `main`, `article`, `footer`),
  hierarquia de headings sem saltos, listas para listas, `time` com `datetime`.
- Todo elemento interativo é alcançável e operável por teclado, com foco visível.
- Contraste de texto >= 4,5:1 em **ambos** os temas (claro e escuro).
- Toda imagem de conteúdo tem `alt` descritivo; imagens decorativas têm `alt=""`.
- Estados de carregamento, vazio e erro são anunciados a tecnologia assistiva.
- Animações e microinterações respeitam `prefers-reduced-motion`.

**Justificativa**: acessibilidade e SEO derivam da mesma base — marcação semântica correta.
Tratá-las juntas custa menos e ambas se degradam juntas quando negligenciadas.

### IV. Segurança em Primeiro Lugar

- Autenticação e autorização vivem no backend. **RBAC** governa toda operação editorial e
  administrativa; permissão é verificada no servidor, nunca apenas na interface.
- **2FA obrigatório** para contas com papel administrativo.
- Toda entrada é validada no limite da aplicação contra um schema explícito. HTML de
  colaboradores ou de ingestão é sanitizado por allowlist antes de persistir e de renderizar.
- Endpoints públicos e de autenticação têm rate limiting.
- **Auditoria**: toda alteração de conteúdo publicado, permissão ou configuração gera
  registro imutável com ator, momento, antes e depois. Notícias são versionadas.
- Segredos nunca são versionados. Chaves de terceiros vivem apenas no backend; o frontend
  público nunca porta credencial privilegiada.
- Cabeçalhos de segurança (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`) são
  configurados por padrão, não por exceção.

**Justificativa**: um portal de notícias é alvo de defacement e manipulação de conteúdo. A
integridade do que foi publicado é o ativo, e ela depende de rastreabilidade.

### V. Integridade Editorial

- **A IA nunca publica.** Todo conteúdo assistido por IA entra no pipeline como rascunho e
  só é publicado após revisão humana explícita e registrada. Não existe caminho de código
  que publique conteúdo jornalístico sem essa aprovação.
- Toda matéria derivada de documento oficial **MUST preservar referência verificável ao
  documento original** (identificador, URL de origem e cópia arquivada).
- **A IA não infere fatos ausentes da fonte.** Saídas de IA são rastreáveis à passagem de
  origem; extrapolação é defeito, não estilo.
- Conteúdo gerado ou assistido por IA é marcado internamente como tal, com modelo, prompt e
  versão registrados para auditoria.
- Conteúdo patrocinado é rotulado de forma inequívoca na interface e nos dados estruturados.
- O pipeline editorial é fixo: Fonte → Ingestão → Normalização → Deduplicação → Extração →
  Classificação → IA → Rascunho → Revisão editorial → Publicação. Etapas podem ser
  automatizadas; nenhuma pode ser pulada.

**Justificativa**: credibilidade é o único ativo não replicável de um portal independente.
Uma única publicação automatizada incorreta custa mais do que todo o ganho de velocidade.

### VI. Consistência do Design System

- O protótipo importado e seu Design System são **fonte de verdade visual**. Spec Kit
  especifica comportamento, regras e arquitetura — **não redesenha o produto**.
- Todo valor visual vem de token (`--color-*`, `--space-*`, `--font-*`, `--elevation-*`,
  `--motion-*`). **Literais de cor, espaçamento ou tipografia em componentes são violação.**
- Tokens têm fonte única e centralizada, consumida por Tailwind e pelos componentes. Nenhum
  valor é duplicado entre pacotes.
- Antes de criar componente, verificar se já existe. Duplicação de componente é violação.
- Ambos os temas (claro e escuro) são suportados por todo componente. Um componente que só
  funciona em um tema está incompleto.
- Responsividade segue os breakpoints do Design System importado; nenhum breakpoint novo é
  introduzido sem registro em ADR.

**Justificativa**: o design já é uma decisão de produto tomada. Reabri-la componente a
componente produz deriva visual e retrabalho sem ganho.

### VII. Backend API-First

- O Laravel é o núcleo. **O frontend público não contém regra de negócio** — nem cálculo de
  elegibilidade, nem regra de publicação, nem lógica de precedência editorial.
- Contratos de API são definidos e versionados (`/api/v1/...`) **antes** da implementação de
  endpoint ou de tela. O contrato é o artefato revisado; o código o implementa.
- Toda mudança de contrato é aditiva dentro de uma versão. Mudança incompatível exige nova
  versão e plano de migração.
- Frontends consomem a API exclusivamente por um cliente tipado compartilhado; nenhuma
  chamada HTTP ad hoc em componente.
- Dependências externas (storage, busca, IA, ingestão) são acessadas por **abstração de
  domínio**, nunca por SDK de fornecedor espalhado pelo código. Trocar Meilisearch por
  Algolia, ou R2 por outro storage, deve tocar apenas a implementação da porta.

**Justificativa**: o produto terá múltiplos consumidores (portal, admin, futuras
aplicações). Contrato estável antes de código evita que cada consumidor invente sua própria
verdade.

### VIII. Monólito Modular

- A arquitetura é um **monólito modular** no Laravel. **Microserviços são proibidos nesta
  fase.**
- O domínio é organizado por módulo (News, Categories, Cities, Authors, Sources,
  OfficialGazette, Editorial, AI, Advertising, Analytics, Users, Media, Search) com
  separação entre `Domain`, `Application`, `Infrastructure` e `Http`.
- Módulos comunicam-se por interfaces públicas e eventos de domínio. **Acesso direto a
  tabelas ou modelos internos de outro módulo é violação.**
- A ingestão é extensível por construção: `Source`, `Connector`, `IngestionJob`,
  `RawDocument`, `NormalizedContent`, `EditorialDraft`. Adicionar uma fonte nova implementa
  um conector; não altera o núcleo.
- Nenhuma aplicação é criada antes de ser necessária. Complexidade estrutural exige
  justificativa registrada.

**Justificativa**: o volume inicial (~5 artigos/dia) não justifica custo operacional
distribuído. Modularidade preserva a opção de extrair serviços quando o tráfego, e não a
estética arquitetural, exigir.

### IX. Testabilidade

- **TDD é obrigatório** para: lógica de domínio, contratos de API, pipeline editorial e
  regras de ingestão. Ciclo: teste → falha observada → implementação → passa → refatora.
- **Testes de contrato são obrigatórios** para todo endpoint novo ou alterado.
- Toda correção de bug começa por um teste de regressão que reproduz o defeito.
- **SEO e performance são testados, não presumidos**: CI valida schema JSON-LD, presença de
  canônica, geração de sitemap e orçamentos de Lighthouse/bundle.
- Componentes visuais derivados do protótipo não exigem TDD, mas exigem teste de
  acessibilidade automatizado e cobertura de ambos os temas.
- Testes são determinísticos: sem `sleep` para sincronização, sem dependência de relógio,
  ordem ou rede de terceiros. **Teste instável é teste falhando** — corrigido ou removido em
  até um dia útil; nunca re-executado até passar.

**Justificativa**: o pipeline editorial e a taxonomia geográfica são invisíveis na
interface. Sem testes, sua degradação só é descoberta pela perda de tráfego.

### X. Observabilidade

- Logs são estruturados (JSON), com identificador de correlação propagado por requisição e
  por job de fila.
- Toda etapa do pipeline editorial e de ingestão emite evento observável: início, fim,
  duração, resultado e motivo de falha.
- Filas expõem métricas de profundidade, latência e taxa de falha. Jobs falhos vão para
  dead-letter com payload preservado, nunca descartados silenciosamente.
- Core Web Vitals de campo (RUM) são coletados em produção, não apenas medidos em
  laboratório.
- Erros de aplicação são agregados e alertados. Falha silenciosa é violação.
- Toda mudança de configuração de produção é rastreável a um ator e a um momento.

**Justificativa**: ingestão automatizada falha em silêncio por padrão. Sem instrumentação, a
descoberta acontece quando o conteúdo já está errado no ar.

### XI. Progressive Enhancement

- Toda funcionalidade essencial — ler notícia, navegar categorias e municípios, buscar,
  paginar, assinar newsletter — **funciona sem JavaScript de cliente**.
- Formulários funcionam por submissão HTML nativa; JavaScript melhora a experiência, não a
  viabiliza.
- Links são `<a href>` reais com URL resolvível. Navegação não depende de manipulador de
  evento.
- Falha ao carregar um script de terceiros (anúncio, analytics, widget de clima, mapa) nunca
  quebra a leitura do conteúdo. Widgets de terceiros são isolados e degradam graciosamente.

**Justificativa**: conectividade regional é irregular e bloqueadores são comuns. Conteúdo que
depende de script é conteúdo que às vezes não existe — para leitores e para rastreadores.

### XII. Simplicidade de Infraestrutura

- Infraestrutura mínima que atenda os orçamentos: CDN (Cloudflare), aplicação, PostgreSQL,
  Redis, RabbitMQ, storage de objetos (R2). Nada além disso sem ADR.
- **Cache é preferido a escala.** Conteúdo cacheável não gera consulta ao backend. A
  invalidação é explícita e disparada por evento de publicação — nunca por TTL curto
  compensando ausência de estratégia.
- Toda peça de infraestrutura tem dono declarado, custo estimado e caminho de remoção.
- Nova tecnologia exige ADR que declare o problema, as alternativas rejeitadas e o critério
  de reversão.
- Ambientes são reprodutíveis por configuração versionada; nenhuma etapa manual de
  provisionamento indocumentada.

**Justificativa**: a operação é de equipe pequena. Cada componente adicionado consome
atenção que não está disponível.

## Restrições Arquiteturais Obrigatórias

Estas restrições são vinculantes. Alterá-las exige emenda a esta constituição, não decisão
de PR.

**Stack fixa**

| Camada | Tecnologia |
|--------|-----------|
| Portal público (`apps/web`) | Astro + TypeScript + Tailwind CSS |
| Admin (`apps/admin`) | TypeScript + Tailwind CSS, sobre o Design System importado |
| Backend (`backend/`) | Laravel 13, PHP 8.4 |
| Banco | PostgreSQL |
| Cache / sessão | Redis |
| Mensageria | RabbitMQ |
| CDN / borda | Cloudflare |
| Objetos e mídia | Cloudflare R2 (atrás de abstração de storage) |
| Busca | Motor atrás da porta `SearchEngine` (Algolia ou Meilisearch — decidido no `/speckit.plan`) |

Substituição de qualquer item exige ADR com justificativa técnica.

**Camadas de cache (ordem obrigatória de consulta)**

1. CDN de borda (HTML de páginas públicas, imagens, assets)
2. Cache de aplicação em Redis (respostas de API, listagens, agregados)
3. Banco de dados

Toda resposta pública emite `Cache-Control` e `ETag` explícitos e é servida comprimida.
Publicação, edição e despublicação invalidam de forma direcionada: artigo, categorias
afetadas, hub do município, home e feeds. Invalidação global é último recurso registrado.

**Mídia**

Uploads passam por abstração de storage. O frontend nunca referencia bucket, região ou SDK
de fornecedor. Derivadas (thumbnail, cartão social, galeria) são geradas no servidor, não no
cliente.

## Contrato de URLs e Taxonomia Geográfica

- Municípios ocupam a raiz: `/{municipio}`. O registro de slugs, chaveado por código IBGE, é
  validado em build contra rotas reservadas.
- Cada município tem hub próprio, feed RSS próprio, entrada em sitemap e `Place` em JSON-LD.
- Notícia carrega **exatamente uma localização primária** (município) e zero ou mais
  secundárias (bairro, local, ponto de interesse). A primária determina o hub canônico.
- Adicionar município novo é operação de dados, não de código: nenhuma rota, template ou
  build script é editado para cobrir um município adicional.
- Nenhuma URL publicada é removida sem 301.

## Portões de Qualidade

Bloqueiam merge em `main`. Nenhum é dispensável pelo próprio autor.

| Portão | Requisito | Aplicado por |
|--------|-----------|--------------|
| Lint e formatação | Zero erros | CI |
| Checagem de tipos | Zero erros (TypeScript e PHPStan) | CI |
| Testes de domínio e contrato | Todos passam | CI |
| Acessibilidade | Zero violações WCAG 2.1 AA automatizadas | CI |
| Orçamento de performance | Lighthouse >= 95; LCP < 2s; CLS < 0,05; JS inicial <= 50 KB gz | CI |
| SEO | Canônica presente, JSON-LD válido, sitemap gerado, vínculo geográfico presente | CI |
| Tokens | Zero literais de cor/espaçamento/tipografia fora dos tokens | CI |
| Revisão por par | Ao menos uma aprovação de não-autor | Proteção de branch |

Dispensa apenas para hotfix de incidente, com motivo e tarefa de remediação registrados no
PR. Remediação vence no próximo dia útil.

## Fluxo de Desenvolvimento

- O trabalho segue Spec-Driven Development: `/speckit.constitution` → `/speckit.specify` →
  `/speckit.clarify` → `/speckit.plan` → `/speckit.checklist` → `/speckit.tasks` →
  `/speckit.analyze` → `/speckit.implement` → `/speckit.converge`. Nenhuma etapa é executada
  automaticamente sem revisão; cada uma produz artefato que alimenta a seguinte.
- Em caso de conflito: **design existente decide o visual; spec decide comportamento e
  requisitos; plan decide arquitetura e tecnologia.**
- Antes de modificar: inspecionar. Antes de implementar: entender. Antes de escolher:
  justificar. Antes de criar código: verificar se o componente ou padrão já existe.
- Cada feature em branch própria `###-nome-da-feature`. Commits diretos em `main` são
  proibidos.
- Todo plano passa pelo Constitution Check antes da Fase 0 e novamente após a Fase 1.
  Violações são corrigidas ou registradas em Complexity Tracking com a alternativa mais
  simples que foi rejeitada e o porquê.
- Decisões de impacto relevante viram ADR em `docs/decisions/`. A documentação arquitetural
  (`docs/architecture.md`, `frontend.md`, `backend.md`, `design-system.md`, `seo.md`,
  `performance.md`, `editorial-pipeline.md`, `ingestion.md`, `infrastructure.md`) é mantida
  junto com a mudança que a torna desatualizada, não depois.
- Revisores verificam conformidade constitucional explicitamente. Aprovar violação é
  compartilhar responsabilidade por ela.

## Governança

Esta constituição supersede quaisquer outras práticas, convenções e hábitos de
desenvolvimento. Havendo conflito, este documento prevalece.

**Procedimento de emenda**: emendas são propostas como pull request que altera este arquivo.
O PR MUST declarar a justificativa, o incremento de versão com fundamentação e o plano de
migração para o código que a emenda torna não conforme. Aprovação exige revisão do mantenedor
do projeto.

**Política de versionamento**: versionamento semântico.

- **MAJOR**: princípio removido ou redefinido de forma incompatível, ou mudança de governança
  que torna não conforme trabalho antes conforme.
- **MINOR**: princípio ou seção adicionada, ou orientação materialmente expandida.
- **PATCH**: esclarecimentos, redação e correções que não alteram obrigações.

**Revisão de conformidade**: todos os PRs verificam conformidade com estes princípios.
Complexidade que viola um princípio MUST ser justificada por escrito no ponto de introdução;
complexidade injustificada é motivo de rejeição, independentemente de correção funcional. A
aderência é revisada ao término de cada feature, e a própria constituição é revisada
trimestralmente.

**Orientação de runtime**: orientação específica de agentes e ferramentas vive nos arquivos
de guia do repositório (ex.: `CLAUDE.md`) e em `.specify/templates/`. Esses arquivos
implementam esta constituição; não a emendam.

**Version**: 2.0.0 | **Ratified**: 2026-08-11 | **Last Amended**: 2026-08-11
