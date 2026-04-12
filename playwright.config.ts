import { defineConfig, devices } from "@playwright/test";

/**
 * QA da home /app (sessão real). Executar com o dev server em 3456 ou deixar o Playwright subir.
 * NEXTAUTH_URL alinhado à mesma origem evita falhas de cookie em dev.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3456",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3456",
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXTAUTH_URL: "http://127.0.0.1:3456",
    },
  },
});
