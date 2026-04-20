"use client";

import { Suspense } from "react";
import { LoginFormInner } from "./login-form-inner";

/**
 * Client Component: `<Suspense>` + `LoginFormInner` (`useSearchParams`) no mesmo boundary cliente.
 * Um wrapper Server Component aqui gerava grafo RSC/webpack em `next dev` com 500 + `reading 'call'`.
 */
export function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-movApp-bg text-[13px] text-movApp-muted [color-scheme:light]">
          Carregando…
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
