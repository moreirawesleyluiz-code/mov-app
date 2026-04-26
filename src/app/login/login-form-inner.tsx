"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useMemo, useState } from "react";
import {
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
  AuthCard,
  AuthScreen,
} from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { buildSignupOnboardingHref } from "@/lib/onboarding-signup-intent";
import { syncPendingOnboardingAfterAuth } from "@/lib/onboarding-client-sync";
import { cn } from "@/lib/utils";

/** Destinos permitidos após login do cliente — nunca área admin (admins usam /admin/login). */
function isSafeAppPath(raw: string): boolean {
  return raw === "/app" || raw.startsWith("/app/");
}

function safeAppCallbackUrl(raw: string | null): string {
  const fallback = "/app";
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (!isSafeAppPath(raw)) return fallback;
  return raw;
}

function safeCallbackForLink(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return isSafeAppPath(raw) ? raw : null;
}

export function LoginFormInner() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** Cadastro só após o questionário na landing — não ir direto a /register. */
  const signupOnboardingHref = useMemo(() => {
    const cb = safeCallbackForLink(searchParams.get("callbackUrl"));
    return buildSignupOnboardingHref(cb);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const path = safeAppCallbackUrl(searchParams.get("callbackUrl"));
      /** Mesma origem do browser — evita desalinhamento 127.0.0.1 vs localhost no cookie/sessão. */
      const callbackAbsolute = new URL(path, window.location.origin).href;

      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: callbackAbsolute,
      });
      if (!res || !res.ok || res.error) {
        setError(
          res?.error ? "E-mail ou senha incorretos." : "Não foi possível entrar. Tente novamente.",
        );
        setLoading(false);
        return;
      }

      let session: Awaited<ReturnType<typeof getSession>> = null;
      for (let i = 0; i < 24; i++) {
        session = await getSession();
        if (session?.user) break;
        await new Promise((r) => setTimeout(r, 100));
      }
      if (session?.user?.role === "admin") {
        window.location.assign(new URL("/admin", window.location.origin).href);
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

      /* Navegação completa: novo GET com cookie — obrigatório para o middleware ver o JWT em /app. */
      window.location.assign(callbackAbsolute);
    } catch {
      setError("Erro de rede. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      footer={
        <div className="mt-8 rounded-2xl border border-movApp-border bg-movApp-subtle/90 px-5 py-5 text-center sm:mt-9">
          <p className="text-[13px] text-movApp-muted">Novo por aqui?</p>
          <Link
            href={signupOnboardingHref}
            className="mt-2.5 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-movApp-border bg-movApp-paper px-4 text-sm font-semibold text-movApp-ink shadow-sm transition hover:border-movApp-accent/35 hover:bg-movApp-subtle"
          >
            Criar conta
          </Link>
        </div>
      }
    >
      <AuthCard className="mt-6 border-movApp-border/80 p-7 shadow-[0_2px_0_0_rgba(196,92,74,0.05),0_20px_48px_rgba(28,25,23,0.07)] sm:mt-7 sm:p-8">
        <h1 className="text-center font-display text-[2rem] font-normal leading-[1.12] tracking-[-0.035em] text-movApp-ink sm:text-[2.125rem]">
          Entrar
        </h1>
        <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-6 sm:mt-8">
          <div className="space-y-0">
            <label htmlFor="login-email" className={authLabelClass}>
              E-mail
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(authInputClass, "mt-2 rounded-[0.875rem] px-4 py-3 text-[15px]")}
            />
          </div>
          <div className="space-y-0">
            <label htmlFor="login-password" className={authLabelClass}>
              Senha
            </label>
            <div className="relative mt-2">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(authInputClass, "rounded-[0.875rem] px-4 py-3 pr-12 text-[15px]")}
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
            <div className="relative z-10 mt-3 flex justify-end">
              <a
                href="/forgot-password"
                className="text-[13px] font-semibold text-movApp-accent underline-offset-[3px] transition hover:underline"
              >
                Esqueci minha senha
              </a>
            </div>
          </div>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-900" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className={cn(authPrimaryButtonClass, "min-h-[48px] rounded-[0.875rem] py-3 text-[15px]")}>
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </AuthCard>
    </AuthScreen>
  );
}
