/**
 * D-09 — vocabulário fechado de ícones.
 *
 * O `readme.md` do DS não diz "use Lucide": diz *quais* glifos de Lucide o produto usa, e
 * proíbe SVG desenhado à mão, emoji e caractere unicode no lugar de ícone. Uma lista solta
 * em documentação vira sugestão; aqui ela é um tipo, então um nome fora do vocabulário
 * reprova a checagem de tipos antes de virar interface.
 *
 * Para acrescentar um glifo: o pedido volta ao Design System, não a este arquivo.
 */

/** Os ~20 glifos declarados pelo `readme.md` do DS, agrupados pelo papel que exercem. */
export const ICON_VOCABULARY = {
  /* Geolocalização — a assinatura visual do produto */
  "map-pin": "Bairro, localização de um item",
  "map-pinned": "Bairro em destaque, bloco geolocalizado",

  /* Transparência da automação (FR-018, Princípio V) */
  sparkles: "Curadoria Inteligente",
  "badge-check": "Revisão humana",
  "refresh-cw": "Dado automatizado, atualizado há X min",

  /* Serviço e utilidade pública */
  "calendar-days": "Data e eventos",
  pill: "Farmácia de plantão",
  briefcase: "Vagas de emprego",
  phone: "Telefone útil",
  "life-buoy": "Utilidade pública, emergência",

  /* Clima */
  sun: "Tempo bom",
  "cloud-rain": "Chuva",

  /* Origem e contato */
  "link-2": "Fonte original",
  "message-circle": "WhatsApp",
  "external-link": "Destino fora do portal",

  /* Navegação e chrome */
  search: "Busca",
  menu: "Navegação móvel",
  "chevron-right": "Avançar, trilha de navegação",
  "arrow-right": "Ver todas, seguir para a listagem",

  /* Mídia */
  image: "Placeholder de foto",
} as const satisfies Record<string, string>;

/** Nome de ícone aceito por `Icon.astro`. Qualquer outro não compila. */
export type IconName = keyof typeof ICON_VOCABULARY;

/** Lista ordenada — consumida pela galeria de componentes (T111). */
export const ICON_NAMES = Object.keys(ICON_VOCABULARY) as IconName[];

/** Tamanhos do DS: 12–14px em linha mono/meta, 16–18px em UI, 20–22px no chrome do header. */
export const ICON_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export type IconSize = (typeof ICON_SIZES)[number];

export function isIconName(value: string): value is IconName {
  return Object.hasOwn(ICON_VOCABULARY, value);
}
