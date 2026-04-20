import Link from "next/link";
import { MOV_ESSENCIA_NAV } from "@/lib/mov-essencia-nav";
import { cn } from "@/lib/utils";

const linkFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-movApp-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-movApp-bg";

/** Produto 3 — Server Component. */
export function MovAppHomeMovEssencia() {
  return (
    <section
      id="mov-essencia"
      className="rounded-2xl border border-movApp-border bg-movApp-paper px-5 py-6 shadow-sm ring-1 ring-movApp-border/60 sm:px-8 sm:py-7"
    >
      <h2 className="font-display text-xl leading-tight tracking-[-0.02em] text-movApp-ink sm:text-[1.35rem]">
        MOV Essência
      </h2>
      <ul className="mt-4 space-y-3">
        {MOV_ESSENCIA_NAV.map((s) => (
          <li
            key={s.slug}
            className="rounded-xl border border-movApp-border/70 bg-movApp-subtle/60 text-sm text-movApp-ink"
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2.5 p-3.5 sm:gap-3 sm:p-4">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-movApp-accent/85" aria-hidden />
                <span className="min-w-0 break-words font-medium leading-snug">{s.title}</span>
              </div>
              <Link
                href={`/app/mov-essencia/${s.slug}`}
                className={cn(
                  linkFocus,
                  "ml-auto inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-movApp-accent px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover active:scale-[0.99]",
                )}
              >
                Saiba mais
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
