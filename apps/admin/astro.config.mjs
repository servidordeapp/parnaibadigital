// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// D-03: mesma stack do portal — é o que torna packages/ui a definição única (SC-012).
// Nenhuma superfície é indexável: robots.txt próprio com Disallow: / e noindex no AdminLayout.
export default defineConfig({
  site: "https://admin.parnaibadigital.com.br",
  output: "static",
  trailingSlash: "never",
  server: { port: 4322 },
  build: {
    format: "directory",
    inlineStylesheets: "auto",
  },
  vite: {
    // `@tailwindcss/vite` e o Vite embutido no Astro trazem cópias diferentes do tipo
    // `Plugin`; a incompatibilidade é só nominal — o plugin funciona. Suprimido aqui em
    // vez de fixar versão de Vite à mão, que acoplaria o build a um detalhe interno.
    // @ts-expect-error -- divergência nominal de tipo entre as duas cópias de Vite
    plugins: [tailwindcss()],
  },
});
