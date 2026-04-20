"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authLabelClass, MovAppWelcomeBackdrop } from "@/components/auth/auth-screen";
import { cn } from "@/lib/utils";
import type { OnboardingInterstitialVariant, OnboardingStep } from "./onboarding-config";
import { IconBack, MovWelcomeLogo } from "./welcome-chrome";

export { IconBack, MovWelcomeLogo };

/** Destino padrão após login/cadastro no fluxo MOV (handoff e welcome). */
export const MOV_POST_AUTH_PATH = "/app";

export function movLoginHref(): string {
  return `/login?callbackUrl=${encodeURIComponent(MOV_POST_AUTH_PATH)}`;
}

/** Escolha e-mail vs Google antes do formulário de credenciais (landing e handoff). */
export function movAuthChoiceHref(): string {
  return `/entrar?callbackUrl=${encodeURIComponent(MOV_POST_AUTH_PATH)}`;
}

const focusRingWelcome =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-movApp-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-movApp-bg";

const cardOptionLight =
  "rounded-xl border border-movApp-border bg-movApp-paper px-4 py-4 text-left text-[15px] font-medium leading-snug text-movApp-ink shadow-sm shadow-movApp-ink/[0.05] ring-1 ring-movApp-border/45 transition hover:border-movApp-accent/35 hover:bg-movApp-subtle active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-movApp-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-movApp-bg";

const cardOptionSelectedLight =
  "rounded-xl border border-movApp-accent bg-movApp-accentSoft px-4 py-4 text-left text-[15px] font-medium leading-snug text-movApp-ink shadow-md shadow-movApp-accent/15 ring-1 ring-movApp-accent/25 transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-movApp-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-movApp-bg";

