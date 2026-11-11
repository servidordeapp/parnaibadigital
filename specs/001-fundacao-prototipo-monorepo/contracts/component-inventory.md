# Contrato do Inventário de Componentes

**Feature**: 001-fundacao-prototipo-monorepo

Contrato interno consumido pelo portal e pelo painel. **Uma definição por componente**
(SC-012). Todo componente é `.astro`, renderiza no servidor e funciona nos dois temas
(FR-009). Nenhum componente contém valor literal de cor, espaçamento ou tipografia (FR-004).

Origem dos 34 componentes: `_ds_manifest.json` do Design System importado, grupos preservados
como na origem (FR-006).

---

## Publicados pelo Design System — 34 componentes

| Grupo | Componente | Caminho em `packages/ui` | Consumidores |
|---|---|---|---|
| `core` | Button | `src/core/Button.astro` | web, admin |
| `core` | IconButton | `src/core/IconButton.astro` | web, admin |
| `core` | Icon | `src/core/Icon.astro` | web, admin |
| `core` | Input | `src/core/Input.astro` | web, admin |
| `core` | Select | `src/core/Select.astro` | web, admin |
| `core` | Checkbox | `src/core/Checkbox.astro` | web, admin |
| `core` | Tag | `src/core/Tag.astro` | web, admin |
| `core` | Badge | `src/core/Badge.astro` | web, admin |
| `core` | Card | `src/core/Card.astro` | web, admin |
| `core` | PhotoFrame | `src/core/PhotoFrame.astro` | web, admin |
| `brand` | Wordmark | `src/brand/Wordmark.astro` | web, admin |
| `news` | HeroStory | `src/news/HeroStory.astro` | web |
| `news` | NewsCard | `src/news/NewsCard.astro` | web, admin |
| `news` | NewsListItem | `src/news/NewsListItem.astro` | web, admin |
| `news` | NeighborhoodTagBar | `src/news/NeighborhoodTagBar.astro` | web |
| `news` | SectionHeading | `src/news/SectionHeading.astro` | web, admin |
| `news` | CurationStamp | `src/news/CurationStamp.astro` | web, admin |
| `news` | RegionalContextBox | `src/news/RegionalContextBox.astro` | web |
| `news` | AttributionFooter | `src/news/AttributionFooter.astro` | web |
| `news` | ShareBar | `src/news/ShareBar.astro` | web |
| `navigation` | SiteHeader | `src/navigation/SiteHeader.astro` | web |
| `navigation` | WeatherStrip | `src/navigation/WeatherStrip.astro` | web |
| `navigation` | Breadcrumb | `src/navigation/Breadcrumb.astro` | web, admin |
| `navigation` | Tabs | `src/navigation/Tabs.astro` | web, admin |
| `navigation` | Pagination | `src/navigation/Pagination.astro` | web, admin |
| `navigation` | SiteFooter | `src/navigation/SiteFooter.astro` | web |
| `widgets` | WidgetCard | `src/widgets/WidgetCard.astro` | web |
| `widgets` | PharmacyList | `src/widgets/PharmacyList.astro` | web |
| `widgets` | JobList | `src/widgets/JobList.astro` | web |
| `widgets` | EventList | `src/widgets/EventList.astro` | web |
| `tourism` | LodgingCard | `src/tourism/LodgingCard.astro` | web |
| `tourism` | DestinationCard | `src/tourism/DestinationCard.astro` | web |
| `tourism` | LodgingList | `src/tourism/LodgingList.astro` | web |
| `ads` | AdSlot | `src/ads/AdSlot.astro` | web |

## Adições justificadas — 5 componentes (FR-007)

Padrões que o protótipo usa mas o Design System ainda não publica. Cada um entra no
inventário marcado como adição, com a justificativa abaixo, e usa exclusivamente tokens
existentes — nenhum token novo é criado.

| Componente | Caminho | Justificativa | Onde o protótipo usa |
|---|---|---|---|
| CommandPalette | `src/overlay/CommandPalette.astro` | Índice de telas por `Ctrl/Cmd+K`; sem equivalente no DS | Todas as superfícies |
| NavDrawer | `src/overlay/NavDrawer.astro` | Navegação móvel abaixo de 900px; o `SiteHeader` do DS não a publica | Portal, móvel |
| Toast | `src/overlay/Toast.astro` | Aviso temporário; o `readme.md` do DS declara que não foi criado | Admin |
| Skeleton | `src/feedback/Skeleton.astro` | Estado de carregamento; exigido por FR-014 e pelo Princípio III (anúncio a tecnologia assistiva) | Portal e admin |
| DataTable | `src/data/DataTable.astro` | Tabela de listagem do admin, com estado vazio | Admin (Notícias, Diário Oficial, Usuários, Publicidade) |

**Pendência de devolução ao design**: os cinco são adaptações locais de padrões que deveriam
nascer no projeto de design. Após aprovação visual, devolvê-los por `DesignSync` para que a
próxima reimportação os traga (mesmo tratamento dado ao tema escuro, D-07).

## Não criados nesta fase (Assumption 8, Princípio VIII)

Galeria de mídia, player de vídeo, linha do tempo, widget de mapa, widget de clima como
componente autônomo (existe apenas como `WeatherStrip`), seção de comentários. Nenhuma tela
do protótipo os pede; criá-los seria estrutura antes da necessidade.

---

## Contrato de cada componente

Todo componente publicado por `packages/ui` cumpre:

1. **Props tipadas** por `interface Props`, sem `any`, importando entidades de `packages/types`.
2. **Sem literal visual** — cor, espaçamento, raio, sombra, tipografia e duração vêm de token.
3. **Dois temas** — verificado por teste automatizado em ambos.
4. **Semântica** — landmark ou elemento correto (`article`, `nav`, `time datetime=…`), sem
   `div` com papel implícito.
5. **Sem regra de negócio** (FR-026) — o componente formata o que recebe; não decide.
6. **Funciona sem JavaScript**; se tem enriquecimento, o estado inicial já é útil e o script
   é anexado por `<script>` de módulo do próprio componente.
7. **Estados cobertos** quando aplicável: repouso, hover, press, foco, desabilitado,
   selecionado, carregando, vazio.
8. **Card no inventário** em `/componentes`, com variantes e exemplo renderizado (FR-005).
