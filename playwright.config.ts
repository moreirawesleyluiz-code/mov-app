import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig, devices } from "@playwright/test";

function envFromDotEnv(name: string): string | undefined {
  const p = resolve(process.cwd(), ".env");
  if (!existsSync(p)) return undefined;
  try {
    const raw = readFileSync(p, "utf8");
    const line = raw.split("\n").find((l) => l.startsWith(`${name}=`));
    if (!line) return undefined;
    const v = line.slice(name.length + 1).trim();
    return v.replace(/^"(.*)"$/, "$1");
  } catch {
    return undefined;
  }
}

/**
 * Mesma origem que o browser manual: env shell, PLAYWRIGHT_BASE_URL, NEXT_PUBLIC_APP_URL no .env, senão 127.0.0.1.
 * Evita “testes passam / uso real falha” por cookies só num dos hosts (localhost vs 127.0.0.1).
 */
const devOrigin =
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  envFromDotEnv("NEXT_PUBLIC_APP_URL") ||
  "http://127.0.0.1:3456";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: devOrigin,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: devOrigin,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || devOrigin,
      AUTH_URL: process.env.AUTH_URL || devOrigin,
    },
  },
});
