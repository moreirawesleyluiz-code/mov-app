import { Suspense } from "react";
import { LoginForm } from "./login-form";

/** Suspense: exigido pelo useSearchParams no formulário cliente (mesmo padrão que /register). */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-movApp-bg text-[13px] text-movApp-muted [color-scheme:light]">
          Carregando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
