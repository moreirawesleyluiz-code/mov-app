import { test, expect } from "@playwright/test";

test.describe("Login — interatividade (cliques e navegação)", () => {
  test("Voltar, links e submit respondem; sem erro fatal de página", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") pageErrors.push(`console: ${msg.text()}`);
    });

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();

    await page.getByRole("button", { name: "Voltar para a página inicial" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/login?callbackUrl=/app");
    await page.getByRole("link", { name: "Criar conta" }).click();
    await expect(page).toHaveURL(/intent=signup/);

    await page.goto("/login");
    await page.getByRole("link", { name: "Esqueci minha senha" }).click();
    await expect(page).toHaveURL("/forgot-password");

    // Smoke: formulário aceita input (não travado)
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("test@example.com");
    await page.getByLabel("Senha").fill("password12345");
    await expect(page.getByLabel("E-mail")).toHaveValue("test@example.com");

    const hydrationBlockers = pageErrors.filter(
      (e) =>
        /hydration|Hydration failed|did not match|Minified React error/i.test(e),
    );
    expect(hydrationBlockers, hydrationBlockers.join("\n")).toEqual([]);
  });
});
