"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
  AuthCard,
  AuthScreen,
} from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { resetPasswordWithToken } from "@/app/password-reset/actions";

type Props = { token: string };

export function ResetPasswordForm({ token }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (password !== password2) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    const r = await resetPasswordWithToken({ token, password });
    setLoading(false);
    if (!r.ok) {
      setError(r.message);
      return;
    }
    setMessage(r.message);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <AuthScreen
      footer={
        <p className="mt-8 text-center text-sm text-movApp-muted">
          <Link href="/login" className="font-medium text-movApp-accent hover:underline">
            Ir para o login
          </Link>
        </p>
      }
    >
      <AuthCard>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-movApp-accent">Nova senha</p>
        <h1 className="mt-2 font-display text-[1.85rem] font-normal leading-tight tracking-[-0.03em] text-movApp-ink sm:text-[2rem]">
          Definir nova senha
        </h1>
        <p className="mt-3 text-pretty text-[14px] leading-relaxed text-movApp-muted sm:text-[15px]">
          Escolha uma senha segura (mínimo 8 caracteres).
        </p>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
          <div>
            <label htmlFor="new-password" className={authLabelClass}>
              Nova senha
            </label>
            <input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
            />
          </div>
          <div>
            <label htmlFor="new-password-2" className={authLabelClass}>
              Confirmar senha
            </label>
            <input
              id="new-password-2"
              name="password2"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className={authInputClass}
            />
          </div>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
              {message}
            </p>
          )}
          <Button type="submit" disabled={loading} className={authPrimaryButtonClass}>
            {loading ? "A guardar…" : "Guardar nova senha"}
          </Button>
        </form>
      </AuthCard>
    </AuthScreen>
  );
}
