import { test, expect } from "@playwright/test";

test.describe("Landing pública / (sem redirect indevido para login)", () => {
  test("/ mostra onboarding sem ir para /login", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: "Começar" })).toBeVisible();
  });

  test("voltar de /login?callbackUrl=/app para / mantém landing (sem loop)", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/login?callbackUrl=/app");
    await page.getByRole("button", { name: "Voltar para a página inicial" }).click();
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/?$/);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: "Começar" })).toBeVisible();
  });

  test("/app sem sessão → /login com callback", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/app");
    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
    expect(page.url()).toContain("callbackUrl=%2Fapp");
  });
});
