# ADR 0007 — Substituições sobre o Design System importado

**Situação**: aceita · **Data**: 2026-08-11 · **Feature**: 001-fundacao-prototipo-monorepo
**Referências**: FR-001 · FR-002 · FR-009 · FR-034 · SC-004 · SC-017 · D-07 · D-08 · D-09
**Depende de**: [ADR 0003 — Fonte única de tokens](./0003-fonte-unica-de-tokens.md)

## Problema

O Design System importado é a fonte de verdade visual e entra byte-idêntico (SC-017). Mas
ele traz três coisas que este produto **não pode** aceitar como estão, e falta uma quarta:

1. `tokens/fonts.css` carrega as famílias por `@import` do Google Fonts — terceiro no caminho
   crítico de renderização, proibido pelo Princípio I e por FR-034.
2. Os ícones são aplicados como `mask-image` a partir do CDN `lucide-static@0.469.0` — se o
   CDN falha, botões ficam sem rótulo visual, o que o edge case "falha de recurso de
   terceiro" e o Princípio XI proíbem.
3. `tokens/colors.css` **não publica tema escuro**. FR-009 exige tema escuro em toda
   superfície.
4. O inventário do DS não cobre cinco interações que o protótipo aprovado exercita.

Editar os arquivos importados resolveria os quatro em minutos — e quebraria SC-017,
transformando cada reimportação num merge manual.

## Decisão

**Nenhuma edição do original. Cinco substituições, cada uma como overlay ao lado.**

### 1. Fontes auto-hospedadas — `src/theme/fonts-local.css`

`@fontsource-variable/archivo`, `@fontsource-variable/source-sans-3` e
`@fontsource/ibm-plex-mono`, servidos do próprio domínio, subsetados para `latin` +
`latin-ext` (pt-BR precisa de `latin-ext`), `font-display: swap`, `preload` apenas dos pesos
acima da dobra.

O overlay redeclara **os mesmos três nomes de token** — `--font-display`, `--font-body`,
`--font-mono`. `tokens/fonts.css` é o único token vendorizado que `index.css` não importa.
Nenhum componente muda: eles continuam lendo os mesmos nomes.

O `readme.md` do próprio DS marca as fontes como "substituição declarada" e diz que os nomes
de token permanecem na troca. Esta é, portanto, a troca que o DS previu.

### 2. Ícones inlinados — `src/theme/icons.css` + `src/icons/manifest.ts`

`lucide-static` como dependência **de build**. Os ~20 glifos do vocabulário fixo do DS são
lidos em build e inlinados como SVG pelo `Icon.astro`: zero requisição em runtime, zero
JavaScript, `currentColor` preservado, os três tamanhos do DS mantidos.

### 3. Tema escuro extraído — `src/theme/dark.css`

Extraído do protótipo aprovado (`vendor/prototype/ParnaibaDigital.dc.html`), que é a fonte de
verdade visual (FR-002). Publicado sob `[data-theme="dark"]` e sob
`@media (prefers-color-scheme: dark)` guardado por `:root:not([data-theme="light"])`.

`tests/dark-parity.test.ts` compara o arquivo com o protótipo e obriga os dois blocos a
permanecerem idênticos entre si.

### 4. Cinco adições de componente

`CommandPalette`, `NavDrawer`, `Toast`, `Skeleton`, `DataTable` — cada uma justificada em
`contracts/component-inventory.md` e marcada como adição na galeria de componentes, para que
ninguém as confunda com originais do DS.

### 5. Correções de contraste do tema claro — `src/theme/contrast.css`

Dois aliases que o DS publica abaixo do mínimo de WCAG AA, e que só apareceram quando os
testes de acessibilidade rodaram num navegador de verdade: `--text-hot` (4,19:1 sobre
`--surface-hot-soft`) e a **ausência** de um alias para a rampa de sucesso, que levava os
componentes a fixar `--pd-success-600` e quebrar no tema escuro (2,98:1). A tabela completa
está na [ADR 0003](./0003-fonte-unica-de-tokens.md). O mecanismo é o mesmo das correções de
`dark.css`: re-apontar alias, nunca inventar cor.

## O achado de T018: a regra "nunca redefinir rampas" não era satisfazível

O plano previa que o tema escuro redefinisse **apenas aliases semânticos** (`--text-*`,
`--surface-*`, `--border-*`), nunca as rampas `--pd-*`. A ideia era boa: alias é a camada de
indireção que o DS criou exatamente para isso.

**A restrição foi escrita antes do protótipo estar no repositório, e não se sustenta.** Os
componentes consomem rampa **direto**, sem passar por alias: 48 referências às 17 rampas em
questão dentro de `_ds_bundle.js` e 25 em `packages/ui/src` (contagem verificada em
2026-08-12; ver o comando no rodapé). Um overlay só de alias deixaria neutros quase brancos e
azuis de texto escuros sobre uma página escura — resultado ilegível, não tema escuro.

