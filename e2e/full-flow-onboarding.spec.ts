import { test, expect, type Page } from "@playwright/test";

const PASSWORD = "E2EFlowPass123!";

function urlPathIsApp(url: URL): boolean {
  return url.pathname === "/app";
}

async function clickFirstQuestionOption(page: Page) {
  await page.locator("div.mt-9.flex.flex-col.gap-3 button").first().click();
}

/**
 * Fluxo completo: / → onboarding (localização → perguntas → 96% → identidade → 82% → auth) → registo → /app → perfil + compatibilidade.
 */
test.describe("QA fluxo ponta a ponta", () => {
  test("onboarding completo até /app, perfil e compatibilidade", async ({ page }) => {
    test.setTimeout(360_000);

    await page.addInitScript(() => {
      try {
        localStorage.removeItem("mov_onboarding_state_v4");
      } catch {
        /* ignore */
      }
    });

    const email = `qa-flow-${Date.now()}@mov-e2e.local`;

    await page.goto("/", { waitUntil: "load" });
    await page.evaluate(() => {
      try {
        localStorage.removeItem("mov_onboarding_state_v4");
      } catch {
        /* ignore */
      }
    });
    await page.reload({ waitUntil: "load" });

    const comecar = page.getByRole("button", { name: "Começar" });
    await expect(comecar).toBeVisible({ timeout: 30_000 });
    /** Após hidratação o botão deixa `disabled` (evita clique antes do React). */
    await expect(comecar).toBeEnabled({ timeout: 60_000 });
    await comecar.click();

    await expect(page.getByRole("button", { name: "Mudar minha cidade" })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole("button", { name: "Continuar" }).click();

    for (let i = 0; i < 6; i++) {
      await clickFirstQuestionOption(page);
    }

    /** Escalas de personalidade: 15 itens (1–10) em `onboarding-config` antes do intersticial 96%. */
    for (let i = 0; i < 15; i++) {
      await page.getByRole("button", { name: "5", exact: true }).click();
    }

    await page.getByRole("button", { name: "Próximo" }).click();

    await clickFirstQuestionOption(page);

    await clickFirstQuestionOption(page);

    await page.getByText("Toque para buscar e selecionar").click();
    await page.getByRole("button", { name: /Brasil/ }).click();
    await page.getByRole("button", { name: "Confirmar" }).click();

    await page.locator('input[type="date"]').fill("1990-06-15");
    await page.getByRole("button", { name: "Confirmar" }).click();

    await clickFirstQuestionOption(page);

    await clickFirstQuestionOption(page);

    await page.getByRole("button", { name: "Continuar" }).click();

    await page.getByRole("link", { name: /Cadastre-se com e-mail/ }).click();

    await expect(page).toHaveURL(/\/register$/);

    await page.getByLabel("Nome").fill("QA Fluxo");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel(/Senha/).fill(PASSWORD);
    await page.getByRole("button", { name: "Criar conta" }).click();

    await page.waitForURL(urlPathIsApp, { timeout: 60_000 });
    await expect(page).toHaveURL(/\/app$/);

    await expect(page.getByRole("heading", { name: /Olá/ })).toBeVisible({ timeout: 15_000 });

    await page.goto("/app/perfil-mov");
    await expect(page.getByText("Perfil MOV").first()).toBeVisible();

    await page.goto("/app/compatibilidade");
    await expect(page.getByRole("heading", { name: "Compatibilidade e mesa" })).toBeVisible();
  });
});
