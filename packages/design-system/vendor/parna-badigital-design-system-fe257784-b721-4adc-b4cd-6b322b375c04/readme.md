# ParnaíbaDigital — Design System

Sistema de design para o **ParnaíbaDigital**, portal de notícias regional e hiperlocal de **Parnaíba (PI)** e do Litoral piauiense — região de ~300 mil habitantes. O produto opera com **Curadoria Híbrida** (coleta e redação assistidas por automação + revisão humana), é **mobile-first** e é otimizado para **Google AdSense**.

## Fontes deste design system

Nenhum código, Figma, deck ou arquivo de marca foi anexado. O sistema foi derivado **exclusivamente do briefing de produto em texto** fornecido pelo usuário (requisitos de identidade, estrutura da home, blocos de monetização, widgets de utilidade pública e template do post). Portanto:

- **Não existe arquivo de logo.** A marca é assinada em tipo vivo (`Wordmark`). Nenhum logotipo foi desenhado ou reconstruído.
- **Não existem binários de fonte.** As famílias foram escolhidas no Google Fonts como substituição declarada (ver *Substituições*).
- **Não existe banco de imagens.** Fotos aparecem como `PhotoFrame` (placeholder azul hachurado).
- Se houver marca, fontes ou fotos reais, envie os arquivos: os tokens já estão nomeados para receber a troca sem refatorar componentes.

## Produto e superfícies

Um único produto: **site de notícias responsivo** (sem app nativo, sem site institucional separado). Superfícies mapeadas:

1. **Home** — manchete, bloco geolocalizado de bairros, grid/lista de notícias, sidebar de serviços, 4 zonas de anúncio.
2. **Post interno** — template de automação segura: título com bairro + cidade, contexto local, Bloco de Contexto Regional, Rodapé de Atribuição Legal.
3. **Listagem por bairro** — página de SEO geolocalizado por bairro.
4. **Utilidade pública** — painel dos widgets automáticos (farmácias de plantão, vagas locais, eventos do fim de semana, telefones de emergência).

Bairros usados como referência em todo o sistema: São José, Centro, Nossa Senhora de Fátima, Piauí, Frei Higino, Reis Veloso, Pedra do Sal, Ilha Grande.

---

## CONTENT FUNDAMENTALS

**Idioma:** português do Brasil, sempre. Nunca traduza rótulos de interface para o inglês.

**Tratamento:** fala-se com **você**, no singular ("as notícias do seu bairro"). A redação nunca fala de si na primeira pessoa do plural — em vez de "nós apuramos", escreva "a Secretaria informou". A única exceção é a assinatura institucional ("Redação ParnaíbaDigital").

**Manchete — regra de ouro:** `[Nome do Bairro] + [Fato]`, com o bairro na primeira palavra e o fato verificável.

- Faça: "São José ganha nova faixa elevada de pedestres na Av. São Sebastião"
- Faça: "Centro tem bloqueio na Rua Grande até sexta por obra de drenagem"
- Evite: "Você não vai acreditar na novidade que chegou ao bairro" (sem bairro, sem fato, curiosity gap)

**Tamanho das frases:** até ~20 palavras. Parágrafos de 2 a 4 linhas no celular. Manchete até ~10 palavras (o hero corta perto de 18 caracteres por linha).

**Caixa:** sentence case em títulos e botões ("Quero receber", não "QUERO RECEBER"). CAIXA ALTA apenas em kickers e badges de 11px (mono, com tracking largo): `SÃO JOSÉ · TRÂNSITO`, `URGENTE`, `[ANÚNCIO ADSENSE]`.

**Emoji: não.** Nem em manchete, nem em widget, nem em CTA. O calor da marca vem da cor laranja, não de figurinhas. Ícones são sempre Lucide.

**Números e dados:** com unidade e formato local — `(86) 3322-4410`, `32°C`, `R$ 1.6k`, `hoje, 4/8`, `06h30`, `há 8 min`. Dados sempre em fonte mono; isso sinaliza "informação de serviço", não opinião.

**Transparência da automação (obrigatória):** toda superfície de notícia exibe `Curadoria Inteligente` + `Atualizado há X min`; todo post curado termina com "Informações originais publicadas por [Veículo]" e link direto para a fonte. O rodapé do site repete "Conteúdo curado por automação com supervisão editorial humana". Nada disso é opcional — é o contrato de confiança e o requisito de política do AdSense.

**Tom dos widgets:** telegráfico e útil. "Farmácias de plantão hoje, 4/8". "Vaga: auxiliar de logística — Nossa Senhora de Fátima". Sem adjetivos.

**CTA:** verbo na primeira pessoa do leitor ("Quero receber", "Receber plantão no WhatsApp") ou instrução curta ("Ver todas do bairro", "Carregar mais notícias").

---

## VISUAL FOUNDATIONS

