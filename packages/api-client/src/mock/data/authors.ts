import type { Author } from "@parnaibadigital/types";

/**
 * T054 / FR-016 — os autores do protótipo.
 *
 * "Redação ParnaíbaDigital" existe por exigência editorial, não por simetria de dados: o
 * Princípio V não admite matéria sem responsável nomeado, e o material que nasce de
 * curadoria automatizada precisa de uma assinatura institucional para não ser atribuído a
 * uma pessoa que não escreveu aquilo. Sem essa entrada, ou a matéria curada ficaria sem
 * autor — quebrando `NewsArticle` e a página de autor — ou receberia um repórter
 * arbitrário, que é pior.
 *
 * `articleCount` é o total exibido na página de autor. Fica em zero aqui e é calculado a
 * partir das matérias na hora de renderizar: um número escrito à mão diverge do conteúdo
 * no primeiro artigo acrescentado e passa a mentir em silêncio.
 */
export const authors: readonly Author[] = Object.freeze([
  {
    slug: "marina-sousa",
    name: "Marina Sousa",
    bio: "Jornalista formada pela UFPI, cobre trânsito, obras e serviços públicos no litoral do Piauí desde 2018. Responsável pela revisão editorial dos resumos do Diário Oficial de Parnaíba.",
    articleCount: 0,
  },
  {
    slug: "rafael-coelho",
    name: "Rafael Coelho",
    bio: "Repórter de mobilidade e economia local. Acompanha obras urbanas, transporte e o comércio de Parnaíba e Luís Correia.",
    articleCount: 0,
  },
  {
    slug: "ana-beatriz-melo",
    name: "Ana Beatriz Melo",
    bio: "Cobre meio ambiente, Delta do Parnaíba e cultura popular do litoral. Acompanha o monitoramento do peixe-boi em Cajueiro da Praia desde 2021.",
    articleCount: 0,
  },
  {
    slug: "redacao-parnaibadigital",
    name: "Redação ParnaíbaDigital",
    bio: "Assinatura institucional das matérias produzidas a partir da curadoria de fontes oficiais. Todo texto assistido por automação passa por revisão humana antes de ser publicado.",
    articleCount: 0,
  },
]);
