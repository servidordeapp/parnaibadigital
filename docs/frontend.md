# Frontend

**Feature**: 001-fundacao-prototipo-monorepo · Princípios I, III, XI

## Astro estático, por decisão

`output: 'static'` (D-02). Nenhuma rota desta fase precisa de servidor, e sair estático é o
que torna o orçamento de performance alcançável sem esforço contínuo: HTML pronto, servido da
borda, sem tempo de renderização por requisição.

A consequência que às vezes surpreende: **query string não existe para o roteamento**.
`/editoria/x?page=2` devolveria o HTML da página 1, porque o arquivo é o mesmo. Por isso a
paginação é por caminho (`/editoria/x/2`), e não por parâmetro — desvio consciente de
`contracts/routes.md`, registrado ali.

## Zero framework de UI no cliente

Todo componente é `.astro`, renderizado no servidor. Não há React, Vue ou Svelte no navegador
(D-05). As interações do protótipo entram como **enriquecimento em TypeScript puro**, sempre
sobre um estado inicial que já funciona.

O resultado medido, hoje: a página mais pesada entrega **2,1 KB de JavaScript comprimido**,
contra um orçamento de 50 KB.

## Orçamento de JavaScript

`apps/web/scripts/check-js-budget.ts` roda depois do build, mede o **gzip** de cada página do
`dist/` e reprova acima de 50 KB (SC-006). Medir sobre o build, e não estimar, é a única
forma honesta: uma dependência transitiva entra sem ninguém decidir, e o custo só aparece no
arquivo final.

A galeria `/componentes` fica fora da medição — é superfície de desenvolvimento.

## Progressive enhancement, na prática

A regra é uma só: **enriquecimento pode faltar, conteúdo e navegação não**.

| Recurso        | Sem JavaScript                   | Com JavaScript                          |
| -------------- | -------------------------------- | --------------------------------------- |
| Navegação      | `<a href>` reais                 | idem                                    |
| Busca          | `GET` nativo para `/busca?q=`    | filtra no cliente o HTML já entregue    |
| Paginação      | link para a página seguinte      | idem                                    |
| Newsletter     | `POST` HTML nativo               | idem                                    |
| Menu móvel     | `<details>`/`<summary>`          | fecha com `Esc` e ao clicar fora        |
| Abas do editor | `<input type="radio">` + CSS     | idem                                    |
| Tema           | acompanha `prefers-color-scheme` | alternador aparece e persiste a escolha |
| `Ctrl/Cmd+K`   | não existe                       | abre o índice de telas                  |

Os dois últimos são o limite aceitável: o alternador de tema é **entregue oculto** e revelado
por script — um controle que não faz nada é pior que a ausência dele. E o atalho de teclado é
caminho rápido para destinos que a navegação normal já oferece.

O projeto `no-js` do Playwright roda com o motor de script desligado e cobre a coluna do meio.

## Ilhas e scripts

Cada componente que precisa de comportamento traz o próprio `<script>` de módulo, importando
de um `.ts` ao lado. Nenhum script global, nenhum bundle compartilhado de comportamento — é o
que mantém o custo por página proporcional ao que a página realmente usa.

## Imagens

`PhotoFrame` é o único caminho. Ele emite `<picture>` com AVIF, alternativa WebP e o original,
sempre com `width`/`height` (que é de onde sai a reserva contra layout shift) e
`aspect-ratio` no CSS.

**O produto não tem banco de imagens** (Assumption 9): nenhuma matéria demonstrativa tem foto,
e o placeholder do DS é o caminho normal, não a exceção. Quem decide prioridade e `sizes` é a
página (`apps/web/src/lib/media.ts`), porque só ela sabe qual imagem está acima da dobra.

## Acessibilidade

axe-core em cada superfície, **nos dois temas**, zero violação WCAG 2.1 AA. Não há lista de
exceções: uma exceção aceita numa tela vira precedente para as outras 24.

O que axe não cobre entra como asserção explícita: o salto para o conteúdo é o primeiro alvo
de tabulação, o foco permanece visível nos dois temas, a hierarquia de títulos não pula nível
e todo botão só de ícone tem nome acessível.
