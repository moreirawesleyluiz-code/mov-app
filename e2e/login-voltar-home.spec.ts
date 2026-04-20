import { test, expect } from "@playwright/test";

test.describe("Login → Voltar → home (sem loop)", () => {
  test("Voltar leva a / limpo, sem voltar a /login", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/login?callbackUrl=/app");
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();

    await page.getByRole("button", { name: "Voltar para a página inicial" }).click();

    await expect(page).toHaveURL(/^http:\/\/[^/]+\/?$/);
    await expect(page).not.toHaveURL(/\/login/);

    // Estabilidade: não regressão automática para /login
    await page.waitForTimeout(1500);
    await expect(page).not.toHaveURL(/\/login/);

    const hydration = consoleErrors.filter((e) => /hydration|Hydration failed/i.test(e));
    expect(hydration, hydration.join("\n")).toEqual([]);
  });

  test("a partir de /login sem query, Voltar também chega a /", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Voltar para a página inicial" }).click();
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/?$/);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("clique no logótipo MOV leva a /", async ({ page }) => {
    await page.goto("/login?callbackUrl=/app");
    await page.getByRole("button", { name: "MOV — página inicial" }).click();
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/?$/);
    await expect(page).not.toHaveURL(/\/login/);
  });
});
