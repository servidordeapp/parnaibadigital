# Phase 1 — Modelo de Dados

**Feature**: 001-fundacao-prototipo-monorepo
**Escopo**: contratos tipados e dados demonstrativos. **Não** há esquema de banco, migração
ou model persistido nesta fase (FR-038). Estas entidades existem em três lugares e em
nenhum outro:

1. `specs/001-…/contracts/openapi-v1.yaml` — fonte de verdade (D-10)
2. `packages/types` — TypeScript gerado do YAML
3. `packages/api-client/src/mock/data/` — dados demonstrativos tipados pelo item 2

Convenções: campos marcados **obrigatório** falham a checagem de tipos e a validação Zod se
omitidos. Datas são ISO 8601 com fuso (`America/Fortaleza`, sem horário de verão). Slugs são
minúsculos, sem acento, `[a-z0-9-]+`.

---

## Eixo geográfico (FR-021)

O eixo geográfico é a espinha do produto. Duas entidades, dois níveis, uma regra:
**todo conteúdo tem exatamente um município primário; bairro é opcional e sempre qualificado
pelo município.**

### Municipality (Município)

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `ibgeCode` | `string` (7 dígitos) | sim | **Identidade canônica.** Nunca o slug, nunca o nome |
| `name` | `string` | sim | Nome oficial com acentuação ("Luís Correia") |
| `slug` | `string` | sim | Ocupa a **raiz** (`/parnaiba`). Único no registro; validado contra rotas reservadas em build (D-13, SC-009) |
| `state` | `"PI"` | sim | Fixo nesta fase |
| `newsCount` | `integer ≥ 0` | sim | Derivado; demonstrativo nesta fase |
| `latitude` / `longitude` | `number` | não | Alimenta `Place` no JSON-LD |

Presentes nos dados: Parnaíba (2207702), Luís Correia (2205805), Ilha Grande (2204550),
Buriti dos Lopes (2202101), Cajueiro da Praia (2202174).

**Invariantes**
- `slug` ∉ conjunto de rotas reservadas do portal → violação reprova o build.
- Dois municípios nunca compartilham `slug` nem `ibgeCode`.
- Adicionar um município é edição deste registro e mais nada (SC-010).

### Neighborhood (Bairro)

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `id` | `string` | sim | Composto e estável: `{municipalitySlug}:{slug}` |
| `name` | `string` | sim | "Centro", "São José" |
| `slug` | `string` | sim | Único **dentro** do município, nunca globalmente |
| `municipalityIbgeCode` | `string` | sim | Referência ao município dono |

Presentes: São José, Centro, Nossa Senhora de Fátima, Piauí, Frei Higino, Reis Veloso
(Parnaíba); Pedra do Sal, Porto das Barcas (Parnaíba/litoral); Ilha Grande (Ilha Grande).

**Invariantes**
- Bairro homônimo em municípios diferentes é permitido e distinguível por `id` — nunca por
  `name` nem por `slug` isolado (edge case da spec).
- Rota: `/{municipio}/{bairro}`. Bairro não ocupa raiz.

---

## Conteúdo editorial

### News (Notícia)

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `id` | `string` | sim | |
| `slug` | `string` | sim | Único globalmente; mudança exige 301 (Princípio II) |
| `headline` | `string` | sim | Padrão do DS: `[Bairro] + [fato]`, ≤ ~10 palavras |
| `standfirst` | `string` | não | Linha de apoio (lede) |
| `body` | `ContentBlock[]` | sim | Blocos tipados (`paragraph`, `heading`, `list`, `quote`, `image`, `embed`) — nunca HTML cru do cliente |
| `categorySlug` | `string` | sim | → `Category.slug` |
| `tone` | `"urgent" \| "brand" \| "highlight" \| "standard"` | sim | Governa o tratamento visual do card/hero |
| `authorSlug` | `string` | sim | → `Author.slug`; "Redação ParnaíbaDigital" é autor válido |
| `municipalityIbgeCode` | `string` | **sim** | **Localização primária.** Determina o hub canônico. Omissão impede a construção (User Story 3, cenário 3) |
| `neighborhoodIds` | `string[]` | sim (pode ser vazio) | Localizações secundárias |
| `publishedAt` | `datetime` | sim | |
| `updatedAt` | `datetime` | sim | Alimenta "Atualizado há X min" |
| `image` | `MediaRef` | não | Ausente → `PhotoFrame` (edge case "ausência de foto") |
| `curation` | `CurationStamp` | sim | Ver abaixo — obrigatório em toda superfície de notícia (FR-018) |
| `attribution` | `Attribution` | condicional | **Obrigatório quando `curation.kind = "curated"`** |
| `regionalContext` | `string` | não | Conteúdo do Bloco de Contexto Regional |
| `viewCount` / `commentCount` | `integer ≥ 0` | não | Demonstrativos |
| `sponsored` | `boolean` | sim | `true` exige rótulo na interface e em JSON-LD (Princípio V) |

**CurationStamp**: `{ kind: "curated" | "original", reviewedByHuman: boolean, updatedAt: datetime }`
**Attribution**: `{ sourceName: string, sourceUrl: url, archivedUrl?: url }` — renderiza
"Informações originais publicadas por [Veículo]" com link direto (Princípio V, FR-018).
**MediaRef**: `{ url, alt, width, height, credit? }` — `alt` obrigatório em imagem de
conteúdo; `width`/`height` obrigatórios (CLS).

**Invariantes**
- `municipalityIbgeCode` sempre resolve para um município do registro.
- `neighborhoodIds` sempre pertencem ao município primário.
- `curated` sem `attribution` → validação falha.
- Nenhuma regra de publicação, elegibilidade ou precedência vive no frontend (FR-026): o
  tipo carrega o estado, não a decisão.

