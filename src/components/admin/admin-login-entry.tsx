"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

/**
 * Shell 100% cliente: dynamic + ssr:false só é permitido aqui (não no page RSC).
 * Evita que o módulo do servidor da rota /admin/login ligue ao chunk next-auth/@auth.
 */
const AdminLoginFormLazy = dynamic(
  () => import("@/components/admin/admin-login-form").then((m) => ({ default: m.AdminLoginForm })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-movApp-bg text-movApp-muted [color-scheme:light]">
        Carregando…
      </div>
    ),
  },
);

export function AdminLoginEntry() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-movApp-bg text-movApp-muted [color-scheme:light]">
          Carregando…
        </div>
      }
    >
      <AdminLoginFormLazy />
    </Suspense>
  );
}
