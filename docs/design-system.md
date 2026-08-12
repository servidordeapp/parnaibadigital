# Design System — como consumir

**Feature**: 001-fundacao-prototipo-monorepo · **Princípio VI**, FR-003 a FR-007

Este documento responde quatro perguntas, nesta ordem: como usar um token, como escolher um
componente, o que fazer quando o componente não existe, e por que o arquivo original nunca é
editado.

---

## 1. Como consumir tokens

Existe **uma** fonte de verdade: os arquivos em
`packages/design-system/vendor/parna-badigital-design-system-.../tokens/`. Nada é copiado
deles. O Tailwind os _referencia_ por `@theme inline` em
`packages/design-system/src/index.css`, e é isso que faz mudar um token alcançar utilitária,
componente e tema escuro no mesmo instante.

Na prática, dentro de um `.astro`:

```css
/* certo — o valor vem do DS */
color: var(--text-strong);
padding: var(--space-5);
box-shadow: var(--shadow-2);

/* errado — reprova em `pnpm check:tokens` e no stylelint */
color: #04162c;
padding: 16px;
```

O verificador não apenas reprova: **diz qual token deveria ter sido usado**. Se ele sugerir
"um alias semântico", é porque o valor não existe na escala — e aí o pedido volta ao projeto
de design, não se resolve com um literal.

### Alias semântico ou rampa?

Prefira sempre o **alias semântico** (`--text-*`, `--surface-*`, `--border-*`): é ele que o
tema escuro redefine. Usar a rampa direto (`--pd-blue-600`) prende a cor ao tema claro.
A exceção é quando o próprio DS usa a rampa — o botão `hot` sobre cor-de-sol, por exemplo.

### Duas exceções confinadas, ambas registradas

1. **`src/theme/dark.css`** contém valores literais. O DS não publica tema escuro; a paleta
   só existe dentro do protótipo. Cada literal tem `stylelint-disable` com justificativa, e
   a reversão está definida: devolver o bloco por `DesignSync` e reimportar (D-07, ADR 0003).
2. **`src/theme/fonts-local.css`** declara `@font-face` à mão. Os pacotes
   `@fontsource-variable` não publicam CSS por subconjunto, e importar o arquivo completo
   traria seis subconjuntos onde o português usa dois (D-08).

---

## 2. Como escolher um componente

Comece pelo inventário vivo: **`/componentes`** (`pnpm dev`, depois
`http://localhost:4321/componentes`). Ele lista os 39 componentes — 34 publicados pelo
Design System e 5 adições justificadas — com busca **por nome e por função**. Procurar
"anúncio" acha `AdSlot` sem que você precise saber o nome dele.

A lista sai do `_ds_manifest.json` vendorizado, não é mantida à mão. Se o DS publicar um
componente que `packages/ui` ainda não implementou, a galeria mostra a lacuna marcada como
**Pendente** em vez de fingir cobertura completa.

Importe sempre pelo barril:

```ts
import { NewsCard, SectionHeading } from "@parnaibadigital/ui";
```

Nunca pelo caminho interno (`packages/ui/src/news/NewsCard.astro`). O barril é a fronteira —
é ele que dá sentido à verificação de duplicidade de `packages/ui/tests/no-duplicates.test.ts`.

### O contrato que todo componente cumpre

1. Props tipadas por `interface Props`, sem `any`.
2. Zero literal visual.
3. Funciona nos dois temas, verificado por teste.
4. Semântica correta (`article`, `nav`, `time datetime=…`), sem `div` com papel implícito.
5. **Sem regra de negócio** (FR-026): o componente formata o que recebe, não decide. Se
   você precisou de um `if` sobre dado de domínio dentro do componente, a decisão pertence
   à tela.
6. Funciona sem JavaScript; se tem enriquecimento, o estado inicial já é útil.

---

## 3. O que fazer quando o componente não existe

Nesta ordem:

1. **Confira o inventário de novo, buscando por função.** A maior parte dos "não existe" é
   um componente com nome diferente do esperado.
2. **Componha o que existe.** Um bloco de listagem geralmente é `SectionHeading` +
   `NewsCard`; um widget de barra lateral é `WidgetCard` com conteúdo dentro.
3. **Se ainda faltar, é uma adição** — e adição tem processo: entra em
   `contracts/component-inventory.md` com justificativa escrita, usa **apenas tokens
   existentes** (nenhum token novo), e é marcada como adição na galeria. As 5 adições desta
   fase (`CommandPalette`, `NavDrawer`, `Toast`, `Skeleton`, `DataTable`) seguiram esse
   caminho.
4. **Depois de aprovada visualmente, devolva ao design** por `DesignSync`, para que a
   próxima reimportação a traga (mesmo tratamento dado ao tema escuro).

O que **não** fazer: copiar HTML de uma tela para outra. É assim que dois componentes com o
mesmo papel passam a divergir sem que ninguém tenha decidido isso — e é exatamente o que
SC-012 existe para impedir.

### Ícones

O vocabulário é **fechado**: ~20 glifos declarados no `readme.md` do DS, tipados em
`packages/design-system/src/icons/manifest.ts`. Um nome fora da lista não compila. Isso é
proposital — o DS proíbe SVG desenhado à mão, emoji e caractere unicode no lugar de ícone.
Quando o glifo certo não existe, prefira texto a inventar um ícone, e leve o pedido ao
projeto de design.

---

## 4. Por que o original vendorizado nunca é editado

`packages/design-system/vendor/` é **byte-idêntico** ao que foi importado. `MANIFEST.sha256`
guarda o hash de cada arquivo e `pnpm check:ds-integrity` recalcula em toda construção; uma
divergência reprova o build (SC-017).

O motivo não é cerimônia. Editar o arquivo importado significa que a próxima reimportação
apaga a correção em silêncio — e ninguém descobre até uma tela mudar sozinha. Com o original
intocado, cada substituição vive num **overlay ao lado** (`src/theme/*.css`), e a
reimportação é segura por construção.

As três substituições obrigatórias desta fase, todas como overlay:

| Substituição           | Arquivo                              | Por quê                                                                 |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| Tema escuro            | `src/theme/dark.css`                 | O DS não publica um; a paleta existe só no protótipo (D-07)             |
| Fontes auto-hospedadas | `src/theme/fonts-local.css`          | O DS usa `@import` do Google Fonts — terceiro no caminho crítico (D-08) |
| Ícones inlinados       | `src/theme/icons.css` + `Icon.astro` | O DS usa CDN; sem ele, botão de ícone fica sem rótulo visível (D-09)    |

---

## Os portões que sustentam tudo isto

| Comando                   | O que reprova                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `pnpm check:tokens`       | Literal de cor ou espaçamento em `.astro`/`.ts`/`.css`, inclusive em classe utilitária arbitrária do Tailwind |
| `pnpm exec stylelint`     | Literal em declaração CSS de cor, espaçamento, raio, sombra, tipografia e duração                             |
| `pnpm check:ds-integrity` | Qualquer byte alterado em `vendor/`                                                                           |
| `pnpm test --project ui`  | Componente exportando `any`; componente com definição duplicada                                               |
| `pnpm test:a11y`          | Violação WCAG 2.1 AA em qualquer superfície, nos dois temas                                                   |

Todos rodam em `pnpm verify` e no workflow de CI — merge bloqueado se algum reprovar.
