/**
 * Classes Tailwind só para UI do painel admin (server-safe, sem "use client").
 */

export const adminFormLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.2em] text-movApp-muted";

export const adminFormInputClass =
  "min-h-[42px] w-full rounded-xl border border-movApp-border bg-movApp-paper px-3.5 py-2 text-sm text-movApp-ink shadow-[inset_0_1px_0_rgba(28,25,23,0.04)] ring-1 ring-movApp-border/25 transition " +
  "placeholder:text-movApp-muted/55 hover:border-movApp-border focus:border-movApp-accent focus:outline-none focus:ring-2 focus:ring-movApp-accent/30";

export const adminCardClass =
  "rounded-2xl border border-movApp-border bg-movApp-paper shadow-[0_2px_0_0_rgba(28,25,23,0.04),0_12px_40px_rgba(28,25,23,0.06)] ring-1 ring-movApp-border/35";

export const adminSectionTitleClass = "font-display text-lg font-semibold tracking-tight text-movApp-ink";

export const adminPrimaryButtonClass =
  "inline-flex min-h-[42px] items-center justify-center rounded-xl bg-movApp-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-movApp-accent";

export const adminSecondaryButtonClass =
  "inline-flex min-h-[42px] items-center justify-center rounded-xl border border-movApp-border bg-movApp-paper px-5 py-2.5 text-sm font-medium text-movApp-ink shadow-sm ring-1 ring-movApp-border/30 transition hover:bg-movApp-subtle/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-movApp-accent";
