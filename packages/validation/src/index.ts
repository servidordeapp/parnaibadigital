/**
 * D-11 — validação de build/servidor, nunca de cliente.
 *
 * Zod não é entregue ao navegador: os dados demonstrativos são validados quando o site é
 * construído (`pnpm validate:mocks`), e o resultado é HTML estático já conferido. Importar
 * este pacote de dentro de uma ilha de cliente é erro de camada — o orçamento de 50 KB de
 * JS por página (SC-006) não comporta um validador que não precisa estar lá.
 */
export * from "./schemas";
export {
  assertDatasetIsValid,
  DatasetValidationError,
  validateDataset,
  type Dataset,
  type RuleViolation,
} from "./rules";
