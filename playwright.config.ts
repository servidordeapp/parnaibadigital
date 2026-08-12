import { defineConfig, devices } from "@playwright/test";

const WEB_PORT = 4321;
const ADMIN_PORT = 4322;

// D-19: três projetos cobrem as três exigências constitucionais que só um navegador prova —
// mobile-first (360px), desktop (1280px) e Princípio XI (a página serve sem JavaScript).
export default defineConfig({
  testDir: "./tests",
  testMatch: ["e2e/**/*.spec.ts", "a11y/**/*.spec.ts", "shots/**/*.spec.ts"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: `http://localhost:${String(WEB_PORT)}`,
    trace: "on-first-retry",
    // Sem rede de terceiro em teste (FR-038): nada de fonte, ícone ou anúncio remoto.
    bypassCSP: false,
  },

  // Quem roda o quê é decidido AQUI, por tag, e não por `test.skip` espalhado pelos arquivos.
  // A diferença é prática: um teste marcado `@no-js` que rodasse nos projetos com script
  // ativo passaria sem provar nada — e um `skip` condicional dentro do arquivo é fácil de
  // escrever errado e difícil de perceber, porque o resultado continua verde.
  projects: [
    {
      name: "chromium-360",
      grepInvert: /@no-js/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 360, height: 780 },
        isMobile: false,
        deviceScaleFactor: 2,
      },
    },
    {
      name: "chromium-1280",
      grepInvert: /@no-js/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
      },
    },
    {
      name: "no-js",
      grep: /@no-js/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
        javaScriptEnabled: false,
      },
    },
  ],

  webServer: [
    {
      command: "pnpm --filter @parnaibadigital/web preview",
      url: `http://localhost:${String(WEB_PORT)}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter @parnaibadigital/admin preview",
      url: `http://localhost:${String(ADMIN_PORT)}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
