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

test.describe("login não deve ir para /api/auth/error", () => {
  test.use({ baseURL: "http://127.0.0.1:3456" });

  test("credenciais seed: URL final não contém /api/auth/error", async ({ page }) => {
    const email = loadEnvVar("ADMIN_SEED_EMAIL");
    const password = loadEnvVar("ADMIN_SEED_PASSWORD");
    test.skip(!email || !password, "ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD em .env");

    await page.goto("/login");
    await page.locator("#login-email").fill(email!);
    await page.locator("#login-password").fill(password!);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL(/\/admin|\/app|\/login/, { timeout: 15_000 }).catch(() => {});
    const url = page.url();
    expect(url, url).not.toContain("/api/auth/error");
  });
});
