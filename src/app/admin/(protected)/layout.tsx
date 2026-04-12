import Link from "next/link";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { requireAdminPage } from "@/lib/admin-auth";

/** Shell com navegação mínima entre áreas admin (sem alterar rotas existentes). */
export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return (
    <div className="min-h-screen bg-movApp-bg p-6 text-movApp-ink [color-scheme:light]">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-movApp-border pb-4">
          <nav className="flex flex-wrap gap-4 text-sm font-medium" aria-label="Áreas administrativas">
            <Link href="/admin" className="text-movApp-ink hover:text-movApp-accent">
              Utilizadores
            </Link>
            <Link href="/admin/mesas" className="text-movApp-ink hover:text-movApp-accent">
              Mesas
            </Link>
          </nav>
          <AdminSignOutButton />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
