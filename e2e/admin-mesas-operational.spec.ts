import { test, expect } from "@playwright/test";

/**
 * Credenciais: definir E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD no ambiente (recomendado).
 * Fallback alinhado a contas locais comuns; falha de login indica env incorrecto.
 */
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "moreira.wesleyluz@gmail.com";
const ADMIN_PASS = process.env.E2E_ADMIN_PASSWORD ?? "mov-local-test-1";

async function loginAdmin(page: import("@playwright/test").Page) {
  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await page.locator("#admin-email").fill(ADMIN_EMAIL);
  await page.locator("#admin-password").fill(ADMIN_PASS);
  await page.getByRole("button", { name: /Entrar no painel/i }).click();
  await page.waitForURL(/\/admin\/?$/, { timeout: 60_000 });
}

test.describe("Admin operacional — mesas e parceiros", () => {
  test.beforeEach(({ page }) => {
    page.on("dialog", (d) => d.accept());
  });

  test("login admin → montagem: cabeçalho, filtros, sugestão automática", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAdmin(page);

    await page.goto("/admin/montagem", { waitUntil: "networkidle" });
    await expect(page.getByTestId("admin-montagem-heading")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Montagem de mesas" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Aplicar filtros/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Sugestão automática/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sugerir mesas \(não alocados\)/i })).toBeVisible();
    await expect(page.getByText(/(Máximo|Até) .* pessoas por mesa/i)).toBeVisible();
  });

  test("login admin → mesas: cabeçalho operacional (sem bloco de curadoria)", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAdmin(page);

    await page.goto("/admin/mesas", { waitUntil: "networkidle" });
    await expect(page.getByTestId("admin-mesas-heading")).toHaveText("Mesas");
    await expect(page.getByRole("heading", { name: /Sugestão automática/i })).toHaveCount(0);
  });

  test("mesas: select de evento para sugestão por evento (se houver eventos)", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAdmin(page);
    await page.goto("/admin/montagem", { waitUntil: "networkidle" });

    const eventSelect = page.locator("select").filter({ has: page.locator('option[value=""]') }).first();
    const count = await eventSelect.locator("option").count();
    if (count <= 1) {
      test.skip(true, "Sem eventos na BD local — preencher seed ou eventos publicados.");
    }
    await expect(page.getByRole("button", { name: /Sugerir mesas \(evento \+ reserva\)/i })).toBeVisible();
  });

  test("restaurantes: lista e ficha com leitura operacional ou nota de timezone", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAdmin(page);
    await page.goto("/admin/restaurantes", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /Restaurantes parceiros/i })).toBeVisible();

    const detailLinks = page.getByRole("link", { name: "Ficha e edição" });
    if ((await detailLinks.count()) === 0) {
      await expect(page.getByText(/Cadastrados \(\d+/i).first()).toBeVisible();
      return;
    }
    await detailLinks.first().click();
    await page.waitForURL(/\/admin\/restaurantes\/.+/, { timeout: 30_000 });
    await expect(page.getByText(/Capacidade|Agenda|Leitura operacional|Fuso IANA/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("mesas: painel mostra mesas ou estado vazio (smoke)", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAdmin(page);
    await page.goto("/admin/mesas", { waitUntil: "networkidle" });
    const hasMesas = (await page.locator("article").count()) > 0;
    const empty =
      (await page.getByText(/Ainda não há mesas/i).count()) +
      (await page.getByText(/Nenhuma mesa criada no momento/i).count());
    expect(hasMesas || empty > 0).toBeTruthy();
  });
});
