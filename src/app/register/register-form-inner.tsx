"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMemo, useState } from "react";
import {
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
  AuthCard,
  AuthScreen,
} from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { syncPendingOnboardingAfterAuth } from "@/lib/onboarding-client-sync";

function isSafeAppPath(raw: string): boolean {
  return raw === "/app" || raw.startsWith("/app/");
}

function safeCallbackForLink(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return isSafeAppPath(raw) ? raw : null;
}

export function RegisterFormInner() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginHref = useMemo(() => {
    const cb = safeCallbackForLink(searchParams.get("callbackUrl"));
    return cb ? `/login?callbackUrl=${encodeURIComponent(cb)}` : "/login";
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Não foi possível criar a conta.");
        setLoading(false);
        return;
      }
      const appUrl = new URL("/app", window.location.origin).href;
      const sign = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: appUrl,
      });
      if (!sign || !sign.ok || sign.error) {
        setError("Conta criada, mas o login automático falhou. Tente entrar manualmente.");
        setLoading(false);
        return;
      }
      try {
        const sync = await syncPendingOnboardingAfterAuth();
        if (!sync.ok) {
          console.warn("[MOV] Onboarding sync:", sync.error);
        }
      } catch (syncErr) {
        console.warn("[MOV] Onboarding sync (exceção):", syncErr);
      }
      window.location.assign(appUrl);
    } catch {
      setError("Erro de rede. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      showWordmark={false}
      footer={
        <div className="mt-9 rounded-2xl border border-movApp-border bg-movApp-subtle/90 px-5 py-5 text-center sm:mt-10">
          <p className="text-[13px] text-movApp-muted">Já tem conta?</p>
          <Link
            href={loginHref}
            className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-movApp-border bg-movApp-paper px-4 text-sm font-semibold text-movApp-ink shadow-sm transition hover:border-movApp-accent/35 hover:bg-movApp-subtle"
          >
            Entrar
          </Link>
        </div>
      }
    >
      <AuthCard>
        <h1 className="font-display text-[1.85rem] font-normal leading-tight tracking-[-0.03em] text-movApp-ink sm:text-[2rem]">
          Criar conta
        </h1>
        <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-5">
          <div>
            <label htmlFor="name" className={authLabelClass}>
              Nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={authInputClass}
            />
          </div>
          <div>
            <label htmlFor="email" className={authLabelClass}>
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className={authLabelClass}>
              Senha (mín. 8 caracteres)
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
            {loading ? "Criando…" : "Criar conta"}
          </Button>
        </form>
      </AuthCard>
    </AuthScreen>
  );
}