export function IconClose({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

type WelcomeProps = {
  onStart: () => void;
};

export function OnboardingWelcome({ onStart }: WelcomeProps) {
  return (
    <MovAppWelcomeBackdrop>
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] sm:px-6">
        <MovWelcomeLogo />

        {/* Respiro entre logo e zona central — mantém o topo limpo */}
        <div
          className="pointer-events-none min-h-0 w-full shrink-0 grow basis-0 max-h-[min(22dvh,180px)] sm:max-h-[min(26dvh,220px)]"
          aria-hidden
        />

        {/* flex-1 + justify-end empurra CTAs + legal para a base útil do ecrã */}
        <div className="flex min-h-0 w-full flex-1 flex-col justify-end">
          <div className="shrink-0 pt-2">
            <div className="space-y-3">
              <button
                type="button"
                onClick={onStart}
                className={cn(
                  "flex min-h-[52px] w-full items-center justify-center rounded-xl bg-movApp-accent py-3.5 text-center text-base font-semibold text-white shadow-[0_10px_32px_rgba(196,92,74,0.22)] transition hover:bg-movApp-accentHover hover:shadow-[0_14px_36px_rgba(196,92,74,0.28)] active:scale-[0.99]",
                  focusRingWelcome,
                )}
              >
                Começar
              </button>
              <a
                href={movAuthChoiceHref()}
                className={cn(
                  "flex min-h-[52px] w-full items-center justify-center rounded-xl border border-movApp-border bg-movApp-paper py-3.5 text-center text-base font-semibold text-movApp-ink shadow-sm transition hover:border-movApp-accent/35 hover:bg-movApp-subtle active:scale-[0.99]",
                  focusRingWelcome,
                )}
              >
                Eu já tenho uma conta
              </a>
            </div>

            <div className="pt-5 sm:pt-6">
              <p className="px-0.5 text-center text-[9px] leading-relaxed text-movApp-muted/95 sm:text-[10px] sm:leading-relaxed">
                Ao continuar, você concorda com os{" "}
                <Link
                  href="/termos"
                  className="underline decoration-movApp-accent/45 underline-offset-[2px] hover:decoration-movApp-accent"
                >
                  Termos de Serviço
                </Link>
                ,{" "}
                <Link
                  href="/privacidade"
                  className="underline decoration-movApp-accent/45 underline-offset-[2px] hover:decoration-movApp-accent"
                >
                  Política de Privacidade
                </Link>{" "}
                e{" "}
                <Link
                  href="/diretrizes"
                  className="underline decoration-movApp-accent/45 underline-offset-[2px] hover:decoration-movApp-accent"
                >
                  Diretrizes da Comunidade
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </MovAppWelcomeBackdrop>
  );
}

type ResumeProps = {
  onClose: () => void;
  onContinue: () => void;
  onRestart: () => void;
};

export function OnboardingResumeModal({ onClose, onContinue, onRestart }: ResumeProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-movApp-ink/25 backdrop-blur-md sm:px-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="relative z-10 w-full max-w-md rounded-t-[1.25rem] border border-movApp-border bg-movApp-paper px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_48px_rgba(28,25,23,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-movApp-muted transition hover:bg-movApp-subtle hover:text-movApp-ink"
            aria-label="Fechar"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        <h2 className="text-center font-display text-xl tracking-[-0.02em] text-movApp-ink">Continuar inscrição</h2>
        <p className="mt-3 text-center text-[15px] leading-relaxed text-movApp-muted">
          Há respostas salvas neste dispositivo. Continue de onde parou ou recomece do início.
        </p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onRestart}
            className={cn(
              "min-h-[48px] flex-1 rounded-xl border border-movApp-border bg-movApp-paper py-3 text-sm font-semibold text-movApp-ink shadow-sm transition hover:bg-movApp-subtle",
              focusRingWelcome,
            )}
          >
            Reiniciar
          </button>
          <button
            type="button"
            onClick={onContinue}
            className={cn(
              "min-h-[48px] flex-1 rounded-xl bg-movApp-accent py-3 text-sm font-semibold text-white shadow-md shadow-movApp-accent/20 transition hover:bg-movApp-accentHover",
              focusRingWelcome,
            )}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

type LocationProps = {
  onBack: () => void;
  onContinue: () => void;
  onOpenCityModal: () => void;
};

export function OnboardingLocationShell({ onBack, onContinue, onOpenCityModal }: LocationProps) {
  return (
    <MovAppWelcomeBackdrop>
      <main className="relative z-10 mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6">
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={onBack}
            className={cn(
              "-ml-1 inline-flex rounded-full border border-movApp-border bg-movApp-paper p-2 text-movApp-ink shadow-sm transition hover:bg-movApp-subtle active:scale-[0.98]",
              focusRingWelcome,
            )}
            aria-label="Voltar"
          >
            <IconBack className="h-6 w-6" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-end pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-10">
          <div className="mx-auto flex w-full max-w-md flex-col gap-3">
            <button
              type="button"
              onClick={onContinue}
              className={cn(
                "flex min-h-[52px] w-full items-center justify-center rounded-xl bg-movApp-accent py-3.5 text-center text-base font-semibold text-white shadow-[0_8px_28px_rgba(196,92,74,0.25)] transition hover:bg-movApp-accentHover",
                focusRingWelcome,
              )}
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={onOpenCityModal}
              className={cn(
                "min-h-[52px] w-full rounded-xl border border-movApp-border/90 bg-movApp-subtle/50 py-3.5 text-center text-base font-semibold text-movApp-ink transition hover:border-movApp-accent/35 hover:bg-movApp-subtle/70",
                focusRingWelcome,
              )}
            >
              Mudar minha cidade
            </button>
          </div>
        </div>
      </main>
    </MovAppWelcomeBackdrop>
  );
}

type CityModalProps = {
  open: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  onPickCity: (id: string, name: string) => void;
  onClose: () => void;
};

type CityRow = { id: string; name: string; enabled: boolean };

const MODAL_CITIES: CityRow[] = [
  { id: "sp", name: "São Paulo", enabled: true },
  { id: "rj", name: "Rio de Janeiro", enabled: false },
  { id: "bh", name: "Belo Horizonte", enabled: false },
];

export function CitySearchModal({ open, query, onQueryChange, onPickCity, onClose }: CityModalProps) {
  if (!open) return null;
  const q = query.trim().toLowerCase();
  const visible = MODAL_CITIES.filter((c) => {
    if (!q) return true;
    const n = c.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "");
    const qq = q.normalize("NFD").replace(/\p{M}/gu, "");
    return n.includes(qq);
  });

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-movApp-ink/30 p-4 backdrop-blur-sm sm:p-6"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="city-modal-title"
        className="flex max-h-[min(88dvh,calc(100dvh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-movApp-border/80 bg-movApp-paper/95 shadow-[0_24px_64px_rgba(28,25,23,0.18)] backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-movApp-border/60 px-4 py-3.5">
          <h2 id="city-modal-title" className="font-display text-base font-normal tracking-[-0.02em] text-movApp-ink">
            Onde você está
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-movApp-muted transition hover:bg-movApp-subtle hover:text-movApp-ink"
            aria-label="Fechar"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        <div className="shrink-0 px-4 pb-2 pt-4">
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar cidade"
            className="w-full rounded-xl border border-movApp-border/90 bg-movApp-paper/50 px-4 py-3 text-[15px] text-movApp-ink shadow-inner shadow-movApp-ink/5 outline-none placeholder:text-movApp-muted/60 focus:border-movApp-accent focus:ring-2 focus:ring-movApp-accent/35"
            autoComplete="off"
          />
        </div>
        <ul className="overflow-y-auto overscroll-contain px-4 pb-4 pt-1 [max-height:min(52dvh,calc(88dvh-11rem))]">
          {visible.map((c) => (
            <li key={c.id} className="mb-2 last:mb-0">
              <button
                type="button"
                disabled={!c.enabled}
                onClick={() => {
                  if (c.enabled) onPickCity(c.id, c.name);
                }}
                className={cn(
                  "flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-[15px] font-medium transition",
                  c.enabled
                    ? cn(
                        "border-movApp-border/70 bg-movApp-paper/40 text-movApp-ink hover:border-movApp-accent/30 hover:bg-movApp-subtle/60",
                        focusRingWelcome,
                      )
                    : "cursor-not-allowed border-movApp-border/40 border-dashed bg-movApp-subtle/30 text-movApp-muted/90",
                )}
              >
                <span className={cn(!c.enabled && "text-movApp-muted")}>{c.name}</span>
                {!c.enabled && (
                  <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-movApp-muted">
                    Em breve
                  </span>
                )}
              </button>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="px-2 py-8 text-center text-sm leading-relaxed text-movApp-muted">
              Nenhum resultado para essa busca.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

/* —— Topo só com voltar (sem secção, contador nem barra de progresso) —— */

export function OnboardingBackHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="sticky top-0 z-20 bg-movApp-paper/95 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-start">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "-ml-1 inline-flex rounded-full border border-movApp-border bg-movApp-paper p-2 text-movApp-ink shadow-sm transition hover:bg-movApp-subtle active:scale-[0.98]",
            focusRingWelcome,
          )}
          aria-label="Voltar"
        >
          <IconBack className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}

type QuestionProps = {
  step: OnboardingStep;
  selectedValue?: string;
  onSelect: (value: string) => void;
  onBack: () => void;
};

export function QuestionStepView({ step, selectedValue, onSelect, onBack }: QuestionProps) {
  if (step.kind !== "single" || !step.options) return null;

  return (
    <MovAppWelcomeBackdrop>
      <div className="flex min-h-[100dvh] flex-col">
        <OnboardingBackHeader onBack={onBack} />

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-6">
          <div className="shrink-0">
            <div className="mb-4 h-px w-12 rounded-full bg-gradient-to-r from-movApp-accent/70 to-transparent" aria-hidden />
            <h2 className="text-balance font-display text-[1.4rem] font-normal leading-[1.2] tracking-[-0.03em] text-movApp-ink sm:text-[1.5rem]">
              {step.title}
            </h2>
            {step.subtitle && <p className="mt-3 text-[15px] leading-relaxed text-movApp-muted">{step.subtitle}</p>}
          </div>

          <div className="mt-10 flex flex-col gap-3.5">
            {step.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSelect(opt.value)}
                className={cn(
                  "min-h-[52px] text-[15px] font-medium leading-snug transition active:scale-[0.99]",
                  selectedValue === opt.value ? cardOptionSelectedLight : cardOptionLight,
                )}
              >
                <span>{opt.label}</span>
                {opt.hint && (
                  <span
                    className={cn(
                      "mt-1 block text-xs font-normal leading-relaxed",
                      selectedValue === opt.value ? "text-movApp-ink/75" : "text-movApp-muted",
                    )}
                  >
                    {opt.hint}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </MovAppWelcomeBackdrop>
  );
}

type ScaleProps = {
  step: OnboardingStep;
  selectedValue?: string;
  onSelect: (value: string) => void;
  onBack: () => void;
};

export function ScaleStepView({ step, selectedValue, onSelect, onBack }: ScaleProps) {
  if (step.kind !== "scale" || !step.title || !step.scaleLeftLabel || !step.scaleRightLabel) return null;

  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

  return (
    <MovAppWelcomeBackdrop>
      <div className="flex min-h-[100dvh] flex-col">
        <OnboardingBackHeader onBack={onBack} />

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-6">
          <div className="shrink-0">
            <div className="mb-4 h-px w-12 rounded-full bg-gradient-to-r from-movApp-accent/70 to-transparent" aria-hidden />
            <h2 className="text-balance font-display text-[1.4rem] font-normal leading-[1.2] tracking-[-0.03em] text-movApp-ink sm:text-[1.5rem]">
              {step.title}
            </h2>
          </div>

          <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-movApp-border bg-movApp-paper p-4 shadow-sm ring-1 ring-movApp-border/40 sm:p-5">
            <div className="flex justify-between gap-3 border-b border-movApp-border/40 pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-movApp-muted sm:text-[11px] sm:tracking-[0.14em]">
              <span className="max-w-[46%] text-left leading-snug">{step.scaleLeftLabel}</span>
              <span className="max-w-[46%] text-right leading-snug">{step.scaleRightLabel}</span>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-2.5">
              {levels.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onSelect(String(n))}
                  className={cn(
                    "flex min-h-[44px] items-center justify-center rounded-xl border text-[15px] font-semibold tabular-nums transition active:scale-[0.98] sm:min-h-[46px] sm:text-base",
                    selectedValue === String(n)
                      ? "border-movApp-accent bg-movApp-accent text-white shadow-[0_8px_24px_rgba(196,92,74,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-movApp-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-movApp-bg"
                      : "border-movApp-border/70 bg-movApp-subtle/30 text-movApp-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.03] hover:border-movApp-accent/40 hover:bg-movApp-subtle/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-movApp-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-movApp-bg",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MovAppWelcomeBackdrop>
  );
}

type InterstitialProps = {
  variant: OnboardingInterstitialVariant;
  onNext: () => void;
  onBack: () => void;
};

export function InterstitialStepView({ variant, onNext, onBack }: InterstitialProps) {
  if (variant === "score_96") {
    return (
      <MovAppWelcomeBackdrop>
        <div className="flex min-h-[100dvh] flex-col">
          <OnboardingBackHeader onBack={onBack} />
          <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
            <div className="mt-1 grid grid-cols-3 gap-2">
              <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-movApp-accent/20 via-rose-100/90 to-movApp-subtle ring-1 ring-movApp-border/40" />
              <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-stone-200/90 via-stone-100 to-movApp-bg ring-1 ring-movApp-border/40" />
              <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-emerald-100/90 via-teal-50 to-movApp-bg ring-1 ring-movApp-border/40" />
              <div className="col-span-3 -mt-0.5 flex justify-center">
                <div className="grid w-full max-w-[280px] grid-cols-2 gap-2">
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-violet-100/95 via-indigo-50 to-movApp-bg ring-1 ring-movApp-border/40" />
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-amber-100/95 via-orange-50 to-movApp-bg ring-1 ring-movApp-border/40" />
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-movApp-border bg-movApp-paper px-6 py-8 text-center shadow-[0_16px_48px_rgba(28,25,23,0.08)] ring-1 ring-movApp-border/50">
              <p className="font-display text-6xl font-semibold tracking-[-0.05em] text-movApp-accent sm:text-7xl">
                96%
              </p>
              <p className="mx-auto mt-5 max-w-sm text-[15px] leading-relaxed text-movApp-muted">
                A porcentagem de nossos grupos de jantar que se classificam como compatíveis
              </p>
            </div>

            <button
              type="button"
              onClick={onNext}
              className={cn(
                "mt-auto min-h-[52px] w-full rounded-xl bg-movApp-accent py-4 text-base font-semibold text-white shadow-[0_10px_32px_rgba(196,92,74,0.28)] transition hover:bg-movApp-accentHover active:scale-[0.99]",
                focusRingWelcome,
              )}
            >
              Próximo
            </button>
          </div>
        </div>
      </MovAppWelcomeBackdrop>
    );
  }

  return (
    <MovAppWelcomeBackdrop>
      <div className="flex min-h-[100dvh] flex-col">
        <OnboardingBackHeader onBack={onBack} />
        <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
          <div className="flex flex-1 flex-col justify-center pt-2">
            <div className="rounded-2xl border border-movApp-border bg-movApp-paper px-6 py-10 text-center shadow-[0_16px_48px_rgba(28,25,23,0.08)] ring-1 ring-movApp-border/50">
              <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-movApp-gold/[0.12] via-movApp-accent/20 to-transparent blur-2xl motion-reduce:opacity-80"
                  aria-hidden
                />
                <div
                  className="absolute inset-0 animate-pulse rounded-full bg-movApp-accent/20 blur-2xl motion-reduce:animate-none"
                  aria-hidden
                />
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-movApp-border/70 bg-movApp-paper/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-movApp-gold/15">
                  <p className="font-display text-5xl font-semibold tracking-[-0.04em] text-movApp-accent sm:text-6xl">
                    82%
                  </p>
                </div>
              </div>
              <p className="mt-8 text-[15px] font-medium leading-relaxed text-movApp-muted">
                Busca por pessoas compatíveis em andamento
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNext}
            className={cn(
              "mt-6 min-h-[52px] w-full rounded-xl bg-movApp-accent py-4 text-base font-semibold text-white shadow-[0_10px_32px_rgba(196,92,74,0.28)] transition hover:bg-movApp-accentHover active:scale-[0.99]",
              focusRingWelcome,
            )}
          >
            Continuar
          </button>
        </div>
      </div>
    </MovAppWelcomeBackdrop>
  );
}

type BirthdayProps = {
  step: OnboardingStep;
  value?: string;
  onConfirm: (isoDate: string) => void;
  onBack: () => void;
};

export function BirthdayStepView({ step, value, onConfirm, onBack }: BirthdayProps) {
  const [local, setLocal] = useState(value ?? "");

  useEffect(() => {
    setLocal(value ?? "");
  }, [value]);

  const max = new Date().toISOString().slice(0, 10);
  const min = "1920-01-01";

  return (
    <MovAppWelcomeBackdrop>
      <div className="flex min-h-[100dvh] flex-col">
        <OnboardingBackHeader onBack={onBack} />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-6">
          <h2 className="text-balance font-display text-[1.4rem] font-normal leading-[1.2] tracking-[-0.03em] text-movApp-ink sm:text-[1.5rem]">
            {step.title}
          </h2>
          {step.subtitle && <p className="mt-3 text-[15px] leading-relaxed text-movApp-muted">{step.subtitle}</p>}

          <label className="mt-10 block">
            <span className={cn(authLabelClass, "mb-2 block")}>Data de nascimento</span>
            <input
              type="date"
              value={local}
              min={min}
              max={max}
              onChange={(e) => setLocal(e.target.value)}
              className="min-h-[52px] w-full rounded-xl border border-movApp-border bg-movApp-paper px-4 py-3.5 text-[15px] text-movApp-ink shadow-[inset_0_1px_0_rgba(28,25,23,0.04)] transition [color-scheme:light] hover:border-movApp-border focus:border-movApp-accent focus:outline-none focus:ring-2 focus:ring-movApp-accent/40 focus:ring-offset-2 focus:ring-offset-movApp-bg"
            />
          </label>

          <button
            type="button"
            disabled={!local}
            onClick={() => local && onConfirm(local)}
            aria-disabled={!local}
            className={cn(
              "mt-6 min-h-[52px] w-full rounded-xl bg-movApp-accent py-4 text-base font-semibold text-white shadow-[0_10px_32px_rgba(196,92,74,0.28)] transition hover:bg-movApp-accentHover disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none",
              focusRingWelcome,
            )}
          >
            Confirmar
          </button>
        </div>
      </div>
    </MovAppWelcomeBackdrop>
  );
}

type AuthProps = {
  step: OnboardingStep;
  onBack: () => void;
};

export function AuthHandoffView({ step, onBack }: AuthProps) {
  return (
    <MovAppWelcomeBackdrop>
      <div className="flex min-h-[100dvh] flex-col">
        <OnboardingBackHeader onBack={onBack} />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6">
          <h2 className="text-balance text-center font-display text-[1.5rem] font-normal leading-[1.2] tracking-[-0.03em] text-movApp-ink sm:text-[1.65rem]">
            {step.title}
          </h2>
          {step.subtitle && <p className="mt-3 text-center text-[15px] leading-relaxed text-movApp-muted">{step.subtitle}</p>}

          <div className="mt-11 flex flex-col gap-3">
            <Link
              href="/register"
              className={cn(
                "flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-movApp-border/80 bg-movApp-subtle/40 py-4 text-center text-base font-semibold text-movApp-ink backdrop-blur-sm transition hover:border-movApp-accent/35 hover:bg-movApp-subtle/60",
                focusRingWelcome,
              )}
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Cadastre-se com o Google
            </Link>
            <Link
              href="/register"
              className={cn(
                "flex min-h-[52px] w-full items-center justify-center rounded-xl bg-movApp-accent py-4 text-center text-base font-semibold text-white shadow-[0_10px_32px_rgba(196,92,74,0.28)] transition hover:bg-movApp-accentHover",
                focusRingWelcome,
              )}
            >
              Cadastre-se com e-mail
            </Link>
          </div>

          <p className="mt-12 text-center text-sm leading-relaxed text-movApp-muted">
            Já tem conta?{" "}
            <Link
              href={movAuthChoiceHref()}
              className="font-semibold text-movApp-accent underline decoration-movApp-accent/40 underline-offset-[5px] transition hover:decoration-movApp-accent"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </MovAppWelcomeBackdrop>
  );
}
