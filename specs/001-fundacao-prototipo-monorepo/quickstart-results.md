# Execução do quickstart — V1 a V13

**Feature**: 001-fundacao-prototipo-monorepo · **Tarefas**: T149, T150
**Data da execução**: 2026-08-12
**Ambiente**: Node v24.18.0 · pnpm 11.10.0 · PHP 8.5.7 · Composer 2.10.1 · WSL2

## Resultado

| Cenário | Critério | Comando | Resultado |
|---|---|---|---|
| V1 | SC-001 | `pnpm test:e2e --grep "@surfaces"` | ✅ 25 rotas respondem; rota inexistente devolve 404 real |
| V2 | SC-002 | `pnpm test:e2e --grep "@themes"` + `pnpm shots` | ✅ automatizado · ⚠️ revisão humana **pendente** — ver [visual-review.md](./visual-review.md) |
| V3 | SC-007 | `pnpm test:e2e --project=no-js` | ✅ conteúdo e navegação operáveis sem JavaScript |
| V4 | SC-003 | `pnpm check:tokens` + prova negativa | ✅ **após correção** — ver "Defeitos encontrados", D-1 |
| V5 | SC-004 | `pnpm test:a11y` | ✅ zero violações WCAG 2.1 AA, 25 superfícies × 2 temas |
| V6 | SC-008 | `pnpm build && pnpm test:seo` | ✅ canônicas, OG, JSON-LD, sitemaps e feeds |
| V7 | SC-005/006 | `pnpm build && pnpm test:perf` | ✅ **após correção** — ver D-2 e D-3 |
| V8 | SC-009 | slug `eventos` no registro | ✅ build reprovado nomeando slug e rota em conflito |
| V9 | SC-010 | 6º município no registro | ✅ hub, RSS e sitemap gerados; nenhuma rota, template ou script tocado |
| V10 | SC-011 | `PD_DATA_TRANSPORT=http` | ✅ falha na camada de dados; nenhum componente alterado |
| V11 | SC-015 | `types:generate` + `validate:mocks` | ✅ `git diff` vazio; dados demonstrativos válidos; sem `routes/api.php` |
| V12 | Princípio VIII | `composer test/analyse/deptrac` | ✅ Pest, PHPStan nível 8 e Deptrac sem violação |
| V13 | SC-017 | `pnpm check:ds-integrity` | ✅ `vendor/**` byte-idêntico ao `MANIFEST.sha256` |

## Portão único (T150)

Os 8 portões da Constituição, na ordem do `pnpm verify`, mais os três comandos PHP:

| # | Portão | Resultado |
|---|---|---|
| 1 | `pnpm lint` | ✅ |
| 2 | `pnpm typecheck` | ✅ |
| 3 | `pnpm check:tokens` | ✅ |
| 4 | `pnpm check:ds-integrity` | ✅ |
| 5 | `pnpm validate:mocks` | ✅ |
| 6 | `pnpm test` | ✅ |
| — | `pnpm build` | ✅ 62 páginas; JS mais pesado 1,9 KB gz (orçamento 50 KB) |
| 7 | `pnpm test:seo` | ✅ |
| 8 | `pnpm test:a11y` · `pnpm test:e2e` · `pnpm test:perf` | ✅ |
| PHP | `composer test` · `analyse` · `deptrac` | ✅ |

**Todos verdes.**

---

## Defeitos encontrados e corrigidos durante a execução

Os cenários do quickstart existem para descobrir isto. Três dos quatro só apareceram porque
o cenário exige **provar que o portão reprova**, não apenas que ele passa.

### D-1 — O verificador de tokens nunca havia varrido um único arquivo `.astro`

**Como apareceu**: a prova negativa de V4 — injetar `color: #123456` em `Card.astro` — saiu
verde. Um portão que aprova a própria violação que existe para pegar.

**Causa**: `collectFiles` comparava caminho por subcadeia:

```ts
if (IGNORED_SEGMENTS.some((segment) => relativePath.includes(segment))) continue;
```

`IGNORED_SEGMENTS` contém `".astro"`, ali para pular o diretório de cache `apps/web/.astro`.
Como subcadeia, `.astro` casa também com `Card.astro` — **todo componente do repositório era
ignorado**. E como o Stylelint só varre arquivos `.css`, nenhum bloco `<style>` de `.astro`
era verificado por ferramenta nenhuma. FR-004 estava sem portão desde o início.

**Correção**: comparação por **segmento** de caminho (`isIgnoredPath`), preservando prefixo
para subárvores como `packages/design-system/vendor`.

