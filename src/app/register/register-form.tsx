"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

function safeCallbackForLink(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const sign = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (sign?.error) {
        setError("Conta criada, mas o login automático falhou. Tente entrar manualmente.");
        setLoading(false);
        return;
      }
      const sync = await syncPendingOnboardingAfterAuth();
      if (!sync.ok) {
        console.warn("[MOV] Onboarding sync:", sync.error);
      }
      router.push("/app");
      router.refresh();
    } catch {
      setError("Erro de rede. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <AuthScreen
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
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-movApp-accent">Conta</p>
        <h1 className="mt-2 font-display text-[1.85rem] font-normal leading-tight tracking-[-0.03em] text-movApp-ink sm:text-[2rem]">
          Criar conta
        </h1>
        <p className="mt-3 text-pretty text-[14px] leading-relaxed text-movApp-muted sm:text-[15px]">
          Crie sua conta e entre na MOV; você completa seu perfil na entrada do produto no ritmo que
          preferir.
        </p>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
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
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
            />
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