**Duas cores-motor.** *Azul tecnológico* (`--pd-blue-*`) carrega confiança, digital e automação: header azul-profundo 900, ação em 600. *Sol/litoral* (`--pd-sun-*`) carrega a identidade parnaibana: é acento, kicker de bairro, régua de seção e o único CTA de conversão por tela. Um terciário *mar do Delta* (`--pd-mar-*`) é reservado aos widgets de utilidade pública. Máximo de dois fundos por página: branco e o azul do header/rodapé (o creme `--surface-context` só dentro do box de contexto do post).

**Neutros quentes.** Os cinzas têm tinta amarelada (`--pd-ink-50` = `#F7F5F2`) para conversar com fotos ensolaradas do litoral. Nunca use cinza azulado no editorial — o cinza frio (`--pd-ad-*`) existe *só* dentro dos slots de anúncio, justamente para o anúncio nunca parecer conteúdo.

**Tipografia.** Display **Archivo** (700/800, tracking −0.02em) em manchetes; corpo **Source Sans 3** 17px/1.62 com medida de 68ch; meta/dados em **IBM Plex Mono** 11–15px. Manchetes usam `clamp()` — a mesma manchete funciona de 360px a 1280px. Mínimo absoluto de 15px em texto corrido e 13px em texto legal.

**Espaço.** Base 4px. 16px de respiro interno de card, 24px de gutter de grid, 40–64px entre seções. Container 1200px, coluna de leitura 680px, sidebar fixa de 336px (o retângulo grande de 336×280 encaixa exato).

**Cantos.** 3px badges, 6px botões/campos/thumbs, 10px cards e widgets, 14px hero, pill em tags de bairro e chips de clima. Nada de 24px+ — o portal deve parecer jornal, não app de banco.

**Cards.** Fundo branco, borda hairline `--border-subtle`, raio 10px, `--shadow-1` em repouso. No hover: `--shadow-2`, `translateY(-1px)` e fundo `--pd-blue-50`, com o título virando azul 700. Nunca borda colorida só na esquerda; nunca gradiente dentro de card.

**Sombras.** Quentes e rasas (tinta `rgba(31,28,24,…)`): 1 em repouso, 2 no hover, 3 no chrome fixo (header sticky), 4 apenas em modal. `--shadow-brand-glow` / `--shadow-hot-glow` apenas nos dois CTAs principais.

**Bordas e réguas.** Hairline de 1px separa listas e cards; régua de 4px cor-de-sol abre cada seção; 3px azul no topo do rodapé de atribuição; 3px sol como sublinhado da seção ativa no header; 3px azul inset como aba ativa.

**Fundos e imagens.** Sem gradiente decorativo em fundo de página. O único gradiente da marca é o fallback do hero (azul 800 → azul 600 → sol 600) quando não há foto, e o **gradiente de proteção** (`--scrim-photo`) que garante contraste do texto sobre foto. Sem textura, sem padrão repetido, exceto a hachura de 45° do placeholder de foto e a hachura suave do mapa do bairro. Fotografia real deve ser quente e ensolarada (dunas, Delta, rua) — sem grão, sem duotone, sem filtro frio.

**Transparência e blur.** Nenhum blur. Transparência apenas sobre o azul do header/rodapé (`rgba(255,255,255,0.08–0.24)` em chips, botões onDark e ícones sociais) e no scrim de foto. Vidro fosco não faz parte da marca.

**Animação.** Notícia é velocidade: 120ms para hover/press, 200ms para revelar, easing `cubic-bezier(.22,.8,.36,1)`. Sem bounce, sem parallax, sem entrada em cascata. A única transformação é o `translateY(-1px)` de card, o `scale(1.02)` lento da foto do hero e o `scale(0.985)` de press.

**Estados.** *Hover:* fundo mais claro da própria família (azul 50, ink 100) ou inversão total em tags (fundo azul 600, texto branco); links ganham sublinhado de 2px com offset. *Press:* `scale(0.985)` e sombra removida. *Foco:* anel `0 0 0 3px --pd-blue-200` (campos) ou outline azul 600 com offset 2px. *Disabled:* fundo ink-100, texto ink-500, sem sombra. *Selecionado:* régua de 3px (aba/nav) ou tag invertida.

**Layout fixo.** Header sticky de 64px sobre barra de data de 28px. Anúncio de sidebar é `sticky` abaixo do header. Alvos de toque nunca abaixo de 44px. Abaixo de 900px tudo vira uma coluna e a sidebar migra para depois do 6º card.

**Monetização como regra visual.** Slots são reservados com altura fixa (zero layout shift), rotulados `[Anúncio AdSense]`, em cinza frio com borda tracejada. Placement padrão: topo (728×90 / 320×100 no mobile), in-feed depois do 4º card (250px), sidebar 300×600 sticky, in-article depois do 2º parágrafo. Máximo 3 slots acima da dobra; nunca dois slots seguidos sem conteúdo editorial entre eles.

---

## ICONOGRAPHY

