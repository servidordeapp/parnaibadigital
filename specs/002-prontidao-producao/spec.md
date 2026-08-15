# Feature Specification: Prontidão para Produção — do protótipo ao portal publicado

**Feature Branch**: `002-prontidao-producao`

**Created**: 2026-08-12

**Status**: Draft — escopo decidido, zero perguntas abertas

**Input**: User description: "Encontre todas as pendencias do projeto que impedem ele de estar pronto para produção. Quero publicar o projeto e devemos identificar e resolver todos os problemas que ainda temos na aplicação para que ela fique production ready."

---

## Estado Atual Verificado

Esta seção não é opinião: é o resultado da auditoria do repositório em 2026-08-12, e é o
fundamento de todos os requisitos abaixo. Ela existe porque "pendências que impedem produção"
só é uma lista honesta se a linha de base for medida, não presumida.

### O que já está pronto e passando

| Verificação | Resultado |
| --- | --- |
| Tarefas da fase 001 | 149 de 149 concluídas |
| `pnpm lint` | passa (ESLint + Stylelint + Prettier) |
| `pnpm typecheck` | passa (TypeScript estrito + `astro check`) |
| Superfícies entregues | 25 (14 públicas + 11 administrativas), todas com rota resolvível |
| SEO | canônicas, JSON-LD, Open Graph, 7 sitemaps, feeds RSS por seção e por município |
| Portões de qualidade | 8 portões ativos em `.github/workflows/verify.yml` |
| Documentação | 9 documentos arquiteturais + 7 ADRs |

A fundação é sólida. **Nenhum requisito desta especificação pede refazer o que existe.**

### O que impede a publicação

A fase 001 declarou explicitamente, em FR-038, o que ela **não** entregaria. Essa lista de
exclusões é, quase inteira, a lista de pendências de produção. A auditoria confirma cada item
no código:

| # | Pendência | Evidência no repositório | Gravidade |
| --- | --- | --- | --- |
| P-01 | **Todo o conteúdo é fabricado.** As 12 notícias são ficção redigida no padrão editorial real, com autores nomeados, contadores de audiência e atribuição a um veículo inexistente (`diariodolitoral.example.com`). | `packages/api-client/src/mock/data/news.ts` | **Bloqueador absoluto** |
| P-02 | **Nenhum endpoint existe.** O contrato declara 14 caminhos; o transporte HTTP rejeita todas as 20 operações com "não implementado". | `packages/api-client/src/transports/http.ts`, `contracts/openapi-v1.yaml` | Bloqueador |
| P-03 | **Não há persistência.** O backend tem 11 arquivos PHP; os 14 módulos de domínio contêm apenas `README.md`. As únicas migrações são as padrão do framework (usuários, cache, filas). | `backend/api/app/`, `backend/api/database/migrations/` | Bloqueador |
| P-04 | **O painel administrativo não tem autenticação.** Nenhum login, nenhum papel, nenhum 2FA. As 11 telas administrativas são públicas para quem alcançar o endereço. | `apps/admin/.env.example`, `apps/admin/src/pages/` | Bloqueador |
| P-05 | **O bloqueio de borda do admin é um comentário.** A regra de restrição por endereço está escrita como `# ← rede da redação, a definir`. | `infrastructure/_headers` | Bloqueador |
| P-06 | **Não há caminho de publicação.** Existe um fluxo de verificação; não existe fluxo de entrega, ambiente de homologação, domínio, TLS nem gestão de segredos. | `.github/workflows/` contém apenas `verify.yml` | Bloqueador |
| P-07 | **Nada é observável.** Sem log estruturado, sem correlação, sem agregação de erro, sem alerta, sem Core Web Vitals de campo. | ausência em todo o repositório | Bloqueador |
| P-08 | **Não há trilha de auditoria nem versionamento de notícia.** Exigidos pelo Princípio IV; nenhuma tabela, nenhum evento. | ausência em `backend/api/` | Bloqueador |
| P-09 | **O pipeline editorial não existe como código.** As 8 etapas estão documentadas e desenhadas na tela; nenhuma delas executa. | `apps/admin/src/pages/pipeline.astro` (visual), `docs/editorial-pipeline.md` | Alta |
| P-10 | **A busca é uma varredura sobre dados de demonstração.** Nenhum motor real. | `packages/api-client/src/mock/`, ADR 0006 | Alta |
| P-11 | **Newsletter, publicidade, comentários e analytics são fachadas.** Coletam ou exibem, mas nada persiste, envia ou mede. | `apps/web/src/pages/newsletter.astro`, `anuncie.astro`, `apps/admin/src/pages/analytics.astro` | Alta |
| P-12 | **A política de cache de publicação não existe.** Nenhuma invalidação dirigida por evento de publicação, exigida pela Constituição. | `infrastructure/_headers` define TTL, não invalidação | Alta |
| P-13 | **A CSP admite `unsafe-inline` para script e estilo**, o que reduz a proteção contra injeção que o próprio cabeçalho pretende dar. | `infrastructure/_headers` | Média |
| P-14 | **Não há conformidade legal declarada.** Sem política de privacidade, sem base legal para a coleta de e-mail e WhatsApp da newsletter (LGPD), sem expediente identificando o responsável editorial. | ausência em `apps/web/src/pages/` | Alta |
| P-15 | **Não há mapa de redirecionamentos nem plano de continuidade.** Sem 301 para slug alterado, sem backup, sem restauração testada. | ausência | Média |

