import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "moreira.wesleyluz@gmail.com";
const ADMIN_PASS = process.env.E2E_ADMIN_PASSWORD ?? "mov-local-test-1";

test.describe("Admin fluxo real", () => {
  test("login → /admin lista → detalhe com Perfil MOV", async ({ page }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/admin/login", { waitUntil: "networkidle" });
    await page.locator("#admin-email").fill(ADMIN_EMAIL);
    await page.locator("#admin-password").fill(ADMIN_PASS);
    await page.getByRole("button", { name: /Entrar no painel/i }).click();
    await page.waitForURL(/\/admin\/?$/, { timeout: 60_000 });

    await expect(page.getByTestId("admin-utilizadores-heading")).toHaveText("Utilizadores");
    expect(errors, errors.join("\n")).toEqual([]);

    const firstUser = page.locator('a[href^="/admin/users/"]').first();
    await expect(firstUser).toBeVisible({ timeout: 15_000 });
    await firstUser.click();
    await page.waitForURL(/\/admin\/users\/.+/, { timeout: 30_000 });

    await expect(page.getByRole("heading", { name: "Perfil MOV", exact: true })).toBeVisible();
    expect(errors, errors.join("\n")).toEqual([]);
  });
});
