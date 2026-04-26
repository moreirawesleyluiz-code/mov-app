"use client";

import Link from "next/link";
import { useState } from "react";
import {
  authForgotPasswordLabel,
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
  AuthCard,
  AuthScreen,
} from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/app/password-reset/actions";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const r = await requestPasswordReset({ email: email.trim().toLowerCase() });
    setLoading(false);
    if (!r.ok) {
      setError(r.message);
      return;
    }
    setMessage(r.message);
  }

  return (
    <AuthScreen
      footer={
        <p className="mt-8 text-center text-sm text-movApp-muted">
          <Link href="/login" className="font-medium text-movApp-accent hover:underline">
            Voltar ao login
          </Link>
        </p>
      }
    >
      <AuthCard>
        <h1 className="mt-2 font-display text-[1.85rem] font-normal leading-tight tracking-[-0.03em] text-movApp-ink sm:text-[2rem]">
          {authForgotPasswordLabel}
        </h1>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
          <div>
            <label htmlFor="forgot-email" className={authLabelClass}>
              E-mail
            </label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "A enviar…" : "Enviar link"}
          </Button>
        </form>
      </AuthCard>
    </AuthScreen>
  );
}
