import { test, expect } from "@playwright/test";

test.describe("Login utilizador dev → /app", () => {
  test("credenciais válidas entram na área autenticada", async ({ page }) => {
    const email = `qa-login-${Date.now()}@mov-e2e.local`;
    const password = "E2ELoginPass123!";
    const ensure = await page.request.post("/api/register", {
      data: { name: "E2E Seed", email, password },
    });
    expect(ensure.ok(), await ensure.text()).toBeTruthy();

    await page.goto("/login?callbackUrl=/app");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.waitForURL(/\/app(\/|$)/, { timeout: 25_000 });
    await expect(page).toHaveURL(/\/app/);
    await expect(page.getByRole("heading", { name: /Olá/ })).toBeVisible({ timeout: 15_000 });
  });
});
