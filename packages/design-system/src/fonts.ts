/**
 * D-08 / SC-005 — as faces que precisam chegar **antes** da primeira pintura.
 *
 * Auto-hospedar as fontes (T019) tirou o terceiro do caminho crítico, mas não resolveu o
 * deslocamento: com `font-display: swap`, o navegador pinta na fonte de recurso, recebe a
 * face real e reflui. O Lighthouse mediu exatamente isso — `main#conteudo` deslocando com
 * causa "Web font loaded", CLS ≈ 0,089 em praticamente toda superfície, contra um orçamento
 * de 0,05.
 *
 * A correção é anunciar as faces como `preload` no `<head>`, para que sejam buscadas junto
 * com o CSS em vez de depois dele. `swap` continua valendo: é a rede que deixa de chegar
 * tarde, não o comportamento de exibição que muda.
 *
 * Só os subconjuntos `latin` entram. `latin-ext` cobre glifos que aparecem raramente e
 * pré-carregá-lo gastaria banda do caminho crítico para caracteres que a maioria das
 * páginas não usa — trocaria um orçamento por outro.
 *
 * Os caminhos são resolvidos por Vite (`?url`), então acompanham o hash do arquivo
 * publicado; escrever a URL à mão quebraria na primeira reconstrução.
 */

import archivo from "@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2?url";
import monoRegular from "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2?url";
import monoMedium from "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2?url";
import monoSemiBold from "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2?url";
import sourceSans from "@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2?url";

/** Ordem de declaração = ordem de descoberta pelo navegador: corpo e títulos primeiro. */
export const PRELOADED_FONTS: readonly string[] = [
  sourceSans,
  archivo,
  monoRegular,
  monoMedium,
  monoSemiBold,
];