**Resumo**: o projeto está pronto para ser *demonstrado*, não para ser *publicado*. A distância
entre os dois estados é o backend inteiro, a operação inteira e o conteúdo real.

### Advertência editorial — leia antes de aprovar qualquer atalho

O caminho mais rápido para "publicar" seria subir o build estático atual em um domínio. **Isso
publicaria jornalismo fabricado.** As 12 notícias de demonstração são indistinguíveis de
matérias reais para qualquer leitor: têm manchete no padrão da casa, bairro, autor com nome e
foto, horário de publicação relativo ao instante da construção, contagem de visualizações e
citação de fonte. Publicá-las atribuiria ao ParnaíbaDigital afirmações sobre obras, trânsito e
serviços públicos de municípios reais que ninguém apurou.

Isso viola o Princípio V da Constituição (Integridade Editorial) de forma direta e é o único
item desta especificação que não admite ser adiado, mitigado ou aceito como risco. **FR-001
existe para tornar esse atalho impossível pela construção, não pela disciplina.**

---

## Escopo do Lançamento

Decidido em 2026-08-12. Substitui as três clarificações que travavam o planejamento.

### Dentro do lançamento

| Decisão | Consequência |
| --- | --- |
| **Plataforma completa**: backend, persistência, API, autenticação, fluxo editorial, busca real, newsletter, publicidade e métricas | US1 a US7 são escopo de lançamento |
| **Painel administrativo publicado**, com autenticação, papéis, segundo fator e auditoria | US2 é bloqueador P1 e a redação opera sozinha desde o primeiro dia |

### Fora do lançamento

| Decisão | Consequência |
| --- | --- |
| **Coleta automatizada de fontes e assistência por IA ficam para depois do lançamento** | US8 sai do escopo; as superfícies que dependem dela não são publicadas |

Esta é a única exclusão. Ela cria três consequências que os requisitos abaixo endereçam
explicitamente, porque nenhuma delas se resolve sozinha:

1. **O pipeline editorial fica parcial — e isso é conforme, não uma violação.** A Constituição
   fixa a sequência `Fonte → Ingestão → Normalização → Deduplicação → Extração → Classificação →
   IA → Rascunho → Revisão editorial → Publicação` e proíbe pular etapas. As sete primeiras
   etapas existem para transformar **documento de terceiro** em pauta. Matéria apurada e escrita
   por uma pessoa da redação nasce em `Rascunho`: a apuração é a origem. Nenhuma etapa é pulada
   porque nenhuma se aplica. A esteira automatizada entra completa quando a US8 entrar.
2. **A superfície pública de Diário Oficial não tem origem de dado real no lançamento.** Publicá-la
   vazia prejudica indexação e credibilidade; publicá-la com demonstração viola FR-002. Ela é
   retida — ver FR-045.
3. **As telas administrativas de Diário Oficial e de Pipeline ficam sem conteúdo real.** Elas não
   são públicas, mas exibir demonstração ao corpo editorial ensina a equipe a confiar em número
   inventado. Ver FR-046.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Nenhum conteúdo fabricado alcança o público (Priority: P1)

Um visitante abre o portal publicado e lê apenas matérias que uma pessoa da redação apurou,
escreveu ou revisou e aprovou. Não existe caminho — nem por engano de configuração, nem por
build de emergência — que faça uma notícia de demonstração chegar a um endereço público.

**Why this priority**: é o único requisito cuja falha causa dano irreversível. Uma matéria falsa
publicada sobre um município real destrói a credibilidade que é o ativo do produto, e nenhuma
correção posterior a recupera. Todos os demais itens desta lista causam indisponibilidade,
lentidão ou retrabalho — recuperáveis.

**Independent Test**: configurar o ambiente de produção apontando deliberadamente para a origem
de demonstração e confirmar que a construção **reprova** em vez de gerar páginas.

**Acceptance Scenarios**:

1. **Given** um ambiente marcado como produção, **When** a origem de dados configurada é a de
   demonstração, **Then** a construção falha com mensagem que nomeia o arquivo e a variável
   responsáveis, e nenhum artefato publicável é gerado.
2. **Given** o portal publicado, **When** um leitor percorre todas as superfícies públicas,
   **Then** nenhuma manchete, autor, empresa, evento ou documento oficial exibido é de
   demonstração.
