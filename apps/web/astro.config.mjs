// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// D-02: saída estática por padrão — Princípio I. Nenhuma rota desta fase precisa de servidor.
// D-04: Tailwind 4 entra pelo plugin Vite; a configuração é CSS-first em
// packages/design-system/src/index.css, que *referencia* os tokens do DS por @theme inline.
export default defineConfig({
  site: "https://parnaibadigital.com.br",
  output: "static",
  trailingSlash: "never",
  build: {
    format: "directory",
    inlineStylesheets: "auto",
  },
  image: {
    // Princípio I: AVIF com alternativa WebP; dimensões explícitas vêm de MediaRef.
    responsiveStyles: true,
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  vite: {
    // `@tailwindcss/vite` e o Vite embutido no Astro trazem cópias diferentes do tipo
    // `Plugin`; a incompatibilidade é só nominal — o plugin funciona. Suprimido aqui em
    // vez de fixar versão de Vite à mão, que acoplaria o build a um detalhe interno.
    // @ts-expect-error -- divergência nominal de tipo entre as duas cópias de Vite
    plugins: [tailwindcss()],
  },
});
