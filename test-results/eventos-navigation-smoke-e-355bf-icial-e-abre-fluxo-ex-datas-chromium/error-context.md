# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: eventos-navigation-smoke.spec.ts >> eventos: Speed Dating card usa label oficial e abre fluxo ex/datas
- Location: e2e\eventos-navigation-smoke.spec.ts:20:5

# Error details

```
TimeoutError: page.waitForURL: Timeout 60000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e13]:
    - generic [ref=e14]:
      - button "Voltar para a página inicial" [ref=e15] [cursor=pointer]:
        - img [ref=e16]
        - text: Voltar
      - button "MOV — página inicial" [ref=e18] [cursor=pointer]: MOV
    - generic [ref=e19]:
      - paragraph [ref=e20]: Admin
      - heading "Entrar — admin" [level=1] [ref=e21]
      - paragraph [ref=e22]: Acesso separado da área do cliente. Utilizadores normais não entram aqui.
      - generic [ref=e23]:
        - generic [ref=e24]:
          - text: E-mail
          - textbox "E-mail" [ref=e25]: moreira.wesleyluz@gmail.com
        - generic [ref=e26]:
          - text: Senha
          - textbox "Senha" [ref=e27]: mov-local-test-1
        - alert [ref=e28]: E-mail ou senha incorretos.
        - button "Entrar no painel" [ref=e29] [cursor=pointer]
    - paragraph [ref=e30]: Área restrita à equipa MOV.
```

# Test source

```ts
  1  | import { expect, test, type Page } from "@playwright/test";
  2  | 
  3  | const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "moreira.wesleyluz@gmail.com";
  4  | const ADMIN_PASS = process.env.E2E_ADMIN_PASSWORD ?? "mov-local-test-1";
  5  | 
  6  | function dateBrInDays(days: number): string {
  7  |   const d = new Date();
  8  |   d.setDate(d.getDate() + days);
  9  |   return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  10 | }
  11 | 
  12 | async function loginAdmin(page: Page) {
  13 |   await page.goto("/admin/login", { waitUntil: "networkidle" });
  14 |   await page.locator("#admin-email").fill(ADMIN_EMAIL);
  15 |   await page.locator("#admin-password").fill(ADMIN_PASS);
  16 |   await page.getByRole("button", { name: /Entrar no painel/i }).click();
> 17 |   await page.waitForURL(/\/admin\/?$/, { timeout: 60_000 });
     |              ^ TimeoutError: page.waitForURL: Timeout 60000ms exceeded.
  18 | }
  19 | 
  20 | test("eventos: Speed Dating card usa label oficial e abre fluxo ex/datas", async ({ page }) => {
  21 |   test.setTimeout(240_000);
  22 |   const nonce = Date.now();
  23 |   const title = `Speed Navegação ${nonce}`;
  24 |   const slug = `speed-nav-${nonce}`;
  25 |   const email = `qa-nav-${nonce}@mov.local`;
  26 |   const pass = "QaNavPass123!";
  27 | 
  28 |   await loginAdmin(page);
  29 |   await page.goto("/admin/eventos", { waitUntil: "networkidle" });
  30 |   await expect(page.getByRole("heading", { name: "Eventos" })).toBeVisible();
  31 | 
  32 |   const newForm = page.locator("section", { has: page.getByRole("heading", { name: "Novo evento" }) });
  33 |   await expect(newForm.locator("input[name='startDateBr']")).toBeVisible();
  34 |   await expect(newForm.locator("input[name='startTime24']")).toBeVisible();
  35 |   await newForm.locator("input[name='title']").fill(title);
  36 |   await newForm.locator("input[name='slug']").fill(slug);
  37 |   await newForm.locator("select[name='productLine']").selectOption("SPEED_DATING");
  38 |   await newForm.locator("select[name='eventType']").selectOption("CLASSICO");
  39 |   await newForm.locator("input[name='startDateBr']").fill(dateBrInDays(5));
  40 |   await newForm.locator("input[name='startTime24']").fill("20:00");
  41 |   await newForm.getByRole("button", { name: "Criar evento" }).click();
  42 |   await page.waitForLoadState("networkidle");
  43 | 
  44 |   const reg = await page.request.post("/api/register", {
  45 |     data: { name: "QA Nav", email, password: pass },
  46 |   });
  47 |   expect(reg.ok(), await reg.text()).toBeTruthy();
  48 |   await page.getByRole("button", { name: "Sair" }).click();
  49 |   await page.waitForURL(/\/admin\/login/, { timeout: 60_000 });
  50 | 
  51 |   await page.goto("/login?callbackUrl=/app/eventos", { waitUntil: "networkidle" });
  52 |   await page.getByLabel("E-mail").fill(email);
  53 |   await page.getByLabel("Senha").fill(pass);
  54 |   await page.getByRole("button", { name: "Entrar" }).click();
  55 |   await page.waitForURL((u) => u.pathname.startsWith("/app"), { timeout: 60_000 });
  56 |   const sub = await page.request.post("/api/subscription");
  57 |   expect(sub.ok(), await sub.text()).toBeTruthy();
  58 | 
  59 |   await page.goto("/app/eventos", { waitUntil: "networkidle" });
  60 |   const upcomingSection = page.locator("section", { has: page.getByRole("heading", { name: "Próximas experiências" }) });
  61 |   // Card alinhado ao fluxo de `/app/ex/datas`: rótulo por tipo, não título de QA do admin
  62 |   await expect(upcomingSection.getByText("Speed Dating Clássico")).toBeVisible();
  63 |   await expect(upcomingSection.getByText(title)).toHaveCount(0);
  64 |   await expect(page.locator("section", { has: page.getByRole("heading", { name: "Eventos anteriores" }) }).getByText(title)).toHaveCount(0);
  65 | 
  66 |   await upcomingSection.getByRole("link", { name: /Speed Dating Clássico/i }).first().click();
  67 |   await page.waitForURL(/\/app\/ex\/datas\/.+\/regiao$/, { timeout: 30_000 });
  68 |   await expect(page).not.toHaveURL(/\/app\/eventos\//);
  69 |   await expect(page.getByRole("link", { name: "Voltar" })).toBeVisible();
  70 |   await page.getByRole("link", { name: "Voltar" }).first().click();
  71 |   await page.waitForURL(/\/app\/ex\/datas$/, { timeout: 30_000 });
  72 | });
  73 | 
```