3. **Given** uma notícia publicada, **When** o leitor verifica sua autoria e origem, **Then** o
   veículo, o responsável editorial e — quando a matéria deriva de fonte externa — a referência
   verificável à fonte original estão visíveis.
4. **Given** o portal publicado sem nenhuma matéria ainda apurada, **When** o leitor acessa a
   home, **Then** a página se apresenta íntegra e honesta (sem espaços quebrados e sem conteúdo
   inventado para preencher), em vez de exibir demonstração.

---

### User Story 2 - Só quem tem permissão publica (Priority: P1)

Uma pessoa da redação acessa o painel, se identifica, e só enxerga e opera o que seu papel
permite. Alguém sem credencial não alcança o painel nem nenhuma operação de escrita, mesmo
conhecendo o endereço exato.

**Why this priority**: hoje o painel é aberto. Publicá-lo como está entregaria a qualquer
visitante o controle editorial do veículo. É o segundo dano irreversível da lista, e bloqueia a
US3 — não faz sentido persistir conteúdo que qualquer um pode alterar.

**Independent Test**: tentar alcançar cada uma das 11 telas administrativas e cada operação de
escrita sem sessão válida, e confirmar recusa no servidor — não apenas ausência de link na
interface.

**Acceptance Scenarios**:

1. **Given** nenhuma sessão iniciada, **When** o endereço de qualquer tela administrativa é
   acessado diretamente, **Then** o acesso é recusado e nenhum dado editorial é revelado na
   resposta.
2. **Given** uma conta com papel administrativo, **When** o acesso é tentado apenas com senha,
   **Then** o segundo fator é exigido antes de qualquer operação.
3. **Given** uma conta com papel restrito, **When** ela tenta uma operação fora do seu papel,
   **Then** a operação é recusada no servidor e o registro de auditoria guarda a tentativa.
4. **Given** qualquer alteração em conteúdo publicado, permissão ou configuração, **When** ela é
   concluída, **Then** existe registro imutável com autor, momento, estado anterior e posterior.
5. **Given** repetidas tentativas de autenticação a partir de uma mesma origem, **When** o limite
   é ultrapassado, **Then** novas tentativas são recusadas temporariamente.

---

### User Story 3 - O conteúdo real existe, persiste e é servido (Priority: P1)

Uma pessoa da redação cria, edita e publica uma matéria; ela sobrevive a reinícios e a novas
versões da aplicação, e aparece no portal, no hub do município, na editoria, na busca, nos feeds
e nos sitemaps, sem que ninguém edite código.

**Why this priority**: é a capacidade central que hoje não existe. Sem persistência e sem API, o
portal é uma página congelada. As US1 e US2 protegem o produto; esta o torna um produto.

**Independent Test**: publicar uma matéria pelo painel, reiniciar a aplicação, e confirmar que
ela continua acessível em todas as superfícies derivadas.

**Acceptance Scenarios**:

1. **Given** uma matéria criada no painel, **When** ela é publicada, **Then** ela é alcançável em
   seu endereço próprio e aparece no hub do seu município, na sua editoria, no feed e no sitemap.
2. **Given** a aplicação reiniciada ou atualizada, **When** o conteúdo publicado é consultado,
   **Then** ele permanece íntegro, com autoria, datas e vínculo geográfico preservados.
3. **Given** uma matéria publicada, **When** seu endereço é alterado por decisão editorial,
   **Then** o endereço anterior redireciona permanentemente para o novo e nunca responde "não
   encontrado".
4. **Given** um sexto município adicionado aos dados, **When** a aplicação é construída,
   **Then** seu hub, feed e entrada em sitemap existem sem que nenhuma rota ou script tenha sido
   editado.
5. **Given** uma matéria sem município associado, **When** se tenta publicá-la, **Then** a
   publicação é recusada com explicação.
6. **Given** conteúdo enviado por um colaborador, **When** ele é persistido e exibido, **Then**
   marcação perigosa foi removida e nenhum script de origem externa executa na página.

---

### User Story 4 - A publicação chega ao leitor e a operação é visível (Priority: P2)

A redação publica uma correção e ela aparece para os leitores em segundos, não no próximo dia. Se
algo quebra — uma publicação falha, um erro se repete, o tempo de resposta degrada — a equipe
descobre por alerta, não por reclamação.

**Why this priority**: determina se o veículo é confiável no dia a dia. Não bloqueia o primeiro
acesso, mas sem isso a primeira falha em produção é descoberta tarde e diagnosticada às cegas.

**Independent Test**: publicar uma correção e medir o tempo até ela aparecer para um leitor
externo; depois, provocar uma falha deliberada e confirmar que ela gera alerta.

**Acceptance Scenarios**:

1. **Given** uma matéria publicada ou corrigida, **When** a operação conclui, **Then** as
   superfícies afetadas — a matéria, sua editoria, o hub do município, a home e os feeds — passam
   a servir a versão nova em até 60 segundos.
2. **Given** qualquer requisição, **When** ela é processada, **Then** existe registro estruturado
   com identificador de correlação que permite reconstruir o caminho completo dela.
