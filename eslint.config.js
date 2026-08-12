// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

// Um linter por linguagem (Princípio XII / D-18): ESLint cobre TS e .astro; CSS fica com Stylelint.
export default tseslint.config(
  {
    // O Design System importado é byte-idêntico (FR-001) — nunca é lintado nem corrigido.
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.astro/**",
      "backend/**",
      "packages/design-system/vendor/**",
      "packages/types/src/generated/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      // FR-026: o frontend formata, não decide — nada de tipo escapado silenciosamente.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Princípio XI: destino de navegação é sempre <a href> resolvível.
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='location'][callee.property.name='assign']",
          message:
            "Princípio XI: navegação deve ser <a href> real, não redirecionamento por script.",
        },
      ],
    },
  },

  ...astro.configs.recommended,
  ...astro.configs["jsx-a11y-strict"],

  {
    files: ["**/*.astro"],
    plugins: { "jsx-a11y": jsxA11y },
    rules: {
      // Componentes .astro renderizam no servidor; a checagem de tipos fica com `astro check`.
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",

      // `role="region"` entra na lista de papéis que podem receber `tabindex`.
      // Motivo concreto: a regra `scrollable-region-focusable` do axe EXIGE que uma região
      // com rolagem seja focável, senão o conteúdo que transbordou fica inalcançável por
      // teclado — é o caso da tabela do painel. Sem esta linha, as duas verificações se
      // contradizem e uma delas teria de ser silenciada caso a caso, que é como uma regra
      // de acessibilidade vira ruído e acaba desligada inteira.
      "astro/jsx-a11y/no-noninteractive-tabindex": [
        "error",
        { tags: [], roles: ["tabpanel", "region"], allowExpressionValues: true },
      ],
    },
  },

  {
    // Ferramentas de build, não código entregue. Elas fazem varredura de texto e trabalho
    // com regex, onde o invariante é local e visível na linha de cima — e onde `console`
    // é a interface com quem roda o portão.
    files: ["**/*.config.{js,mjs,ts}", "scripts/**/*.ts", "**/scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      // `tseslint.config()` está marcado como deprecado em favor de `defineConfig()` do
      // core, mas ele é quem dá a tipagem do array de configuração aqui.
      "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "no-console": "off",
    },
  },

  {
    files: ["**/tests/**/*.ts", "**/*.spec.ts", "**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
);
