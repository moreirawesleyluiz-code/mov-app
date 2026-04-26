"use client";

import { useSearchParams } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import {
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
  AuthCard,
  AuthScreen,
} from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";

function safeAdminCallback(raw: string | null): string {
  const fallback = "/admin";
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (!raw.startsWith("/admin")) return fallback;
  return raw;
}

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const path = safeAdminCallback(searchParams.get("callbackUrl"));
      const callbackUrl = new URL(path, window.location.origin).href;
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError("E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }
      // Após credentials, o cookie pode não estar visível ao getSession de imediato — esperar brevemente.
      let session: Awaited<ReturnType<typeof getSession>> = null;
      for (let i = 0; i < 12; i++) {
        session = await getSession();
        if (session?.user) break;
        await new Promise((r) => setTimeout(r, 80));
      }
      if (session?.user?.role !== "admin") {
        await signOut({ redirect: false });
        setError("Esta conta não tem permissão de administrador.");
        setLoading(false);
        return;
      }
      // Navegação completa: garante que o middleware e o RSC em /admin veem a sessão (evita 500/estado inconsistente).
      window.location.assign("/admin");
    } catch {
      setError("Erro de rede. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <AuthScreen footer={<p className="mt-8 text-center text-xs text-movApp-muted">Área restrita à equipa MOV.</p>}>
      <AuthCard>
        <h1 className="mt-2 font-display text-[1.85rem] font-normal leading-tight tracking-[-0.03em] text-movApp-ink sm:text-[2rem]">
          Entrar — admin
        </h1>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
          <div>
            <label htmlFor="admin-email" className={authLabelClass}>
              E-mail
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
            />
          </div>
          <div>
            <label htmlFor="admin-password" className={authLabelClass}>
              Senha
            </label>
            <div className="relative">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${authInputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-movApp-muted transition hover:text-movApp-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-movApp-accent/40"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.01-2.84 2.89-4.98 5.3-6.32" />
                    <path d="M1 1l22 22" />
                    <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c.69 0 1.34-.2 1.89-.55" />
                    <path d="M14.47 14.47A3.5 3.5 0 0 0 9.53 9.53" />
                    <path d="M20.48 15.26A11.26 11.26 0 0 0 23 12c-1.73-4.89-6-8-11-8-1.4 0-2.74.24-4 .68" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className={authPrimaryButtonClass}>
            {loading ? "Entrando…" : "Entrar no painel"}
          </Button>
        </form>
      </AuthCard>
    </AuthScreen>
  );
}
