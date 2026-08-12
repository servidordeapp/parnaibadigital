# ADR 0003 — Fonte única de tokens visuais

**Situação**: aceita · **Data**: 2026-08-11 · **Feature**: 001-fundacao-prototipo-monorepo
**Referências**: FR-001 · FR-003 · FR-004 · SC-017 · D-04 · D-06 · D-07 · Princípio VI

## Problema

O Design System do produto nasce fora deste repositório, num projeto de design, e é
importado — 11 arquivos, dos quais 7 de token. A Assumption 10 diz que a verdade visual
continua nascendo lá e sendo reimportada a cada ciclo.

Ao mesmo tempo, o Tailwind CSS 4 quer conhecer os tokens para gerar utilitárias, os
componentes `.astro` querem consumi-los, e o tema escuro precisa remapeá-los. Três
consumidores, e a maneira preguiçosa de servir os três é **copiar** os valores para dentro
da configuração do Tailwind.

Copiar cria uma segunda fonte de verdade. A partir daí, mudar uma cor no projeto de design
não muda a utilitária correspondente, a divergência aparece semanas depois numa tela que
ninguém abriu, e a reimportação vira um merge manual.

## Decisão

**Três regras, e as três são verificadas em CI.**

### 1. O original entra vendorizado e byte-idêntico

`packages/design-system/vendor/parna-badigital-design-system-fe257784-…/` recebe os arquivos
exatamente como vieram. `MANIFEST.sha256` guarda o hash de cada um;
`scripts/check-ds-integrity.ts` recalcula e reprova divergência, ligado ao `pnpm verify` e ao
workflow de CI. Editar um arquivo vendorizado quebra a construção (SC-017).

### 2. O Tailwind **referencia**, não copia

`packages/design-system/src/index.css` importa os tokens vendorizados e declara `@theme inline`
apontando para as variáveis do DS — nunca para valores. Trocar um token no arquivo importado
muda utilitária, componente e tema escuro no mesmo instante, porque todos leem a mesma
variável.

### 3. Toda adaptação vive **ao lado**, como overlay

Quatro overlays nesta fase, cada um em arquivo próprio sob `src/theme/`, e cada um com ADR:

| Overlay           | Substitui                                              | ADR                                                         |
| ----------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| `fonts-local.css` | `tokens/fonts.css` (que faz `@import` do Google Fonts) | [0007](./0007-substituicoes-do-design-system.md)            |
| `icons.css`       | ícones por `mask-image` de CDN                         | [0007](./0007-substituicoes-do-design-system.md)            |
| `dark.css`        | ausência de tema escuro no DS                          | esta ADR + [0007](./0007-substituicoes-do-design-system.md) |
| `contrast.css`    | aliases do tema claro abaixo de WCAG AA                | [0007](./0007-substituicoes-do-design-system.md)            |

E `scripts/check-tokens.ts` varre `.astro`, `.ts` e `.css` atrás de hex, `rgb()`, `hsl()` e
literais `px` — inclusive dentro de classes utilitárias arbitrárias do Tailwind, que é onde
um literal se esconde com mais facilidade — e reporta arquivo, linha e o token que deveria
ter sido usado.

## A exceção: literais dentro de `dark.css`

Esta é a única exceção ao Princípio VI em todo o repositório, e é preciso ser honesto sobre
o tamanho dela.

**Por que existe**: o DS importado não publica tema escuro. `tokens/colors.css` define uma
paleta só. A paleta escura existe apenas dentro do protótipo aprovado, e FR-009 exige tema
escuro em toda superfície. Os valores extraídos precisam morar em algum lugar.

**Como está confinada**:

- um único arquivo, `packages/design-system/src/theme/dark.css`;
- cada literal com `check-tokens-disable` e justificativa própria na linha anterior;
- `tests/dark-parity.test.ts` compara o arquivo com o protótipo e reprova qualquer cor que
  não venha de lá — nenhum valor é inventado;
- os dois blocos (`[data-theme="dark"]` e `prefers-color-scheme`) são obrigados por teste a
  permanecer idênticos, para que a preferência do sistema e a escolha explícita nunca
  divirjam.

**O que não foi possível cumprir**: o plano previa redefinir _apenas_ aliases semânticos,
nunca rampas `--pd-*`. A restrição foi escrita antes do protótipo estar no repositório e
**não é satisfazível**: 48 referências em `_ds_bundle.js` e 25 em `packages/ui/src` consomem
rampa direto, sem passar por alias, então um overlay só de alias deixaria neutros quase
brancos sobre página escura. `dark.css` re-aponta 17 rampas exatamente como o protótipo as
re-aponta. O detalhe do achado está na [ADR 0007](./0007-substituicoes-do-design-system.md).

**Correções deliberadas sobre o Design System importado**, todas exigidas pelo Princípio III
e por SC-004, e todas pelo mesmo mecanismo — **re-apontar um alias para outro degrau de uma
rampa que já existe**, sem inventar cor:

| Alias                         | Onde           | Antes                             | Reprovava | Depois                                  |
| ----------------------------- | -------------- | --------------------------------- | --------- | --------------------------------------- |
| `--focus-ring`                | `dark.css`     | 2,05:1                            | 1.4.11    | outro degrau da rampa                   |
| `--text-urgent`               | `dark.css`     | 3,28:1                            | 1.4.3     | outro degrau da rampa                   |
| `--text-hot`                  | `contrast.css` | 4,19:1 sobre `--surface-hot-soft` | 1.4.3     | `--pd-sun-900`                          |
| `--text-success` (novo alias) | `contrast.css` | 2,98:1 no escuro                  | 1.4.3     | `--pd-success-600` / `--pd-success-100` |

`--text-success` é o único **nome** novo, e existe porque o DS não publica alias para a rampa
de sucesso: sem ele, os componentes escreviam `--pd-success-600` fixo e quebravam no escuro,
que é precisamente o defeito que um alias impede. Os dois valores que ele aponta já existem
em `tokens/colors.css`. Fidelidade ao protótipo não vale reprovar acessibilidade.

## Alternativas rejeitadas

**Copiar os valores para a configuração do Tailwind.** Segunda fonte de verdade; é
exatamente o que FR-003 proíbe. A divergência não aparece no dia da cópia, aparece na
terceira reimportação.

**Editar os arquivos do DS diretamente** para acrescentar o bloco escuro e trocar as fontes.
Reprovado por SC-017, e transforma cada reimportação num merge manual.

**Consumir o DS por CDN do projeto de design.** Dependência de terceiro no caminho crítico
de renderização — viola os Princípios I e XI.

**Inventar uma paleta escura.** Redesenho, proibido por FR-002. O protótipo é a fonte de
verdade visual; extrair dele é o que mantém a decisão rastreável a uma aprovação.

**`filter: invert()` para o tema escuro.** Destrói fotos e apaga a distinção do slot de
anúncio que o edge case de publicidade exige manter nos dois temas.

## Critério de reversão

**Da exceção de `dark.css`**: devolver o bloco escuro ao projeto de design por `DesignSync`
(T148) e reimportar. Na reimportação o overlay some, `dark.css` é apagado, e o DS passa a
publicar os dois temas. Este é o desfecho desejado, não uma possibilidade remota — a tarefa
já existe.

**Dos overlays de fonte e ícone**: somem quando o DS publicar as fontes auto-hospedadas e os
SVGs inlinados. O `readme.md` do próprio DS já marca as fontes como "substituição declarada",
o que sugere que ele espera essa devolução.

**Da regra de fonte única**: não tem reversão. É Princípio VI; mudá-la exige emenda à
Constituição, não uma ADR.