- **Sistema:** [Lucide](https://lucide.dev) (stroke de 2px, cantos arredondados, traço uniforme) — **substituição declarada**, já que o briefing não trouxe biblioteca de ícones. Carregado do CDN `lucide-static@0.469.0`, aplicado como `mask-image` sobre `currentColor` pelo componente `Icon`, então todo glifo herda a cor do texto.
- **Nunca** desenhe SVG à mão, nunca use emoji como ícone, nunca use caractere unicode (▶, ◉, ✓) em lugar de ícone. Não há fonte de ícones própria nem sprite no projeto.
- **Tamanhos:** 12–14px dentro de linhas mono/meta, 16–18px em UI, 20–22px no chrome do header.
- **Vocabulário fixo:** `map-pin` / `map-pinned` (bairro, geolocalização), `sparkles` (curadoria inteligente), `badge-check` (revisão humana), `refresh-cw` (dado automatizado), `calendar-days` (data/eventos), `pill` (farmácia), `briefcase` (vagas), `phone` (telefone útil), `life-buoy` (utilidade pública/emergência), `sun` / `cloud-rain` (clima), `link-2` (fonte original), `message-circle` (WhatsApp), `search`, `menu`, `chevron-right`, `arrow-right`, `external-link`, `image` (placeholder de foto).
- Se você tem ícones próprios, coloque-os em `assets/icons/` e troque o `LUCIDE_BASE` em `components/core/Icon.jsx`.

## Substituições a confirmar

| Item | O que foi usado | O que precisamos de você |
| --- | --- | --- |
| Logotipo | Nenhum — wordmark em tipo (Archivo 800, "Digital" em laranja) | SVG do logo, se existir |
| Fontes | Google Fonts: Archivo (display), Source Sans 3 (corpo), IBM Plex Mono (dados) — carregadas por `@import` em `tokens/fonts.css` | Arquivos `.woff2` das fontes oficiais (aí trocamos por `@font-face` local) |
| Ícones | Lucide via CDN | Set próprio, se houver |
| Fotografia | `PhotoFrame` com placeholder | Fotos reais de Parnaíba (litoral, Delta, ruas, bairros) |

---

## Índice

**Raiz**
- `styles.css` — ponto de entrada único (apenas `@import`s). Consumidores linkam este arquivo.
- `thumbnail.html` — tile do design system.
- `readme.md` — este guia.
- `SKILL.md` — front-matter para uso como Agent Skill.

**`tokens/`** — `fonts.css` (famílias + `@import` do Google Fonts), `colors.css` (rampas + aliases semânticos), `typography.css` (escala e papéis), `spacing.css` (espaço, raios, layout, tamanhos AdSense), `elevation.css` (sombras e scrims), `motion.css` (durações, easing), `base.css` (reset, links, seleção).

**`guidelines/`** — 23 cards de especímen (grupos Colors, Type, Spacing, Brand, AdSense): rampas de cor, aliases, escada de display/corpo/meta, padrão de manchete, escala de espaço, raios, sombras, bordas, grade da home, mapa de calor dos slots, motivo geolocalizado, selo de curadoria, atribuição legal, foto + scrim, voz e escrita, assinatura da marca.

**`components/`** (31 componentes; cada diretório tem um card `@dsCard`)
- `core/` — **Button**, **IconButton**, **Icon**, **Input**, **Select**, **Checkbox**, **Tag**, **Badge**, **Card**, **PhotoFrame**
- `brand/` — **Wordmark**
- `news/` — **HeroStory**, **NewsCard**, **NewsListItem**, **NeighborhoodTagBar**, **SectionHeading**, **CurationStamp**, **RegionalContextBox**, **AttributionFooter**, **ShareBar**
- `navigation/` — **SiteHeader**, **WeatherStrip**, **Breadcrumb**, **Tabs**, **Pagination**, **SiteFooter**
- `widgets/` — **WidgetCard**, **PharmacyList**, **JobList**, **EventList**
- `tourism/` — **LodgingCard**, **DestinationCard**, **LodgingList**
- `ads/` — **AdSlot**

**`templates/`** — pontos de partida para projetos que consomem este design system: `portal-home/PortalHome.dc.html` (home completa, com tweaks de altura do hero, anúncio sticky e temperatura) e `portal-post/PortalPost.dc.html` (post de automação segura, com contexto regional e atribuição legal).

**`ui_kits/portal/`** — recreação clicável do portal: `index.html` (Desktop/Mobile), `HomeScreen.jsx`, `PostScreen.jsx`, `BairroScreen.jsx`, `ServicesScreen.jsx`, `data.js`, `README.md`.

### Adições intencionais

Como não havia biblioteca de origem, o inventário foi definido pelo briefing. Três peças foram acrescentadas por necessidade estrutural: **Icon** (wrapper do set Lucide, para não haver SVG à mão), **PhotoFrame** (o portal não tem banco de imagens; o placeholder evita layout quebrado) e **Wordmark** (substitui o logo ausente). Não foram criados Toast, Tooltip, Avatar, Dialog ou Switch — nenhuma tela do briefing pede.
