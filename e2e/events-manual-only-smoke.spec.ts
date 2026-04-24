import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "moreira.wesleyluz@gmail.com";
const ADMIN_PASS = process.env.E2E_ADMIN_PASSWORD ?? "mov-local-test-1";

test("eventos manuais: sem duplicados automáticos no app/admin", async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await page.locator("#admin-email").fill(ADMIN_EMAIL);
  await page.locator("#admin-password").fill(ADMIN_PASS);
  await page.getByRole("button", { name: /Entrar no painel/i }).click();
  await page.waitForURL(/\/admin\/?$/, { timeout: 60_000 });

  await page.goto("/admin/eventos", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Eventos" })).toBeVisible();
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.getByText(/QA|Navegação|speed-qa|jantar-qa|cafe-qa|exodo-qa/i)).toHaveCount(0);

  await page.goto("/app/eventos", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Seus próximos eventos" })).toBeVisible();
  await expect(page.getByText(/QA|Navegação|speed-qa|jantar-qa|cafe-qa|exodo-qa/i)).toHaveCount(0);

  await page.goto("/app/agenda", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /Encontre pessoas em/i })).toBeVisible();
});
