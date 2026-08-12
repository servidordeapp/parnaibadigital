import type { Event } from "@parnaibadigital/types";

/**
 * T055 / FR-016 — os 6 eventos do protótipo.
 *
 * As datas são deslocadas a partir da construção, não cravadas em agosto de 2026. Uma
 * agenda com data fixa nasce vencida: a tela de eventos passaria a mostrar seis eventos
 * passados, o `ItemList` de `Event` no JSON-LD ficaria com `startDate` no passado e o
 * calendário destacaria dias que já foram. O deslocamento preserva o que o protótipo
 * comunica — uma agenda viva de fim de semana — sem exigir manutenção manual.
 *
 * `price.free` é campo, não texto: "Entrada gratuita" é apresentação, e a decisão de exibir
 * assim pertence à tela (Princípio VII — o componente formata, não decide).
 */

const BUILD_TIME = Date.now();
const DAY = 24 * 60 * 60 * 1000;

/** Data do evento a N dias da construção, no horário local informado pelo protótipo. */
function inDays(days: number, hour: number, minute = 0): string {
  const date = new Date(BUILD_TIME + days * DAY);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const events: readonly Event[] = Object.freeze([
  {
    id: "event-01",
    slug: "feira-do-porto-das-barcas",
    title: "Feira do Porto das Barcas",
    startsAt: inDays(2, 17),
    endsAt: inDays(2, 22),
    venue: "Porto das Barcas, Centro",
    municipalityIbgeCode: "2207702",
    neighborhoodId: "parnaiba:porto-das-barcas",
    categorySlug: "cultura",
    price: { free: true },
  },
  {
    id: "event-02",
    slug: "corrida-do-delta-5-km-e-10-km",
    title: "Corrida do Delta — 5 km e 10 km",
    startsAt: inDays(3, 6, 30),
    endsAt: inDays(3, 10),
    venue: "Av. Beira Rio",
    municipalityIbgeCode: "2207702",
    neighborhoodId: "parnaiba:centro",
    categorySlug: "cultura",
    price: { free: false, amount: 60 },
  },
  {
    id: "event-03",
    slug: "forro-da-praca-da-graca",
    title: "Forró da Praça da Graça",
    startsAt: inDays(3, 20),
    endsAt: inDays(3, 23, 30),
    venue: "Praça da Graça",
    municipalityIbgeCode: "2207702",
    neighborhoodId: "parnaiba:centro",
    categorySlug: "cultura",
    price: { free: true },
  },
  {
    id: "event-04",
    slug: "festival-gastronomico-do-litoral",
    title: "Festival Gastronômico do Litoral",
    startsAt: inDays(9, 18),
    endsAt: inDays(9, 23),
    venue: "Pedra do Sal, Luís Correia",
    municipalityIbgeCode: "2205805",
    neighborhoodId: "luis-correia:pedra-do-sal",
    categorySlug: "litoral",
    price: { free: false, amount: 25 },
  },
  {
    id: "event-05",
    slug: "passeio-guiado-pelo-delta",
    title: "Passeio guiado pelo Delta",
    startsAt: inDays(10, 8),
    endsAt: inDays(10, 13),
    venue: "Porto dos Tatus, Ilha Grande",
    municipalityIbgeCode: "2204550",
    neighborhoodId: "ilha-grande:porto-dos-tatus",
    categorySlug: "delta",
    price: { free: false, amount: 180 },
  },
  {
    id: "event-06",
    slug: "sarau-do-casarao",
    title: "Sarau do Casarão",
    startsAt: inDays(16, 19, 30),
    endsAt: inDays(16, 22, 30),
    venue: "Casa da Cultura, Centro",
    municipalityIbgeCode: "2207702",
    neighborhoodId: "parnaiba:centro",
    categorySlug: "cultura",
    price: { free: true },
  },
]);
