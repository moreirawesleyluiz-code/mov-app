"use client";

import { signOut } from "next-auth/react";

/** Botão nativo — evita acoplar o layout admin ao `Button` (RSC + client boundary). */
export function AdminSignOutButton() {
  return (
    <button
      type="button"
      className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-movApp-border bg-movApp-paper px-4 text-sm font-medium text-movApp-ink shadow-sm ring-1 ring-movApp-border/30 transition hover:bg-movApp-subtle/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-movApp-accent"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
    >
      Sair
    </button>
  );
}
