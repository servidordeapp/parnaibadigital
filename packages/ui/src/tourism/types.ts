/**
 * Tipos de apresentação do grupo `tourism`.
 *
 * Estão aqui, e não em `packages/types`, por uma razão de fronteira: `packages/types` é
 * **gerado** do `openapi-v1.yaml` (D-10), e hospedagem e destino turístico não são recursos
 * do contrato desta fase. Escrevê-los lá à mão criaria tipo de domínio sem contrato — a
 * inversão exata que o Princípio VII proíbe.
 *
 * Quando o contrato publicar `Lodging` e `Destination`, estes tipos somem e os componentes
 * passam a importar de `@parnaibadigital/types` sem mudar de forma.
 */

export interface Lodging {
  name: string;
  href: string;
  /** "Pousada", "Hotel", "Chalé" — categoria como o guia a exibe. */
  kind: string;
  /** "Porto das Barcas, Parnaíba". */
  place: string;
  rating: number;
  reviewCount: number;
  /** Diária já formatada em reais pela tela (FR-026). */
  priceLabel: string;
}

export interface Destination {
  name: string;
  href: string;
  kind: string;
  place: string;
  /** "40 min de barco a partir do Porto dos Tatus" — a informação prática de deslocamento. */
  travelLabel: string;
}
