"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { syncPendingOnboardingAfterAuth } from "@/lib/onboarding-client-sync";

/** Destinos permitidos após login do cliente — nunca área admin (admins usam /admin/login). */
function safeAppCallbackUrl(raw: string | null): string {
  const fallback = "/app";
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw === "/admin" || raw.startsWith("/admin/")) return fallback;
  return raw;
}

function safeCallbackForLink(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const registerHref = useMemo(() => {
    const cb = safeCallbackForLink(searchParams.get("callbackUrl"));
    return cb ? `/register?callbackUrl=${encodeURIComponent(cb)}` : "/register";
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const callbackUrl = safeAppCallbackUrl(searchParams.get("callbackUrl"));
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
      let session: Awaited<ReturnType<typeof getSession>> = null;
      for (let i = 0; i < 12; i++) {
        session = await getSession();
        if (session?.user) break;
        await new Promise((r) => setTimeout(r, 80));
      }
      if (session?.user?.role === "admin") {
        window.location.assign("/admin");
        return;
      }
      const sync = await syncPendingOnboardingAfterAuth();
      if (!sync.ok) {
        console.warn("[MOV] Onboarding sync:", sync.error);
      }
      router.push(callbackUrl);
      router.refresh();
      setLoading(false);
    } catch {
      setError("Erro de rede. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      footer={
        <div className="mt-9 rounded-2xl border border-movApp-border bg-movApp-subtle/90 px-5 py-5 text-center sm:mt-10">
          <p className="text-[13px] text-movApp-muted">Novo por aqui?</p>
          <Link
            href={registerHref}
            className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-movApp-border bg-movApp-paper px-4 text-sm font-semibold text-movApp-ink shadow-sm transition hover:border-movApp-accent/35 hover:bg-movApp-subtle"
          >
            Criar conta
          </Link>
        </div>
      }
    >
      <AuthCard>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-movApp-accent">Acesso</p>
        <h1 className="mt-2 font-display text-[1.85rem] font-normal leading-tight tracking-[-0.03em] text-movApp-ink sm:text-[2rem]">
          Entrar
        </h1>
        <p className="mt-3 text-pretty text-[14px] leading-relaxed text-movApp-muted sm:text-[15px]">
          Entre para acompanhar encontros, comunidade e experiências da MOV em um só lugar.
        </p>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
          <div>
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
              className={authInputClass}
            />
          </div>
          <div>
            <label htmlFor="login-password" className={authLabelClass}>
              Senha
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
            />
            <div className="mt-2 flex justify-end">
              <Link
                href="/forgot-password"
                className="text-[13px] font-semibold text-movApp-accent underline-offset-2 transition hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
          </div>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className={authPrimaryButtonClass}>
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </AuthCard>
    </AuthScreen>
  );
}
