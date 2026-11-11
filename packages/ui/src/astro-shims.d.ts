/**
 * `packages/ui` publica componentes `.astro` mas não é uma aplicação Astro: não tem
 * `astro.config`, e portanto não tem o `.astro/types.d.ts` que a CLI gera. Sem esta
 * declaração, o barril de `src/index.ts` não compilaria aqui — ainda que compile
 * perfeitamente nas duas aplicações que o consomem.
 *
 * A checagem de tipos REAL dos componentes (props, slots, atributos) acontece via
 * `astro check` em `apps/web` e `apps/admin`, que é onde eles são de fato instanciados.
 * Este arquivo só ensina ao `tsc` local que o módulo existe.
 */
declare module "*.astro" {
  const Component: (props: Record<string, unknown>) => unknown;
  export default Component;
}
