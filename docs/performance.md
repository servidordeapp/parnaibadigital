# Performance

**Feature**: 001-fundacao-prototipo-monorepo · Princípio I

O contexto define os números: **rede móvel regional, 4G, dispositivo médio**. Não é um site
que precisa ser rápido em fibra de escritório.

## Orçamentos

| Métrica                      | Orçamento                | Onde é medido                            |
| ---------------------------- | ------------------------ | ---------------------------------------- |
| Lighthouse (4 categorias)    | ≥ 95                     | `lighthouserc.json`, móvel + 4G          |
| LCP                          | < 2,0 s                  | Lighthouse CI                            |
| CLS                          | < 0,05                   | Lighthouse CI                            |
| INP                          | < 200 ms                 | campo (RUM); em CI, por **TBT < 200 ms** |
| TTFB                         | < 200 ms em hit de borda | produção                                 |
| **JS comprimido por página** | **≤ 50 KB**              | `check-js-budget.ts`, sobre o `dist/`    |

> **Sobre o INP**: ele é métrica **de campo** — depende de interação real do usuário e não
> existe em execução de laboratório. O Lighthouse CI cobra o _Total Blocking Time_, que é o
> substituto de laboratório aceito: TBT alto é a causa mais comum de INP ruim. O número de
> campo entra com o RUM, junto do primeiro deploy (ver "Pendência registrada" abaixo).

Estado hoje: a página mais pesada entrega **2,1 KB gz** de JavaScript.

## Como medir

```bash
pnpm build          # inclui o portão de orçamento de JS
pnpm test:perf      # Lighthouse CI sobre o build estático
```

O orçamento de JS mede o **gzip**, porque é o que trafega. Comparar bytes crus faria o portão
reprovar entregas que na rede cabem folgadas — e um portão que erra para o lado errado acaba
desativado.

O Lighthouse roda sobre **14 superfícies representativas** — uma de cada arquétipo de layout
público —, três execuções por URL, e o valor considerado é a mediana. Rodar as 62 páginas
construídas custaria dezenas de minutos para medir os mesmos quatro ou cinco layouts.

Quatro auditorias são desligadas em `lighthouserc.json`, e o motivo é sempre o mesmo — elas
medem o **servidor de teste**, não o produto:

| Auditoria desligada | Por quê                                                                                                              | Quem cobre de verdade            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `uses-http2`        | o servidor estático local do LHCI é HTTP/1.1; a borda de produção é HTTP/2                                           | configuração de borda            |
| `canonical`         | a canônica é absoluta e aponta para `parnaibadigital.com.br`; em `localhost` isso parece "canônica de outro domínio" | `tests/seo/public-pages.test.ts` |
| `is-crawlable`      | `/busca` é `noindex` **de propósito** (FR-028)                                                                       | `tests/seo/public-pages.test.ts` |
| `redirects-http`    | não há redirecionamento a testar num diretório estático                                                              | configuração de borda            |

Desligar auditoria em portão é sempre suspeito — por isso cada linha acima nomeia quem
verifica a mesma propriedade em outro lugar. Nenhuma delas fica sem cobertura.

## O que reprova a construção

- Qualquer página acima de 50 KB gz de JavaScript.
- Ativo referenciado no HTML e ausente do `dist/`.
- Lighthouse abaixo de qualquer um dos orçamentos, quando `pnpm test:perf` roda em CI.

## As decisões que produzem esses números

1. **Saída estática** (D-02). Sem renderização por requisição.
2. **Zero framework de UI no cliente** (D-05). Componentes renderizam no servidor; as
   interações são TypeScript puro, por componente.
3. **Fontes auto-hospedadas e subsetadas** (D-08). O DS carregava do Google Fonts por
   `@import`, o que encadeia duas idas à rede antes da primeira letra. Aqui são `@font-face`
   locais, só `latin` e `latin-ext`, com `font-display: swap`.
4. **Ícones inlinados em build** (D-09). O SVG é lido do disco e escrito no HTML — nenhuma
   requisição, e o botão de ícone nunca fica sem rótulo por falha de CDN.
5. **Altura de anúncio vinda de token** (D-21, FR-032). É o que mantém o layout parado antes
   de qualquer carga — a origem mais comum de CLS num portal.
6. **`aspect-ratio` em toda imagem e no hero.** A caixa é reservada no primeiro cálculo de
   layout, não quando o byte chega.
7. **`fetchpriority="high"` só no LCP.** Marcar tudo como prioritário equivale a não marcar
   nada: o navegador perde a informação de qual imagem importa.

## Pendência registrada

Coleta de Core Web Vitals **de campo** (RUM) não existe nesta fase — não há runtime de
servidor nem produção. Ela entra com o primeiro deploy, junto dos logs estruturados, e deve
ser exigida no Constitution Check daquela feature (Princípio X).
