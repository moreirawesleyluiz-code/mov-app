import { expect, test, type Locator, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "moreira.wesleyluz@gmail.com";
const ADMIN_PASS = process.env.E2E_ADMIN_PASSWORD ?? "mov-local-test-1";

function localDateTimePartsPlusDays(days: number, hour: number): { dateBr: string; time24: string } {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  const day = String(d.getDate()).padStart(2, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const y = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return { dateBr: `${day}/${m}/${y}`, time24: `${hh}:${mm}` };
}

async function loginAdmin(page: Page) {
  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await page.locator("#admin-email").fill(ADMIN_EMAIL);
  await page.locator("#admin-password").fill(ADMIN_PASS);
  await page.getByRole("button", { name: /Entrar no painel/i }).click();
  await page.waitForURL(/\/admin\/?$/, { timeout: 60_000 });
}

async function loginUser(page: Page, email: string, password: string, callbackUrl = "/app") {
  await page.goto(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, { waitUntil: "networkidle" });
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((u) => u.pathname.startsWith("/app"), { timeout: 60_000 });
}

async function createEvent(
  page: Page,
  opts: { title: string; slug: string; productLine: "SE_MOV" | "SPEED_DATING"; type: string; dateBr: string; time24: string },
) {
  await page.goto("/admin/eventos", { waitUntil: "networkidle" });
  const newEventSection = page.locator("section", {
    has: page.getByRole("heading", { name: "Novo evento" }),
  });
  await newEventSection.locator("input[name='title']").fill(opts.title);
  await newEventSection.locator("input[name='slug']").fill(opts.slug);
  await newEventSection.locator("select[name='productLine']").selectOption(opts.productLine);
  await newEventSection.locator("select[name='eventType']").selectOption(opts.type);
  await expect(newEventSection.locator("select[name='productLine']")).toHaveValue(opts.productLine);
  await expect(newEventSection.locator("select[name='eventType']")).toHaveValue(opts.type);
  await newEventSection.locator("input[name='startDateBr']").fill(opts.dateBr);
  await newEventSection.locator("input[name='startTime24']").fill(opts.time24);
  await newEventSection.getByRole("button", { name: "Criar evento" }).click();
  await page.waitForLoadState("networkidle");
}

async function openFlowAndValidateHeader(page: Page, label: "Jantar" | "Café" | "Êxodo") {
  await page.goto("/app/agenda", { waitUntil: "networkidle" });
  const row = page.locator("li", { hasText: label }).first();
  await row.getByRole("button", { name: /Escolher região para esta experiência/i }).click();
  await page.waitForURL(/\/app\/agenda\/.+\/regiao$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1, name: label })).toBeVisible();

  const regionChoice = page.getByRole("radio", { name: /Pinheiros \/ Vila Madalena|Jardins \/ Itaim Bibi \/ Moema/i }).first();
  await regionChoice.click();
  await page.getByRole("button", { name: "Continuar" }).click();

  await page.waitForURL(/\/app\/agenda\/.+\/preferencias/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1, name: label })).toBeVisible();
  await expect(page.getByText("( Obrigatório )")).toHaveCount(0);
  await expect(page.getByText("( Opcional )")).toHaveCount(0);
  await page.getByRole("button", { name: "Continuar" }).click();

  await page.waitForURL(/\/app\/agenda\/.+\/resumo/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1, name: label })).toBeVisible();
  await expect(page.getByRole("link", { name: "Editar minhas preferências" })).toBeVisible();
}

async function findEventCardByTitle(page: Page, title: string): Promise<Locator> {
  const heading = page.getByRole("heading", { level: 3, name: title });
  await expect(heading.first()).toBeVisible();
  return heading.first().locator("xpath=ancestor::article[1]");
}