3. **Given** um erro de aplicação ou um trabalho em fila que falha, **When** ele ocorre, **Then**
   ele é agregado, alertado e preservado — nunca descartado em silêncio.
4. **Given** leitores reais navegando, **When** as métricas de campo são consultadas, **Then**
   os Core Web Vitals medidos em campo estão disponíveis por superfície.
5. **Given** perda total do banco de dados, **When** a restauração do backup mais recente é
   executada, **Then** ela conclui dentro do objetivo declarado de tempo e de perda de dados, e
   esse teste é registrado.

---

### User Story 5 - O veículo é legalmente publicável no Brasil (Priority: P2)

Um leitor identifica quem responde pelo veículo, sabe quais dados pessoais são coletados, por que
e por quanto tempo, e consegue solicitar remoção. Quem assina a newsletter dá consentimento
registrado.

**Why this priority**: publicar um veículo de comunicação que coleta e-mail e WhatsApp sem base
legal declarada cria exposição regulatória desde o primeiro dia. O custo de resolver antes é
baixo; depois, não.

**Independent Test**: percorrer o portal como leitor e localizar expediente, política de
privacidade e o caminho de solicitação de remoção de dados; assinar a newsletter e confirmar que
o consentimento ficou registrado.

**Acceptance Scenarios**:

1. **Given** qualquer página pública, **When** o leitor procura pelo responsável, **Then** o
   expediente com identificação do veículo e do responsável editorial é alcançável.
2. **Given** o formulário de newsletter, **When** o leitor o submete, **Then** o consentimento é
   explícito, registrado com momento e finalidade, e o cancelamento é possível a qualquer tempo.
3. **Given** um titular de dados, **When** ele solicita acesso ou remoção, **Then** existe canal
   declarado e prazo de resposta.
4. **Given** conteúdo patrocinado, **When** ele é exibido, **Then** é rotulado de forma
   inequívoca na interface e nos dados estruturados.

---

### User Story 6 - O leitor encontra o que procura (Priority: P3)

Um leitor busca pelo nome do seu bairro, por um serviço ou por um assunto e recebe resultados
relevantes do acervo real, incluindo matérias publicadas minutos antes.

**Why this priority**: a busca é diferencial de um portal local, mas o produto é utilizável sem
ela enquanto o acervo é pequeno. Entra depois das capacidades que impedem publicar.

**Independent Test**: publicar uma matéria nova e confirmar que ela é encontrável por termo do
seu título e do seu bairro em seguida.

**Acceptance Scenarios**:

1. **Given** uma matéria publicada, **When** um termo do seu título é buscado, **Then** ela
   aparece nos resultados sem exigir reconstrução manual do índice.
2. **Given** um termo sem resultado, **When** a busca é feita, **Then** o estado vazio é
   explicado e oferece caminho alternativo.
3. **Given** um leitor com JavaScript desabilitado, **When** ele usa a busca, **Then** ela
   funciona por submissão nativa.

---

### User Story 7 - Newsletter, publicidade e métricas funcionam de fato (Priority: P3)

O que hoje é fachada passa a operar: assinaturas são armazenadas e recebem envio, os espaços
publicitários servem campanhas reais sem degradar a leitura, e as telas de analytics mostram
números medidos.

**Why this priority**: é o que transforma audiência em sustentação financeira, mas nada disso
impede o veículo de existir no ar. Depende de US3 e US4 estarem prontos.

**Independent Test**: assinar, receber; veicular uma campanha e confirmar que os Core Web Vitals
permanecem dentro do orçamento com ela ativa.

**Acceptance Scenarios**:

1. **Given** uma assinatura confirmada, **When** uma edição é disparada, **Then** ela é entregue
   e o cancelamento em um clique funciona.
2. **Given** um espaço publicitário com campanha ativa, **When** a página carrega, **Then** o
   espaço já estava reservado e nenhum conteúdo editorial se desloca.
3. **Given** falha ao carregar o recurso de anúncio ou de medição, **When** a página é lida,
   **Then** a leitura do conteúdo permanece intacta.
4. **Given** as telas de analytics, **When** são abertas, **Then** exibem números medidos do
   veículo, e nunca valores de demonstração.

---

---

