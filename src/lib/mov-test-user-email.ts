/**
 * Indica e-mail de conta criada por Playwright / E2E / scripts QA.
 * Usado em /api/register e no backfill do seed para `User.isTestUser`.
 *
 * Não confundir com sementes de desenvolvimento como `user@mov.local` (não entram no padrão).
 */
export function isAutomationTestAccountEmail(email: string): boolean {
  const e = email.toLowerCase().trim();
  if (e.endsWith("@mov-e2e.local")) return true;
  if (!e.endsWith("@mov.local")) return false;
  const local = e.split("@")[0] ?? "";
  if (local === "user" || local === "dev" || local === "admin") return false;
  if (local.startsWith("qa-") || local.startsWith("e2e-") || local.startsWith("test-") || local.startsWith("playwright-")) {
    return true;
  }
  if (local.startsWith("qa") && local.includes("e2e")) return true;
  return false;
}
