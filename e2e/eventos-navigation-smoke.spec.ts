import { expect, test, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "moreira.wesleyluz@gmail.com";
const ADMIN_PASS = process.env.E2E_ADMIN_PASSWORD ?? "mov-local-test-1";

function dateBrInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

async function loginAdmin(page: Page) {
  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await page.locator("#admin-email").fill(ADMIN_EMAIL);
  await page.locator("#admin-password").fill(ADMIN_PASS);
  await page.getByRole("button", { name: /Entrar no painel/i }).click();
  await page.waitForURL(/\/admin\/?$/, { timeout: 60_000 });
}

test("eventos: Speed Dating card usa label oficial e abre fluxo ex/datas", async ({ page }) => {
  test.setTimeout(240_000);
  const nonce = Date.now();
  const title = `Speed Navegação ${nonce}`;
  const slug = `speed-nav-${nonce}`;
  const email = `qa-nav-${nonce}@mov.local`;
  const pass = "QaNavPass123!";

  await loginAdmin(page);
  await page.goto("/admin/eventos", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Eventos" })).toBeVisible();

  const newForm = page.locator("section", { has: page.getByRole("heading", { name: "Novo evento" }) });
  await expect(newForm.locator("input[name='startDateBr']")).toBeVisible();
  await expect(newForm.locator("input[name='startTime24']")).toBeVisible();
  await newForm.locator("input[name='title']").fill(title);
  await newForm.locator("input[name='slug']").fill(slug);
  await newForm.locator("select[name='productLine']").selectOption("SPEED_DATING");
  await newForm.locator("select[name='eventType']").selectOption("CLASSICO");
  await newForm.locator("input[name='startDateBr']").fill(dateBrInDays(5));
  await newForm.locator("input[name='startTime24']").fill("20:00");
  await newForm.getByRole("button", { name: "Criar evento" }).click();
  await page.waitForLoadState("networkidle");

  const reg = await page.request.post("/api/register", {
    data: { name: "QA Nav", email, password: pass },
  });
  expect(reg.ok(), await reg.text()).toBeTruthy();
  await page.getByRole("button", { name: "Sair" }).click();
  await page.waitForURL(/\/admin\/login/, { timeout: 60_000 });

  await page.goto("/login?callbackUrl=/app/eventos", { waitUntil: "networkidle" });
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(pass);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((u) => u.pathname.startsWith("/app"), { timeout: 60_000 });
  const sub = await page.request.post("/api/subscription");
  expect(sub.ok(), await sub.text()).toBeTruthy();

  await page.goto("/app/eventos", { waitUntil: "networkidle" });
  const upcomingSection = page.locator("section", { has: page.getByRole("heading", { name: "Próximas experiências" }) });
  // Card alinhado ao fluxo de `/app/ex/datas`: rótulo por tipo, não título de QA do admin
  await expect(upcomingSection.getByText("Speed Dating Clássico")).toBeVisible();
  await expect(upcomingSection.getByText(title)).toHaveCount(0);
  await expect(page.locator("section", { has: page.getByRole("heading", { name: "Eventos anteriores" }) }).getByText(title)).toHaveCount(0);

  await upcomingSection.getByRole("link", { name: /Speed Dating Clássico/i }).first().click();
  await page.waitForURL(/\/app\/ex\/datas\/.+\/regiao$/, { timeout: 30_000 });
  await expect(page).not.toHaveURL(/\/app\/eventos\//);
  await expect(page.getByRole("link", { name: "Voltar" })).toBeVisible();
  await page.getByRole("link", { name: "Voltar" }).first().click();
  await page.waitForURL(/\/app\/ex\/datas$/, { timeout: 30_000 });
});
