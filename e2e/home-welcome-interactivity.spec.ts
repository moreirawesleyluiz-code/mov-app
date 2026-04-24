import { test, expect } from "@playwright/test";

test.describe("Home — botão Começar e link para login", () => {
  test("Começar inicia o fluxo (Localização); Eu já tenho conta vai ao login", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.getByRole("button", { name: "Começar" }).click();
    await expect(page.getByRole("button", { name: "Mudar minha cidade" })).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/");
    await page.getByRole("link", { name: "Eu já tenho uma conta" }).click();
    await expect(page).toHaveURL(/\/entrar/);
    await page.getByRole("link", { name: "Continuar com e-mail" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
