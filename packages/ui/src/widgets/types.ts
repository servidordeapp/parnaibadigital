/**
 * Formas de dado dos widgets de serviço.
 *
 * `PharmacyOnDuty` não vem de `@parnaibadigital/types` porque o contrato desta fase não
 * publica entidade de farmácia — ver a explicação em `PharmacyList.astro`.
 */

export interface PharmacyOnDuty {
  name: string;
  address: string;
  hours: string;
  phone?: string | undefined;
}
