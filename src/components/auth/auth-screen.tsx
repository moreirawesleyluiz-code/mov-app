"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Fundo premium escuro (grid + halos) — reutilizável na entrada e onboarding. */
export function MovPremiumBackdrop({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative min-h-[100dvh] overflow-hidden bg-mov-bg", className)}>
      <div
        className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-[0.18] [background-size:24px_24px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-28 -top-36 h-80 w-80 rounded-full bg-mov-accent/[0.09] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-36 -left-24 h-64 w-64 rounded-full bg-mov-gold/[0.06] blur-3xl"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/** Fundo claro premium (alinhado ao app interno `movApp`) — página inicial / welcome. */
export function MovAppWelcomeBackdrop({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative min-h-[100dvh] overflow-hidden bg-movApp-bg [color-scheme:light]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-grid-pattern-light opacity-[0.45] [background-size:24px_24px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-28 -top-36 h-80 w-80 rounded-full bg-movApp-accent/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-36 -left-24 h-64 w-64 rounded-full bg-movApp-gold/12 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/** Texto do link no login e título da página de recuperação de senha. */
export const authForgotPasswordLabel = "Esqueci minha senha";

/** Classes partilhadas entre login e registo — sem alterar lógica, só apresentação. */
export const authLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.22em] text-movApp-muted";

export const authInputClass =
  "mt-2 w-full rounded-xl border border-movApp-border bg-movApp-paper px-4 py-3.5 text-[15px] leading-snug text-movApp-ink shadow-[inset_0_1px_0_rgba(28,25,23,0.05)] transition placeholder:text-movApp-muted/65 " +
  "hover:border-movApp-border focus:border-movApp-accent focus:outline-none focus:ring-2 focus:ring-movApp-accent/35 focus:ring-offset-2 focus:ring-offset-movApp-bg";

type AuthScreenProps = {
  children: ReactNode;
  footer: ReactNode;
};

function AuthBackToHomeLink() {
  return (
    <Link
      href="/"
      aria-label="Voltar para a página inicial"
      className={cn(
        "inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-2 text-[15px] font-medium text-movApp-muted",
        "transition-colors hover:bg-movApp-subtle/90 hover:text-movApp-ink",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-movApp-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-movApp-bg",
      )}
    >
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 max-h-5 max-w-5 shrink-0 text-movApp-ink/70"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Voltar
    </Link>
  );
}

export function AuthScreen({ children, footer }: AuthScreenProps) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-movApp-bg pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] [color-scheme:light]">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-pattern-light opacity-[0.45] [background-size:24px_24px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-28 -top-36 h-80 w-80 rounded-full bg-movApp-accent/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-36 -left-24 h-64 w-64 rounded-full bg-movApp-gold/12 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-4 py-10 sm:px-5 sm:py-14">
        <div className="flex w-full flex-col gap-5">
          <AuthBackToHomeLink />
          <Link
            href="/"
            className="inline-block w-fit font-display text-[1.65rem] tracking-[-0.02em] text-movApp-ink transition hover:text-movApp-accent"
          >
            MOV
          </Link>
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}

type AuthCardProps = {
  children: ReactNode;
  className?: string;
};

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "mt-9 rounded-[1.25rem] border border-movApp-border bg-movApp-paper p-6 shadow-[0_2px_0_0_rgba(196,92,74,0.06),0_24px_56px_rgba(28,25,23,0.08)] sm:mt-10 sm:p-8",
        "ring-1 ring-movApp-border/50",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Classes extra para o botão primário — combinar com <Button className={...} />. */
export const authPrimaryButtonClass =
  "w-full py-3.5 text-base font-semibold shadow-[0_10px_32px_rgba(196,92,74,0.22)] transition hover:shadow-[0_14px_36px_rgba(196,92,74,0.28)] disabled:shadow-none";