**O que foi feito**: `dark.css` re-aponta 17 rampas — `--pd-ink-50/100/200/300`,
`--pd-blue-50/100/200/700/800`, `--pd-sun-50/100/700`, `--pd-mar-100/700`,
`--pd-ad-bg/border/ink` — **exatamente como o protótipo as re-aponta**. Nenhuma cor é
inventada; o teste de paridade reprova qualquer valor que não venha do protótipo.

**A intenção da regra continua honrada.** O que ela protegia era a marca: ninguém redesenha a
paleta por conta própria. Isso segue verdade — o que mudou é o mecanismo, de "não tocar em
rampa" para "nenhum valor que não venha do protótipo, verificado por teste".

### Duas correções deliberadas de contraste

O protótipo falha WCAG em dois pontos que ele mesmo nunca exercita:

| Token           | Contraste no protótipo | Critério reprovado                | Correção                          |
| --------------- | ---------------------- | --------------------------------- | --------------------------------- |
| `--focus-ring`  | 2,05:1                 | WCAG 1.4.11 (não-textual ≥ 3:1)   | repontado a outro degrau da rampa |
| `--text-urgent` | 3,28:1                 | WCAG 1.4.3 (texto normal ≥ 4,5:1) | repontado a outro degrau da rampa |

As duas repontam **alias** para outro degrau de uma rampa existente — sem cor nova, que é
exatamente o mecanismo que a regra original prescrevia. Fidelidade ao protótipo (FR-002) não
vale reprovar acessibilidade: o Princípio III e SC-004 vêm antes, e a divergência está
registrada aqui em vez de silenciosa.

## Alternativas rejeitadas

**Editar `tokens/colors.css` e `tokens/fonts.css` no `vendor/`.** Reprovado por SC-017 e pela
verificação de hash. Transforma reimportação em merge manual a cada ciclo.

**Manter o Google Fonts e o CDN de ícones.** Duas origens externas no caminho crítico do LCP,
contra o Princípio I; e um ícone que não carrega deixa botão sem rótulo, contra o Princípio
XI.

**Baixar os `.woff2` à mão para `public/`.** Mesmo resultado, sem atualização versionada nem
subsetting reproduzível.

**Sprite SVG externo** em vez de inlinar. Uma requisição a mais, e `mask-image` de sprite não
permite `currentColor` por glifo sem `<use>` + fetch.

**Pacote `lucide`** (com runtime JS) em vez de `lucide-static`. Os ícones são estáticos; o
runtime seria peso puro no orçamento de 50 KB.

**Inventar uma paleta escura** ou usar `filter: invert()`. A primeira é redesenho, proibido
por FR-002; a segunda destrói fotos e apaga a distinção do slot de anúncio que o edge case
exige manter nos dois temas.

**Aceitar o contraste do protótipo como está.** Entregaria uma superfície que reprova WCAG AA
com a assinatura de "fidelidade". SC-004 exige zero violação.

## Consequências

- `packages/design-system/src/` tem exatamente cinco arquivos que não existem no DS: quatro
  overlays de tema (`dark`, `fonts-local`, `icons`, `contrast`) e o manifesto de ícones. Cada
  um aponta para esta ADR.
- Zero requisição a terceiro no caminho crítico. É o que permite a CSP restrita de
  `infrastructure/_headers`.
- `dark.css` é a única exceção ao Princípio VI no repositório, confinada e verificada
  (detalhe na [ADR 0003](./0003-fonte-unica-de-tokens.md)).
- Existe **dívida de retorno ao design**, e ela é a razão de a exceção ser aceitável.

## Critério de reversão

Todas as quatro substituições são **temporárias por construção**. A devolução ao projeto de
design (`DesignSync`, tarefa T148) envia o bloco escuro e as cinco adições de componente para
a origem. Na reimportação seguinte:

- `dark.css` é apagado — o DS passa a publicar os dois temas;
- as cinco adições deixam de ser adições e viram componentes do DS;
- `contrast.css` some quando o DS corrigir `--text-hot` e publicar `--text-success`;
- `fonts-local.css` e `icons.css` somem se o DS adotar auto-hospedagem e SVG inlinado, o que
  o próprio `readme.md` dele sugere esperar.

Enquanto a devolução não acontece, cada ciclo de reimportação recria os overlays — e esse
atrito recorrente é, deliberadamente, o que mantém a dívida visível.

---

**Como reconferir as contagens deste documento**:

```bash
V=packages/design-system/vendor/parna-badigital-design-system-fe257784-b721-4adc-b4cd-6b322b375c04
RAMPS=$(grep -oE '^\s+--pd-[a-z0-9-]+:' packages/design-system/src/theme/dark.css \
  | sed 's/[: ]//g' | sort -u | paste -sd'|')
grep -oE "var\((($RAMPS))\)" "$V/_ds_bundle.js" | wc -l   # referências no bundle do DS
grep -rhoE "var\((($RAMPS))\)" packages/ui/src | wc -l    # referências nos componentes
```