### Category (Editoria)

`{ slug, name, tone }` — `tone` reusa a escala de `News.tone` para o realce da seção.
Presentes: Urgente, Trânsito, Litoral, Saúde, Serviços, Educação, Economia, Delta,
Meio ambiente, Política, Cultura, Emprego.

### Author (Autor)

`{ slug, name, bio, portrait?: MediaRef, articleCount }`. A assinatura institucional
"Redação ParnaíbaDigital" é registro válido, sem retrato pessoal — o produto não depende da
imagem de uma pessoa.

---

## Diário Oficial e pipeline

### OfficialGazetteDocument (Documento do Diário Oficial)

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `id` | `string` | sim | |
| `number` | `string` | sim | Número do documento |
| `agency` | `string` | sim | Órgão |
| `department` | `string` | não | Secretaria |
| `publishedAt` | `date` | sim | |
| `type` | `"portaria" \| "edital" \| "licitacao" \| "decreto" \| "resolucao" \| "contrato"` | sim | |
| `summary` | `string` | sim | |
| `status` | `GazetteStatus` | sim | Ver máquina de estados |
| `sourceRef` | `{ documentId, sourceUrl, archivedUrl? }` | **sim** | Referência verificável ao original — Princípio V, nunca opcional |
| `generatedNewsSlug` | `string` | não | Vínculo com a matéria gerada; **ausente é estado legítimo** (2 dos 6 documentos demonstrativos) |

**GazetteStatus** — máquina de estados (representação apenas; sem transição executável nesta fase):

```
fila_ia ──▶ em_revisao ──▶ publicado
   │             │
   └─────────────┴──▶ arquivado
```

Regra vinculante (Princípio V): **não existe aresta de `fila_ia` para `publicado`.** A
revisão humana não é pulável nem na representação (User Story 2, cenário 2).

### PipelineStage (Etapa do pipeline)

`{ order: 1..8, key, label, icon, description }` — sequência **fixa**:
Documento encontrado → Análise → Resumo → Reescrita → SEO → Imagem → **Editor (revisão
humana obrigatória)** → Publicado.
A etapa 7 nunca é omitida na renderização, mesmo em estado de animação.

### Source / Connector (contrato de extensão, sem implementação)

Tipos declarados para que adicionar uma fonte no futuro seja implementar um conector e não
alterar o núcleo (Princípio VIII):
`Source { id, kind: "rss"|"sitemap"|"api"|"gazette"|"partner", name, url, enabled }`,
`IngestionJob { id, sourceId, startedAt, finishedAt?, status, error? }`,
`RawDocument`, `NormalizedContent`, `EditorialDraft`.
Nesta fase existem apenas como tipos e interfaces de porta — nenhum coletor roda (FR-038).

---

## Superfícies de serviço

### Event (Evento)
`{ id, slug, title, startsAt, endsAt?, venue, municipalityIbgeCode, neighborhoodId?, categorySlug, price: { free: boolean, amount?: number } }`
→ JSON-LD `Event` na tela de eventos.

### Company (Empresa)
`{ id, slug, name, categorySlug, neighborhoodId, rating: 0..5, reviewCount, phone, openingStatus: "aberto"|"fechado"|"fecha_em_breve" }`
Telefone no formato local `(86) 3322-4410`, em fonte mono, conforme o DS.

### UtilityItem (Item de utilidade pública)
`{ id, group: "concursos"|"empregos"|"licitacoes"|"editais", agency, title, detail, amount?, deadline?, statusBadge }`
Os 4 grupos são fixos e cada um tem estado vazio próprio (edge case "tela sem estado
demonstrativo").

### AdSlot (Slot de anúncio)
`{ placement: "top"|"in-feed"|"sidebar"|"in-article", width, height, label }`
Dimensões vêm dos tokens `--ad-*`; **nenhuma rede real é associada** (FR-032/FR-038).
Restrições verificadas em build: ≤ 3 slots acima da dobra; nunca dois consecutivos sem
conteúdo editorial entre eles.

### NewsletterSubscription (Assinatura)
`{ channel: "email"|"whatsapp", destination }` — formulário funciona por submissão HTML
nativa (Princípio XI); **nenhum envio real** nesta fase.

### AnalyticsMetric (Métrica)
`{ key, label, value, delta, period }` — existe apenas para reproduzir Dashboard e Analytics.

### User (Usuário)
`{ id, name, role: "admin"|"editor"|"redator"|"revisor", status: "ativo"|"inativo" }` —
apenas para reproduzir a tela de Usuários. **Sem autenticação, sem sessão, sem permissão
efetiva** (FR-038).

---

## Relações (resumo)

```
Municipality 1 ──── * Neighborhood
     │ 1                   │ 0..*
     │                     │
     * News ───────────────┘         News * ──── 1 Category
     │                                News * ──── 1 Author
     * Event                          News 0..1 ── 1 OfficialGazetteDocument
Neighborhood 1 ──── * Company
```

## Regras transversais de validação (aplicadas por `packages/validation`, D-11)

1. Toda `News`, `Event` e `Company` resolve para um município existente no registro.
2. Todo `neighborhoodId` pertence ao município da própria peça de conteúdo.
3. `News.curation.kind = "curated"` ⇒ `attribution` presente e `sourceUrl` absoluta.
4. `OfficialGazetteDocument.sourceRef.sourceUrl` sempre presente e absoluta.
5. Todo `MediaRef` de conteúdo tem `alt` não vazio, `width` e `height`.
6. Nenhum slug duplicado dentro de seu escopo (global para município e notícia; por
   município para bairro).
7. Falha em qualquer regra **reprova a construção** — não gera aviso.
