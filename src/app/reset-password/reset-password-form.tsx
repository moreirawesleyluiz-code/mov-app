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
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
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
            <div className="relative">
              <input
                id="new-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
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
          <div>
            <label htmlFor="new-password-2" className={authLabelClass}>
              Confirmar senha
            </label>
            <div className="relative">
              <input
                id="new-password-2"
                name="password2"
                type={showPassword2 ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className={`${authInputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword2((v) => !v)}
                aria-label={showPassword2 ? "Ocultar senha" : "Mostrar senha"}
                className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-movApp-muted transition hover:text-movApp-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-movApp-accent/40"
              >
                {showPassword2 ? (
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
