import { test, expect } from "@playwright/test";

const PASSWORD = "E2EQaHomePass123!";

function urlPathIsApp(url: URL): boolean {
  return url.pathname === "/app";
}

test.describe("Home real /app (sessão autenticada)", () => {
  test("registo, login, home estável, menu limpo, CTAs de produto", async ({ page, browser }) => {
    test.setTimeout(120_000);
    const email = `qa-home-${Date.now()}@mov-e2e.local`;

    const reg = await page.request.post("/api/register", {
      data: { name: "QA Home", email, password: PASSWORD },
    });
    expect(reg.ok(), await reg.text()).toBeTruthy();

    await page.goto("/login?callbackUrl=/app");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill(PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL(urlPathIsApp);
    await expect(page).toHaveURL(/\/app$/);

    // Home — client boundary estável (sem crash de chunk)
    await expect(page.getByRole("heading", { name: /Olá/ })).toBeVisible();
    await expect(page.getByText("App MOV").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Speed Dating", exact: true })).toBeVisible();

    // Experiências não é aba principal (nenhum link com esse nome na UI)
    await expect(page.getByRole("link", { name: "Experiências" })).toHaveCount(0);

    // Itens internos não aparecem no menu visível
    await expect(page.getByRole("link", { name: "Perfil MOV" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Sua jornada" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Validação" })).toHaveCount(0);

    // Sem CTAs de destaque para rotas internas na home
    await expect(page.getByRole("link", { name: /Perfil MOV/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /jornada completa|minha jornada/i })).toHaveCount(0);

    await expect(page.getByText("Pós-onboarding")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Começar" })).toHaveCount(0);

    // Entrada Speed Dating a partir da home (não há aba Experiências no menu)
    await page.getByRole("link", { name: "Speed Dating" }).first().click();
    await expect(page).toHaveURL(/\/app\/experiencias$/);
    await expect(page.getByRole("heading", { level: 1, name: /^Speed Dating$/ })).toBeVisible();

    await page.goto("/app");
    await page.getByRole("link", { name: "Comunidade" }).first().click();
    await expect(page).toHaveURL(/\/app\/comunidade$/);
    await expect(page.getByRole("heading", { level: 1, name: /A comunidade MOV/ })).toBeVisible();

    await page.goto("/app");
    await page.getByRole("link", { name: "Conta" }).first().click();
    await expect(page).toHaveURL(/\/app\/conta$/);

    // Mobile: home legível, sem erro
    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const mPage = await mobile.newPage();
    await mPage.goto("/login?callbackUrl=/app");
    await mPage.getByLabel("E-mail").fill(email);
    await mPage.getByLabel("Senha").fill(PASSWORD);
    await mPage.getByRole("button", { name: "Entrar" }).click();
    await mPage.waitForURL(urlPathIsApp);
    await expect(mPage.getByRole("heading", { name: /Olá/ })).toBeVisible();
    await expect(
      mPage.getByRole("heading", { name: "Speed Dating", exact: true }),
    ).toBeVisible();
    const heroBox = await mPage.getByRole("heading", { name: /Olá/ }).boundingBox();
    expect(heroBox && heroBox.width).toBeLessThanOrEqual(390);
    await mobile.close();
  });
});