**Consequência**: 20 literais apareceram de uma vez. Depois de duas correções de precisão do
próprio verificador — passou a honrar `stylelint-disable-line` na **própria** linha (três
declarações já traziam a justificativa escrita ao lado, vinda do `readme.md` do DS) e a
ignorar o atributo `sizes`, que é condição de mídia e não decisão de pintura — sobraram 15.
Nenhum é cor: são medidas de layout (largura de coluna, piso de trilha de grid, medida de
leitura) para as quais **o DS não tem token**. Cada uma recebeu supressão com justificativa
escrita, e as que pedem token novo estão listadas para devolução ao projeto de design (T148).

**Verificação**: com o verificador corrigido, a prova negativa de V4 reprova com arquivo,
linha, coluna e o token sugerido.

### D-2 — CLS de 0,089 em toda superfície: a fonte trocando depois da primeira pintura

**Como apareceu**: V7. CLS entre 0,086 e 0,201 contra um orçamento de 0,05, reprovando 13 das
14 URLs medidas.

**Causa**: com `font-display: swap` e as faces buscadas só depois do CSS, o texto pintava na
fonte de recurso e refluía quando a face real chegava. O Lighthouse atribuiu o deslocamento a
`main#conteudo` com causa "Web font loaded".

**Correção**: `packages/design-system/src/fonts.ts` exporta as URLs das faces `latin`
resolvidas por Vite, e o `BaseLayout` as anuncia como `<link rel="preload">`. `swap`
continua valendo — o que mudou é a fonte deixar de chegar tarde. `latin-ext` fica de fora
de propósito: cobre glifos raros e disputaria banda do caminho crítico.

### D-3 — O alternador de tema empurrava a página inteira ao aparecer

**Como apareceu**: depois de D-2, sobrou um deslocamento de **exatamente 0,0861 em todas as
superfícies** — o mesmo número em toda página denuncia um elemento compartilhado.

**Causa**: o botão de tema era entregue com o atributo `hidden` e `theme-toggle.ts` o
revelava após a primeira pintura. Medido em 360px: a faixa de utilidade saltava de 59,2px
para 115,2px e `main` descia 56px.

**Correção**: o botão passa a ser entregue **em fluxo**, com `data-pd-theme-toggle="pending"`
e `visibility: hidden`; o script o promove a `ready`. A caixa fica reservada desde o
servidor, o layout é idêntico com e sem JavaScript — como no protótipo, onde o alternador
está sempre presente — e `visibility: hidden` continua tirando o botão da árvore de
acessibilidade e da ordem de tabulação, que é o que a regra de enriquecimento exige.

**Verificação**: faixa de utilidade em 115,19px e `main` em 424,375px, idênticos com e sem
JavaScript. V7 passa.

### D-4 — `pnpm lint` reprovando por lixo do Lighthouse (específico de WSL)

**Causa**: sob WSL o `chrome-launcher` herda `TMP` do Windows e cria perfis temporários do
Chrome com o caminho literal `C:\Users\...` na raiz do repositório. O Prettier os varria e
reprovava o portão 1.

**Correção**: padrão `C:*` em `.gitignore` e `.prettierignore`. Não afeta a CI, onde o
problema não existe.

---

## Observações de ambiente

**Navegadores do Playwright.** Nesta máquina faltam as bibliotecas de sistema NSS/NSPR
(`libnspr4.so`, `libnss3.so`, `libasound.so.2`) que o Chromium do Playwright exige; sem elas
o navegador não sobe e o erro aparece como `browser has been closed`, que não diz o que
houve. Para esta execução as bibliotecas foram extraídas para um diretório temporário e
expostas por `LD_LIBRARY_PATH` — nada no repositório mudou. A correção permanente na máquina
é uma vez só:

```bash
sudo pnpm exec playwright install-deps chromium
```

A CI já faz isso por `playwright install --with-deps` no `verify.yml`, e por isso o problema
não aparece lá.

**Lighthouse.** Sob WSL o `chrome-launcher` escolhe o Chrome **do Windows**, que o lado Linux
não consegue acessar pela porta de depuração. Apontar `CHROME_PATH` para o Chromium do
Playwright resolve e ainda faz medição de performance e teste funcional exercitarem o mesmo
motor:

```bash
export CHROME_PATH="$HOME/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome"
```

## Pendência para o encerramento da fase

A definição de pronto do quickstart pede, além dos cenários verdes, **a revisão visual lado a
lado de V2 aprovada**. Ela está executada e registrada, mas os desvios D-07 a D-19 de
[visual-review.md](./visual-review.md) — concentrados no painel administrativo — aguardam
aprovação explícita ou correção. Nenhuma ferramenta pode dar essa aprovação.
