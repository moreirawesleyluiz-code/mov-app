"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type HeroProps = {
  firstName?: string;
};

const linkFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-movApp-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-movApp-bg";

export function MovAppHomeHero({ firstName }: HeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-movApp-border/90",
        "bg-gradient-to-br from-movApp-paper via-movApp-subtle to-[#ebe6df]",
        "shadow-[0_2px_0_0_rgba(196,92,74,0.08),0_20px_48px_rgba(28,25,23,0.08)]",
        "px-5 py-7 sm:px-8 sm:py-9",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-grid-pattern-light opacity-50 [background-size:24px_24px]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-movApp-accent/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-movApp-gold/10 blur-3xl" aria-hidden />

      <div className="relative">
        <h1 className="font-display text-[1.75rem] font-normal leading-[1.12] tracking-[-0.03em] text-movApp-ink sm:text-[2.1rem]">
          Olá{firstName ? `, ${firstName}` : ""}
        </h1>
      </div>
    </section>
  );
}

export function MovAppHomeSpeedDating() {
  return (
    <section className="rounded-2xl border border-movApp-border bg-movApp-paper p-6 shadow-sm sm:p-8">
      <h2 className="font-display text-xl leading-tight tracking-[-0.02em] text-movApp-ink sm:text-[1.35rem]">
        Speed Dating
      </h2>
      <p className="mt-4 font-display text-[1.03rem] leading-[1.15] tracking-[-0.03em] whitespace-nowrap text-movApp-ink sm:text-[1.28rem]">
        O primeiro encontro às cegas do Brasil.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-movApp-muted sm:text-[15px]">
        Encontros presenciais para quem busca profundidade nas relações e conexão de verdade.
      </p>
      <div className="mt-8 sm:mt-9">
        <Link
          href="/app/experiencias"
          className={cn(
            linkFocus,
            "inline-flex h-12 w-full min-w-0 items-center justify-center rounded-xl bg-movApp-accent px-5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover active:scale-[0.995] sm:w-auto sm:min-w-[15rem] sm:px-6",
          )}
        >
          Quero Participar
        </Link>
      </div>
    </section>
  );
}
