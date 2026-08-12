# Auditoria de idioma, emoji e vocabulário de ícones — FR-017

**Feature**: 001-fundacao-prototipo-monorepo · **Tarefa**: T145
**Data da execução**: 2026-08-12

FR-017 exige que todo rótulo e todo conteúdo demonstrativo esteja em pt-BR, sem emoji e usando
apenas o vocabulário de ícones do Design System.

## 1. Idioma — pt-BR

**84 de 84** páginas construídas declaram `lang="pt-BR"` no elemento raiz. Nenhuma exceção.

A varredura do texto visível das 84 páginas (marcação removida) procurou termos de interface em
inglês. Os achados, com o veredito de cada um:

| Termo | Ocorrências | Onde | Veredito |
|---|---|---|---|
| `newsletter` | 163 | rótulo de seção e rota | **pt-BR** — empréstimo consolidado; é o nome da superfície no protótipo |
| `home` | 104 | item do índice de comandos e prosa ("topo da home") | **pt-BR** — o protótipo usa `label: "Home"` e escreve "volte para a home" |
| `news` | 31 | nomes de classe CSS (`pd-news-card`) e o grupo `/componentes/news` | **não é texto visível** |
| `link` | 30 | "Copiar link da matéria", "Fonte original" | **pt-BR** — empréstimo consolidado |
| `dashboard` | 24 | `h1` e navegação lateral do painel | **pt-BR** — o protótipo usa `label: "Dashboard"` |
| `analytics` | 24 | `h1`, rota e navegação lateral do painel | **pt-BR** — o protótipo usa `analytics: ["Dados", "Analytics…"]` |
| `feed` | 17 | `In-feed`, `In-read` — formatos de anúncio | **termo técnico do setor**, como no protótipo |
| `tag` | 5 | nome do componente `Tag` na galeria | **identificador de componente**, não rótulo de produto |
| `website` | 2 | `@type: WebSite` do JSON-LD e `og:type` | **valor de máquina**, não texto |

**Nenhum rótulo em inglês sem justificativa.** Os três casos que poderiam ser traduzidos —
"Home", "Dashboard", "Analytics" — são os rótulos que o **protótipo** usa, e o protótipo é a
fonte de verdade visual desta fase. Traduzi-los seria desvio de SC-002, não conformidade com
FR-017.

## 2. Emoji

**Zero** em todo o código-fonte (`.astro`, `.ts`, `.css` de `apps/` e `packages/`) e **zero**
nas 84 páginas construídas.

O protótipo também não usa nenhum — verificado no arquivo vendorizado. A regra e a origem
concordam.

## 3. Vocabulário de ícones

Cumprido **por construção, não por convenção**.
`packages/design-system/src/icons/manifest.ts` declara os 21 glifos do `readme.md` do Design
System como um objeto `as const`; `IconName` é `keyof typeof ICON_VOCABULARY`, e `Icon.astro`
aceita apenas esse tipo. Um nome fora do vocabulário **não passa em `pnpm typecheck`** — não
chega a virar interface.

O Design System proíbe, no mesmo lugar, SVG desenhado à mão, emoji e caractere unicode no lugar
de ícone. As duas primeiras proibições estão cobertas acima; a terceira decorre de o glifo ser
inlinado a partir de `lucide-static` em tempo de construção (D-09), sem caminho para um
caractere entrar no lugar.

**Nota**: o protótipo referencia dois glifos fora do vocabulário do Design System —
`layout-dashboard` e `house`, na navegação. A aplicação usa glifos do vocabulário nessas
posições. É a substituição declarada em D-09 sendo cumprida: o pedido por um glifo novo volta
ao Design System, não ao código.

## Resultado

**FR-017 satisfeito** nos três aspectos, com os empréstimos da tabela 1 registrados e
justificados pela fidelidade ao protótipo.