test("QA completo eventos: admin -> app -> fluxo Se Mov", async ({ page }) => {
  test.setTimeout(420_000);
  const nonce = Date.now();
  const jantarTitle = `Jantar QA ${nonce}`;
  const cafeTitle = `Café QA ${nonce}`;
  const exodoTitle = `Êxodo QA ${nonce}`;
  const speedTitle = `Speed QA ${nonce}`;
  const speedTitleEdited = `${speedTitle} Editado`;
  const userEmail = `qa-events-e2e-${nonce}@mov.local`;
  const userPass = "QaEventsPass123!";

  await loginAdmin(page);
  await page.goto("/admin/eventos", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Eventos" })).toBeVisible();

  await createEvent(page, {
    title: jantarTitle,
    slug: `jantar-qa-${nonce}`,
    productLine: "SE_MOV",
    type: "SE_MOV_JANTAR",
    ...localDateTimePartsPlusDays(4, 20),
  });
  await createEvent(page, {
    title: cafeTitle,
    slug: `cafe-qa-${nonce}`,
    productLine: "SE_MOV",
    type: "SE_MOV_CAFE",
    ...localDateTimePartsPlusDays(5, 11),
  });
  await createEvent(page, {
    title: exodoTitle,
    slug: `exodo-qa-${nonce}`,
    productLine: "SE_MOV",
    type: "SE_MOV_EXODO",
    ...localDateTimePartsPlusDays(6, 19),
  });
  await createEvent(page, {
    title: speedTitle,
    slug: `speed-qa-${nonce}`,
    productLine: "SPEED_DATING",
    type: "CLASSICO",
    ...localDateTimePartsPlusDays(7, 20),
  });
  await page.goto("/admin/eventos", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: /Se Mov \(\d+\)/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Speed Dating \(\d+\)/ })).toBeVisible();

  const speedCard = await findEventCardByTitle(page, speedTitle);
  await expect(speedCard).toBeVisible();
  await speedCard.getByText("Editar evento").click();
  await speedCard.locator("input[name='title']").fill(speedTitleEdited);
  await speedCard.getByRole("button", { name: "Guardar alterações" }).click();
  await page.waitForLoadState("networkidle");
  await page.goto("/admin/eventos", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 3, name: speedTitleEdited })).toBeVisible();

  const deactivateCard = await findEventCardByTitle(page, speedTitleEdited);
  await deactivateCard.getByRole("button", { name: "Desativar" }).click();
  await page.waitForLoadState("networkidle");
  await expect(deactivateCard.getByRole("button", { name: "Ativar" })).toBeVisible();

  const reg = await page.request.post("/api/register", {
    data: { name: "QA Events E2E", email: userEmail, password: userPass },
  });
  expect(reg.ok(), await reg.text()).toBeTruthy();

  await page.getByRole("button", { name: "Sair" }).click();
  await page.waitForURL(/\/admin\/login/, { timeout: 60_000 });
  await loginUser(page, userEmail, userPass, "/app/eventos");

  const subRes = await page.request.post("/api/subscription");
  expect(subRes.ok(), await subRes.text()).toBeTruthy();

  await page.goto("/app/eventos", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Se Mov" })).toBeVisible();
  await expect(page.getByText("Café").first()).toBeVisible();
  await expect(page.getByText(speedTitleEdited)).toHaveCount(0);

  await page.goto("/app/conta", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Sair|Encerrar sessão/i }).click();
  await loginAdmin(page);
  await page.goto("/admin/eventos", { waitUntil: "networkidle" });
  const reactivateCard = await findEventCardByTitle(page, speedTitleEdited);
  await reactivateCard.getByRole("button", { name: "Ativar" }).click();
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Sair" }).click();
  await page.waitForURL(/\/admin\/login/, { timeout: 60_000 });
  await loginUser(page, userEmail, userPass, "/app/eventos");
  await page.goto("/app/eventos", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Speed Dating" })).toBeVisible();
  await expect(page.getByText(speedTitleEdited)).toBeVisible();
  await page.getByText(speedTitleEdited).click();
  await page.waitForURL(/\/app\/eventos\/.+$/, { timeout: 30_000 });
  await expect(page.getByRole("link", { name: /Voltar para eventos/i })).toBeVisible();

  await page.goto("/app/agenda", { waitUntil: "networkidle" });
  await expect(page.getByText("Demo: explorar fluxo")).toHaveCount(0);
  await expect(page.getByText("Reservado · preview")).toHaveCount(0);

  await openFlowAndValidateHeader(page, "Jantar");
  await openFlowAndValidateHeader(page, "Café");
  await openFlowAndValidateHeader(page, "Êxodo");
});