> **User Story 8 — Diário Oficial, coleta automatizada e IA: fora do escopo do lançamento.**
> Preservada na seção [Fora do Escopo do Lançamento](#fora-do-escopo-do-lançamento) para a fase
> seguinte. Os requisitos que a sustentam (FR-003, FR-004, FR-005, FR-010) permanecem em vigor
> agora, como guardas: eles precisam existir **antes** da esteira, não junto com ela.

---

### Edge Cases

- **Portal sem nenhuma matéria publicada** (dia do lançamento): toda superfície derivada — home,
  hubs, editorias, feeds, sitemaps, busca — precisa se apresentar íntegra e honesta, sem quebra e
  sem preenchimento fabricado.
- **Município sem nenhuma matéria**: o hub existe (o registro de slugs o exige), mas está vazio.
- **Slug de matéria alterado após indexação**: o endereço anterior nunca pode responder "não
  encontrado".
- **Colisão entre slug de município novo e rota institucional ou de editoria**: precisa reprovar a
  construção, não decidir por precedência silenciosa.
- **Publicação durante indisponibilidade do motor de busca ou do armazenamento de mídia**: a
  matéria precisa ser publicável, com a indexação ou a derivação de imagem em pendência
  recuperável.
- **Duas pessoas editando a mesma matéria**: a segunda gravação não pode sobrescrever a primeira
  em silêncio.
- **Despublicação de matéria já indexada e já compartilhada**: precisa de comportamento definido
  para o endereço público e para os feeds.
- **Pico de acesso por matéria viral**: precisa ser absorvido pela borda, sem que cada leitor gere
  consulta ao backend.
- **Restauração de backup**: precisa ter sido executada ao menos uma vez antes do lançamento, não
  apenas configurada.
- **Segundo fator perdido por uma conta administrativa**: precisa de caminho de recuperação que
  não seja desligar o segundo fator.

---

## Requirements *(mandatory)*

### Requisitos de integridade editorial (bloqueadores)

- **FR-001**: O sistema MUST impedir, por falha de construção, que qualquer artefato destinado a
  ambiente público seja gerado a partir da origem de dados de demonstração. A verificação MUST
  ocorrer na construção, não em revisão humana.
- **FR-002**: O sistema MUST NOT expor, em ambiente público, qualquer matéria, autor, empresa,
  evento, documento ou métrica de demonstração.
- **FR-003**: O sistema MUST exigir aprovação humana explícita e registrada antes de tornar
  público qualquer conteúdo jornalístico, independentemente da sua origem.
- **FR-004**: Toda matéria derivada de fonte externa ou de documento oficial MUST preservar
  referência verificável à origem, incluindo cópia arquivada.
- **FR-005**: Todo conteúdo assistido por IA MUST ser marcado como tal internamente, com registro
  de modelo, versão e instrução, para auditoria.
- **FR-006**: Conteúdo patrocinado MUST ser rotulado de forma inequívoca na interface e nos dados
  estruturados.

### Requisitos de acesso e segurança (bloqueadores)

- **FR-007**: O sistema MUST exigir identificação válida para alcançar qualquer superfície
  administrativa e qualquer operação de escrita.
- **FR-008**: O sistema MUST verificar permissão no servidor para toda operação editorial e
  administrativa; ocultar um controle na interface não constitui controle de acesso.
- **FR-009**: O sistema MUST exigir segundo fator de autenticação para contas com papel
  administrativo.
- **FR-010**: O sistema MUST registrar, de forma imutável, toda alteração de conteúdo publicado,
  de permissão e de configuração, com ator, momento, estado anterior e posterior.
- **FR-011**: O sistema MUST versionar matérias, permitindo recuperar e comparar versões
  anteriores.
- **FR-012**: O sistema MUST limitar a taxa de requisições em endpoints públicos e de
  autenticação.
- **FR-013**: O sistema MUST validar toda entrada contra schema explícito no limite da aplicação e
  sanitizar por allowlist qualquer marcação recebida, antes de persistir e antes de renderizar.
- **FR-014**: O sistema MUST NOT versionar segredos, e MUST NOT expor credencial privilegiada ao
  frontend público.
- **FR-015**: O sistema MUST servir cabeçalhos de segurança em todas as respostas públicas, com
  política de conteúdo que não dependa de execução de script embutido arbitrário.
- **FR-016**: O acesso ao painel administrativo MUST ser restrito por regra efetiva e verificável
  no ambiente publicado — não por instrução pendente de preenchimento.

### Requisitos de conteúdo e persistência (bloqueadores)

- **FR-017**: O sistema MUST persistir conteúdo editorial de forma durável, sobrevivendo a
  reinício e a nova versão da aplicação.
- **FR-018**: O sistema MUST expor as operações de leitura declaradas no contrato existente, em
  versão estável, consumidas pelas aplicações sem chamada ad hoc.
- **FR-019**: O sistema MUST recusar publicação de matéria sem exatamente um município primário
  associado, identificado por código oficial.
- **FR-020**: O sistema MUST emitir redirecionamento permanente de todo endereço publicado que
  deixe de ser o canônico, e MUST NOT permitir que um endereço já publicado passe a responder
  "não encontrado" por edição editorial.
- **FR-021**: Adicionar um município novo MUST ser operação de dados, sem alteração de rota,
  template ou script de construção.
- **FR-022**: O sistema MUST manter as superfícies derivadas — hubs, editorias, autores, feeds e
  sitemaps — consistentes com o acervo publicado, sem intervenção manual.
- **FR-023**: O sistema MUST se apresentar íntegro quando o acervo estiver vazio ou parcialmente
  vazio, sem quebra de layout e sem conteúdo de preenchimento.

### Requisitos de entrega e operação (bloqueadores)

- **FR-024**: O sistema MUST ter caminho de entrega automatizado e reproduzível para ambiente
  público, disparado a partir do repositório, com os portões de qualidade existentes como
  condição.
- **FR-025**: O sistema MUST ter ambiente de homologação equivalente ao público, onde toda
  mudança é verificada antes de alcançar leitores.
- **FR-026**: O sistema MUST permitir reverter uma entrega para a versão anterior conhecida como
  boa, dentro de tempo declarado.
- **FR-027**: O sistema MUST emitir logs estruturados com identificador de correlação propagado
  por requisição e por trabalho em fila.
- **FR-028**: O sistema MUST agregar e alertar erros de aplicação e falhas de trabalho em fila;
  falha silenciosa é violação.
- **FR-029**: O sistema MUST coletar Core Web Vitals de campo em produção, por superfície.
- **FR-030**: O sistema MUST invalidar, ao publicar, editar ou despublicar, exatamente as
  superfícies afetadas — matéria, editorias, hub do município, home e feeds.
- **FR-031**: O sistema MUST ter backup automatizado do acervo com restauração testada e
  registrada antes do lançamento, e objetivos declarados de tempo de recuperação e de perda
  máxima aceitável.
- **FR-032**: O sistema MUST manter os orçamentos de performance, acessibilidade e SEO já vigentes
  também no ambiente público, medidos sobre o endereço real.

### Requisitos legais e institucionais

- **FR-033**: O portal MUST publicar expediente identificando o veículo e o responsável
  editorial.
- **FR-034**: O portal MUST publicar política de privacidade declarando dados coletados,
  finalidade, base legal, prazo de retenção e canal do titular.
- **FR-035**: A coleta de dados de contato MUST registrar consentimento explícito, com momento e
  finalidade, e oferecer cancelamento a qualquer tempo.
- **FR-036**: O sistema MUST atender solicitações de acesso e remoção de dados pessoais em prazo
  declarado.

### Requisitos de capacidades complementares

- **FR-037**: O sistema MUST oferecer busca sobre o acervo real, com conteúdo recém-publicado
  encontrável sem intervenção manual, e funcional sem JavaScript de cliente.
- **FR-038**: O sistema MUST armazenar assinaturas de newsletter e entregar envios, com
  cancelamento em um passo.
- **FR-039**: O sistema MUST veicular campanhas publicitárias com espaço reservado antes do
  carregamento, sem deslocar conteúdo editorial e sem quebrar a leitura em caso de falha do
  recurso.
- **FR-040**: As superfícies de analytics MUST exibir apenas números medidos do veículo.
- **FR-041**: Trabalhos executados em segundo plano que falham MUST preservar a carga para
  tratamento posterior e gerar alerta, nunca serem descartados em silêncio.

### Requisitos decorrentes da exclusão da coleta automatizada

- **FR-042**: O sistema MUST NOT publicar, no lançamento, superfície pública cuja única origem de
  dado seja a coleta automatizada. A superfície pública de Diário Oficial MUST ser retida: nenhum
  endereço dela é publicado, indexado ou referenciado em sitemap, feed ou navegação.
- **FR-043**: Como consequência de FR-042, a superfície de Diário Oficial MUST NOT ter endereço
  publicado antes de existir origem real. Reter é obrigatório justamente para não criar dívida de
  redirecionamento: um endereço que nunca foi publicado não precisa de 301 quando a esteira
  entrar (FR-020).
- **FR-044**: As superfícies administrativas cuja origem é a coleta automatizada — Diário Oficial
  e Pipeline — MUST exibir estado vazio explicando que a capacidade ainda não está ativa, e MUST
  NOT exibir dado de demonstração. FR-002 protege o público; este requisito protege a redação de
  aprender a confiar em número inventado.
- **FR-045**: O fluxo editorial do lançamento MUST aceitar matéria que nasce em rascunho por
  apuração própria, sem exigir documento de origem externo, preservando as etapas de rascunho,
  revisão e publicação como não-puláveis.
- **FR-046**: A arquitetura de conteúdo MUST admitir a entrada posterior da esteira automatizada
  sem alteração das entidades, endereços ou fluxo de aprovação estabelecidos no lançamento.

### Key Entities

Entidades novas ou que mudam de natureza — deixam de ser contrato tipado e passam a ser dado
persistido, versionado e auditável. As entidades já descritas na fase 001 permanecem válidas.

- **Account (Conta)**: pessoa que opera o veículo. Identificação, papel, segundo fator, situação,
  último acesso.
- **Role (Papel)**: conjunto nomeado de permissões que governa o que uma conta pode ver e fazer.
- **AuditEntry (Registro de auditoria)**: ator, momento, objeto afetado, natureza da alteração,
  estado anterior e posterior. Imutável.
- **ContentVersion (Versão de conteúdo)**: estado de uma matéria em um momento, com autor da
  alteração e possibilidade de comparação e recuperação.
- **EditorialApproval (Aprovação editorial)**: quem aprovou, quando, sobre qual versão, e sobre
  qual origem — o registro que separa rascunho de publicado.
- **RedirectRule (Regra de redirecionamento)**: endereço anterior, endereço canônico atual, motivo
  e momento.
- **NewsletterConsent (Consentimento)**: titular, canal, finalidade, momento do consentimento e do
  eventual cancelamento.
- **DeliveryRelease (Entrega)**: versão publicada, momento, autor, resultado dos portões e
  referência de reversão.

**IngestionRun** e as entidades da esteira automatizada (`Source`, `Connector`, `RawDocument`,
`NormalizedContent`) ficam para a fase seguinte, junto com a US8. FR-046 exige que a entrada
delas não force alteração nas entidades acima.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **Zero** itens de conteúdo de demonstração alcançáveis em qualquer endereço público
  do ambiente publicado, verificado automaticamente a cada entrega.
- **SC-002**: Uma tentativa deliberada de construir para produção a partir da origem de
  demonstração **reprova** a construção, com mensagem que nomeia a causa.
- **SC-003**: **100%** das superfícies administrativas e das operações de escrita recusam acesso
  sem sessão válida, verificado por teste automatizado que tenta o acesso direto.
- **SC-004**: **100%** das contas com papel administrativo têm segundo fator ativo.
- **SC-005**: **100%** das alterações de conteúdo publicado, permissão e configuração produzem
  registro de auditoria recuperável.
- **SC-006**: Uma matéria publicada pela redação está visível para um leitor externo em **até 60
  segundos**, sem intervenção técnica.
- **SC-007**: **Zero** endereços publicados respondem "não encontrado" após alteração editorial de
  slug; **100%** redirecionam permanentemente.
- **SC-008**: Adicionar um município novo produz hub, feed e entrada em sitemap **sem alterar
  nenhuma rota, template ou script**.
- **SC-009**: Os orçamentos vigentes se mantêm **no endereço público real**: Lighthouse ≥ 95 nas
  quatro categorias, LCP < 2,0 s, CLS < 0,05, INP < 200 ms, ≤ 50 KB de JavaScript comprimido por
  página.
- **SC-010**: **Zero** violações WCAG 2.1 AA automatizadas nas superfícies públicas do ambiente
  publicado, nos dois temas.
- **SC-011**: **100%** das superfícies públicas permanecem legíveis e navegáveis com JavaScript de
  cliente desabilitado, medido no ambiente publicado.
- **SC-012**: Uma falha de aplicação provocada deliberadamente gera alerta em **até 5 minutos** e
  é rastreável do alerta até a requisição de origem pelo identificador de correlação.
- **SC-013**: Uma restauração completa a partir de backup é executada e registrada **antes do
  lançamento**, dentro dos objetivos declarados de tempo e de perda máxima.
- **SC-014**: Uma entrega defeituosa é revertida para a versão anterior conhecida como boa em
  **até 15 minutos**.
- **SC-015**: **100%** das superfícies públicas oferecem caminho para expediente e política de
  privacidade; **100%** das assinaturas de newsletter têm consentimento registrado.
- **SC-016**: Uma matéria recém-publicada é encontrável pela busca em **até 60 segundos**, sem
  reindexação manual.
- **SC-017**: Com campanhas publicitárias ativas, o CLS permanece **< 0,05** e a falha do recurso
  de anúncio **não** impede a leitura do conteúdo.
- **SC-018**: **Zero** caminhos de código publicam conteúdo jornalístico sem aprovação humana
  registrada, verificado por teste que tenta cada caminho conhecido.
- **SC-019**: O portal com acervo vazio se apresenta íntegro em **100%** das superfícies públicas,
  sem quebra e sem conteúdo de preenchimento.
- **SC-020**: **Zero** segredos presentes no repositório, verificado automaticamente a cada
  entrega.
- **SC-021**: **Zero** endereços da superfície pública de Diário Oficial são alcançáveis,
  indexados ou referenciados em navegação, feed ou sitemap no lançamento.
- **SC-022**: **100%** das superfícies administrativas sem origem de dado real exibem estado vazio
  explicando a indisponibilidade; **zero** delas exibem dado de demonstração.
- **SC-023**: Uma matéria de apuração própria percorre rascunho, revisão e publicação **sem**
  exigir documento de origem externo, e **nenhuma** das três etapas pode ser pulada.

---

## Assumptions

Escolhas feitas na ausência de definição explícita. Cada uma é reversível em `/speckit-clarify`.

1. **"Production ready" significa um veículo de notícias operante, não um site estático no ar.**
   O pedido diz "publicar o projeto"; a leitura literal mais barata — subir o build atual —
   publicaria conteúdo fabricado e foi descartada por violar o Princípio V, não por ser pequena.
2. **A fundação da fase 001 é preservada.** Nenhum requisito aqui pede refazer superfícies,
   tokens, Design System, SEO ou portões existentes. A auditoria confirmou que passam.
3. **Os 8 portões de qualidade continuam vigentes e se tornam condição de entrega**, não apenas de
   merge.
4. **A stack fixada pela Constituição não é reaberta.** Astro no público, Laravel no núcleo,
   PostgreSQL, Redis, RabbitMQ, Cloudflare e R2 seguem como decididos; a escolha do motor de busca
   permanece a do ADR 0006.
5. **O contrato `openapi-v1.yaml` existente é o ponto de partida da API**, estendido de forma
   aditiva. As operações de escrita que o painel exige ainda não estão declaradas nele e serão
   acrescentadas na mesma versão.
6. **Todo o conteúdo do lançamento é produzido por pessoas da redação**, não importado nem
   gerado. Deixou de ser suposição: é consequência direta da exclusão da coleta automatizada e da
   IA. O volume inicial é o que a redação consegue apurar, e o dimensionamento de infraestrutura
   parte disso, não da projeção de ~5 artigos/dia da esteira automatizada.
7. **A jurisdição é brasileira** e a LGPD é o regime aplicável à coleta de dados pessoais.
8. **O domínio `parnaibadigital.com.br` e o subdomínio administrativo estão disponíveis** para o
   projeto, com controle de DNS acessível.
9. **A equipe de operação é pequena.** Toda proposta de infraestrutura respeita o Princípio XII:
   mínimo que atenda os orçamentos, com dono e caminho de remoção declarados.
10. **Comentários de leitores permanecem fora de escopo.** O protótipo exibe contador, mas a fase
    001 não criou a superfície, e moderação de comentários é um produto próprio com custo
    editorial recorrente.
11. **Os cinco municípios atuais bastam para o lançamento**; a expansão é operação de dados.
12. **A remoção dos dados de demonstração não apaga o pacote**: ele continua servindo
    desenvolvimento e teste, e o que muda é a impossibilidade de ele alimentar um artefato
    público.

---

## Fora do Escopo do Lançamento

Preservado aqui porque sai do lançamento, não do produto. A fase seguinte parte deste texto.

### User Story 8 - O Diário Oficial vira pauta sem que a IA publique (pós-lançamento)

Documentos oficiais são coletados, normalizados e transformados em rascunhos assistidos por IA,
que só chegam ao público após uma pessoa aprovar explicitamente — com o documento de origem
sempre rastreável.

**Por que fica para depois**: é a alavanca de volume do produto e a mais arriscada. Só faz
sentido depois que publicação, revisão e auditoria já são sólidas, porque é exatamente aqui que
uma falha publicaria erro em escala. Os guardas que a tornam segura — aprovação humana registrada
(FR-003), referência verificável à origem (FR-004), marcação de conteúdo assistido por IA
(FR-005) e auditoria imutável (FR-010) — são construídos **agora**, no lançamento, e ficam
esperando a esteira. Essa ordem é deliberada: guarda instalada depois da esteira é guarda que
alguém já contornou.

**Cenários de aceitação preservados**:

1. **Given** um documento coletado, **When** a esteira o processa até o fim, **Then** ele para em
   rascunho aguardando revisão, e não existe caminho que o publique automaticamente.
2. **Given** um rascunho assistido por IA, **When** ele é revisado, **Then** o revisor vê a
   passagem de origem correspondente a cada afirmação e a referência arquivada ao documento
   original.
3. **Given** conteúdo assistido por IA publicado, **When** a auditoria é consultada, **Then**
   modelo, versão e instrução usados estão registrados.
4. **Given** uma fonte nova a ser adicionada, **When** ela é integrada, **Then** apenas o conector
   correspondente é implementado, sem alteração do núcleo.
5. **Given** falha na coleta, **When** ela ocorre, **Then** o item vai para tratamento com carga
   preservada e gera alerta — nunca é descartado.

### Também fora

- **Comentários de leitores** — moderação é produto próprio com custo editorial recorrente.
- **Pagamentos e assinaturas pagas** — nenhuma superfície do protótipo os pede.
- **Aplicativo móvel** — o portal é responsivo e navegável por documento.

---

## Dependências

- **Conteúdo editorial real**: o lançamento depende de matérias apuradas pela redação, que não são
  produzidas por esta especificação. Com a coleta automatizada fora de escopo, esta passa a ser a
  dependência de caminho crítico do lançamento — não há outra origem de conteúdo.
- **Provisionamento de infraestrutura**: domínio, TLS, banco, cache, fila, armazenamento de
  objetos e borda precisam existir antes de FR-024 ser demonstrável.
- **Contas e papéis da redação**: a definição de quem opera o veículo e com qual papel precede
  FR-007 a FR-009.
- **Definição de responsável editorial**: pessoa nomeada, exigida por FR-033.
