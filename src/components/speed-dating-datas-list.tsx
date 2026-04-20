import Link from "next/link";
import type { Event } from "@prisma/client";
import { ArrowBackIcon } from "@/components/conta/conta-icons";
import { formatDinnerTime, formatDinnerWeekdayDate } from "@/lib/dinner-format";
import { speedDatingVariationLabel } from "@/lib/speed-dating-public-events";

function SpeedDatingGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-6.5-4.2-8.3-8A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.3 6c-1.8 3.8-8.3 8-8.3 8Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-movApp-accent"
      />
    </svg>
  );
}

export function SpeedDatingDatasList({
  events,
  fallbackHref,
}: {
  events: Event[];
  /** Tela 1 do fluxo Speed Dating (`O que é o Speed Dating?`), ex.: `/app/ex`. */
  fallbackHref: string;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl pb-2">
      <Link
        href={fallbackHref}
        className="mb-1 inline-flex h-10 items-center gap-1.5 rounded-xl px-1.5 text-sm font-medium text-movApp-muted transition hover:bg-movApp-subtle hover:text-movApp-ink"
        aria-label="Voltar"
      >
        <ArrowBackIcon className="shrink-0" />
        <span>Voltar</span>
      </Link>
      <h1 className="mt-2 font-display text-3xl leading-tight tracking-[-0.02em] text-movApp-ink md:text-4xl">
        Próximas datas
      </h1>
      <ul className="mt-6 flex flex-col gap-3 sm:mt-7">
        {events.length === 0 ? (
          <li className="rounded-2xl border border-movApp-border bg-movApp-subtle/80 p-8 text-center text-sm text-movApp-muted">
            Nenhuma data disponível no momento. Volte em breve.
          </li>
        ) : (
          events.map((ev) => {
            const start = new Date(ev.startsAt);
            return (
              <li key={ev.id}>
                <Link
                  href={`/app/ex/datas/${ev.id}/regiao`}
                  className="group flex items-center gap-3 rounded-2xl border border-movApp-border bg-movApp-paper p-4 shadow-sm transition hover:border-movApp-border/90 hover:shadow-md"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-movApp-accentSoft ring-1 ring-movApp-accent/25">
                    <SpeedDatingGlyph />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold leading-snug text-movApp-ink">
                      {speedDatingVariationLabel(ev.type)}
                    </p>
                    <p className="mt-0.5 truncate text-base font-bold text-movApp-ink">{formatDinnerWeekdayDate(start)}</p>
                    <p className="text-sm text-movApp-muted">{formatDinnerTime(start)}</p>
                  </div>
                  <span
                    className="shrink-0 text-movApp-muted transition group-hover:translate-x-0.5 group-hover:text-movApp-ink"
                    aria-hidden
                  >
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                      <path
                        d="M7 4.5 12.5 10 7 15.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
