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
      className="rounded-2xl border border-movApp-border bg-movApp-paper px-5 py-7 shadow-sm ring-1 ring-movApp-border/60 sm:px-8 sm:py-9"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-movApp-muted">
        Continuidade da jornada <span className="text-movApp-accent/90">· Produto 3</span>
      </p>
      <h2 className="mt-2 font-display text-xl leading-tight tracking-[-0.02em] text-movApp-ink sm:text-[1.35rem]">
        MOV Essência
      </h2>
      <p className="mt-3 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-movApp-ink">
        Autoconhecimento, intimidade e relações conscientes.
      </p>
      <p className="mt-4 max-w-2xl border-l-2 border-movApp-gold/45 pl-4 text-pretty text-sm italic leading-relaxed text-movApp-ink/95">
        Depois da conexão, vem a profundidade.
      </p>
      <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-movApp-muted">
        Uma frente da MOV dedicada ao aprofundamento das relações, da intimidade e do desenvolvimento pessoal por meio de
        experiências e serviços especializados — em continuidade com o que você já viveu com a gente.
      </p>
      <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.18em] text-movApp-muted">Serviços nesta frente</p>
      <ul className="mt-3 space-y-3">
        {MOV_ESSENCIA_NAV.map((s) => (
          <li
            key={s.slug}
            className="rounded-xl border border-movApp-border/70 bg-movApp-subtle/60 text-sm text-movApp-ink"
          >
            <div className="flex min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-movApp-accent/85" aria-hidden />
                <span className="min-w-0 break-words pt-0.5 font-medium leading-snug">{s.title}</span>
              </div>
              <Link
                href={`/app/mov-essencia/${s.slug}`}
                className={cn(
                  linkFocus,
                  "inline-flex h-10 w-full shrink-0 items-center justify-center rounded-xl bg-movApp-accent px-4 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover active:scale-[0.995] sm:w-auto sm:min-w-[7.5rem]",
                )}
              >
                Saiba mais
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-[11px] font-medium tracking-[0.12em] text-movApp-muted">
        Conexão → encontro → profundidade
      </p>
    </section>
  );
}
