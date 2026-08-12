/**
 * FR-016 — dados demonstrativos do protótipo.
 *
 * Ponto único de agregação: o transporte `mock` lê daqui, e `validate:mocks` valida daqui
 * contra os schemas e as 7 regras transversais. Todo conteúdo vem do protótipo aprovado
 * (`vendor/prototype/ParnaibaDigital.dc.html`), que é a fonte de verdade — nada aqui é
 * conteúdo novo inventado para preencher tela.
 *
 * Cada coleção mora no próprio arquivo porque são editadas por motivos diferentes e em
 * momentos diferentes: um artigo novo não toca a lista de bairros, e um bairro novo não
 * deveria obrigar a reabrir o arquivo de notícias.
 */

export { analyticsMetrics, editorialQueue } from "./analytics";
export { authors } from "./authors";
export { categories } from "./categories";
export { companies } from "./companies";
export { events } from "./events";
export { gazette } from "./gazette";
export { neighborhoods } from "./geo";
export { news } from "./news";
export { pipelineStages } from "./pipeline";
export { users } from "./users";
export { utilities } from "./utilities";
