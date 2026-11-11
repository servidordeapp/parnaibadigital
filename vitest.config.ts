import { defineConfig } from "vitest/config";

// D-19: Vitest cobre contrato, registro de slugs, validação de mocks e as asserções de SEO
// sobre o dist/. Comportamento de navegador é do Playwright — não há jsdom aqui.
export default defineConfig({
  test: {
    environment: "node",
    projects: [
      {
        test: {
          name: "design-system",
          root: "./packages/design-system",
          include: ["tests/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "types",
          root: "./packages/types",
          include: ["tests/**/*.test.ts"],
          testTimeout: 60_000, // regenera os tipos do OpenAPI dentro do teste
        },
      },
      {
        test: {
          name: "validation",
          root: "./packages/validation",
          include: ["tests/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "api-client",
          root: "./packages/api-client",
          include: ["tests/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "ui",
          root: "./packages/ui",
          include: ["tests/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "scripts",
          root: "./scripts",
          include: ["tests/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "seo",
          root: "./tests/seo",
          include: ["**/*.test.ts"],
        },
      },
      {
        test: {
          name: "docs",
          root: "./tests/docs",
          include: ["**/*.test.ts"],
        },
      },
    ],
  },
});
