import Link from "next/link";
import type { ReactNode } from "react";

/** Páginas legais públicas — mesmo vocabulário visual da entrada (movApp). */
export function PublicLegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-movApp-bg px-4 py-10 text-movApp-ink antialiased [color-scheme:light] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm font-medium text-movApp-accent underline-offset-2 hover:underline"
        >
          ← Voltar ao início
        </Link>
        <h1 className="mt-8 font-display text-3xl font-normal tracking-[-0.02em] text-movApp-ink">{title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-movApp-muted">{children}</div>
      </div>
    </div>
  );
}
