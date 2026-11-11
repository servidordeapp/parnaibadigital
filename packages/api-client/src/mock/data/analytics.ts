import type { AnalyticsMetric } from "@parnaibadigital/types";

/**
 * T093 / FR-016 — as métricas do Dashboard e do Analytics do protótipo.
 *
 * `value` e `delta` chegam **já formatados em pt-BR**, e isso é deliberado: são números de
 * origens diferentes (audiência, receita, fila editorial) que nunca serão somados nem
 * comparados entre si. Guardá-los como número obrigaria cada tela a saber a unidade e o
 * arredondamento de cada um — decisão que pertence a quem produziu a métrica.
 *
 * Nenhum dado é real e nenhuma integração existe (FR-038): Analytics, AdSense e SMTP
 * aparecem como painéis reproduzidos, não conectados.
 */
export const analyticsMetrics: readonly AnalyticsMetric[] = Object.freeze([
  {
    key: "sessoes",
    label: "Sessões",
    value: "148,2 mil",
    delta: "+12,4%",
    period: "últimos 30 dias",
  },
  {
    key: "leitores",
    label: "Leitores únicos",
    value: "96,7 mil",
    delta: "+9,1%",
    period: "últimos 30 dias",
  },
  {
    key: "paginas-sessao",
    label: "Páginas por sessão",
    value: "2,4",
    delta: "+0,3",
    period: "últimos 30 dias",
  },
  {
    key: "tempo-medio",
    label: "Tempo médio na página",
    value: "1m 52s",
    delta: "+11s",
    period: "últimos 30 dias",
  },
  {
    key: "newsletter",
    label: "Inscritos na newsletter",
    value: "18,4 mil",
    delta: "+1,2 mil",
    period: "últimos 30 dias",
  },
  {
    key: "abertura",
    label: "Abertura da newsletter",
    value: "58%",
    delta: "+3 p.p.",
    period: "últimos 30 dias",
  },
  {
    key: "receita",
    label: "Receita publicitária",
    value: "R$ 18.940",
    delta: "+22%",
    period: "agosto",
  },
  {
    key: "preenchimento",
    label: "Preenchimento de slots",
    value: "91%",
    delta: "+4 p.p.",
    period: "agosto",
  },
]);

/** Fila editorial do dia — os contadores que o Dashboard exibe no topo. */
export const editorialQueue: readonly AnalyticsMetric[] = Object.freeze([
  { key: "documentos-hoje", label: "Documentos hoje", value: "9", delta: "+2", period: "hoje" },
  {
    key: "aguardando-revisao",
    label: "Aguardando revisão",
    value: "4",
    delta: "+1",
    period: "hoje",
  },
  { key: "publicados", label: "Publicados", value: "3", delta: "0", period: "hoje" },
  {
    key: "tempo-doc",
    label: "Tempo médio por documento",
    value: "1m 48s",
    delta: "-12s",
    period: "hoje",
  },
]);
