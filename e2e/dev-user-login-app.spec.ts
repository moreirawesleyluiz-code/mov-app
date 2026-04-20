import { readFileSync } from "fs";
import { resolve } from "path";
import { test, expect } from "@playwright/test";

function loadEnvVar(name: string): string | undefined {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    const line = raw.split("\n").find((l) => l.startsWith(`${name}=`));
    if (!line) return undefined;
    const v = line.slice(name.length + 1).trim();
    return v.replace(/^"(.*)"$/, "$1");
  } catch {
    return undefined;
  }
}

test.describe("Login utilizador dev → /app", () => {
  test("credenciais seed entram na área autenticada", async ({ page }) => {
    const email = loadEnvVar("DEV_SEED_EMAIL") ?? "user@mov.local";
    const password = loadEnvVar("DEV_SEED_PASSWORD") ?? "movdev123";

    await page.goto("/login?callbackUrl=/app");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.waitForURL(/\/app(\/|$)/, { timeout: 25_000 });
    await expect(page).toHaveURL(/\/app/);
    await expect(page.getByText(/Olá|App MOV/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
