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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const callbackUrl = safeAdminCallback(searchParams.get("callbackUrl"));
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
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-movApp-accent">Admin</p>
        <h1 className="mt-2 font-display text-[1.85rem] font-normal leading-tight tracking-[-0.03em] text-movApp-ink sm:text-[2rem]">
          Entrar — admin
        </h1>
        <p className="mt-3 text-pretty text-[14px] leading-relaxed text-movApp-muted sm:text-[15px]">
          Acesso separado da área do cliente. Utilizadores normais não entram aqui.
        </p>
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
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
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
            {loading ? "Entrando…" : "Entrar no painel"}
          </Button>
        </form>
      </AuthCard>
    </AuthScreen>
  );
}
