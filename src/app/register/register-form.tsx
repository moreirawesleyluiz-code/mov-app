"use client";

import { Suspense } from "react";
import { RegisterFormInner } from "./register-form-inner";

/** Client Component — mesmo motivo que `login-form.tsx` (dev estável). */
export function RegisterForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-movApp-bg text-[13px] text-movApp-muted [color-scheme:light]">
          Carregando…
        </div>
      }
    >
      <RegisterFormInner />
    </Suspense>
  );
}
