import Link from "next/link";
import { AdminMainNav } from "@/components/admin/admin-main-nav";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { requireAdminPage } from "@/lib/admin-auth";

/** Shell do painel: quatro áreas (Utilizadores, Mesas, Restaurantes, Montagem). */
export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return (
    <div className="min-h-screen bg-movApp-bg p-4 text-movApp-ink [color-scheme:light] sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 border-b border-movApp-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Painel MOV</p>
          </div>
          <div className="flex items-center gap-2">
            <AdminSignOutButton />
          </div>
        </header>
        <main className="pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] lg:pb-24">{children}</main>
      </div>
      <AdminMainNav />
    </div>
  );
}
