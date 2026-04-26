import Link from "next/link";
import { movEssenciaWhatsappHref } from "@/lib/mov-essencia-whatsapp";

const linkFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-movApp-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-movApp-bg";

const cardSurface =
  "rounded-2xl border border-movApp-border bg-movApp-paper shadow-sm ring-1 ring-movApp-border/60";

export type MovEssenciaDetailProps =
  | {
      title: string;
      narrativeParagraphs: string[];
    }
  | {
      title: string;
      subtitle: string;
      description: string;
      indicado: string;
      comoFunciona: string;
      beneficios: string;
    };

/** Página de serviço MOV Essência — Server Component mínimo (só `next/link`). */
export function MovEssenciaServiceDetail(props: MovEssenciaDetailProps) {
  if ("narrativeParagraphs" in props) {
    const { title, narrativeParagraphs } = props;
    const whatsappHref = movEssenciaWhatsappHref(title);

    return (
      <main
        id="mov-essencia-servico"
        className="mx-auto min-w-0 w-full max-w-3xl space-y-8 overflow-x-clip pb-10 font-sans text-movApp-ink sm:space-y-10 sm:pb-12"
      >
        <section
          className={`${cardSurface} relative overflow-hidden bg-gradient-to-br from-movApp-paper via-movApp-subtle/90 to-[#ebe6df] px-5 py-7 sm:px-8 sm:py-9`}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-grid-pattern-light opacity-40 [background-size:24px_24px]"
            aria-hidden
          />
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-movApp-accent/12 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-movApp-gold/10 blur-3xl" aria-hidden />

          <div className="relative">
            <h1 className="font-display text-[1.65rem] font-normal leading-[1.12] tracking-[-0.03em] text-movApp-ink sm:text-[2rem]">
              {title}
            </h1>
            <Link
              href="/app#mov-essencia"
              className={`${linkFocus} mt-6 inline-flex max-w-full min-h-[44px] items-center gap-2 break-words rounded-xl border border-movApp-border/80 bg-movApp-paper/90 px-4 py-2.5 text-sm font-semibold text-movApp-accent shadow-sm backdrop-blur-sm transition hover:border-movApp-accent/35 hover:bg-white`}
            >
              <span aria-hidden>←</span> Voltar ao MOV Essência
            </Link>
          </div>
        </section>

        <article className={`${cardSurface} p-6 sm:p-8`}>
          <div className="space-y-5 text-pretty text-[15px] leading-relaxed text-movApp-ink sm:text-base">
            {narrativeParagraphs.map((block, i) => (
              <p key={i}>{block}</p>
            ))}
          </div>
        </article>

        <div className="border-t border-movApp-border pt-8 sm:pt-10">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkFocus} inline-flex min-h-[3rem] w-full items-center justify-center rounded-xl bg-[#25D366] px-4 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#20BD5A] active:scale-[0.995]`}
          >
            💬 Falar com o especialista no WhatsApp
          </a>
        </div>
      </main>
    );
  }

  const { title, subtitle, description, indicado, comoFunciona, beneficios } = props;

  return (
    <main
      id="mov-essencia-servico"
      className="mx-auto min-w-0 w-full max-w-3xl space-y-8 overflow-x-clip pb-4 font-sans text-movApp-ink sm:space-y-10 sm:pb-6"
    >
      <section
        className={`${cardSurface} relative overflow-hidden bg-gradient-to-br from-movApp-paper via-movApp-subtle/90 to-[#ebe6df] px-5 py-7 sm:px-8 sm:py-9`}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-grid-pattern-light opacity-40 [background-size:24px_24px]"
          aria-hidden
        />
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-movApp-accent/12 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-movApp-gold/10 blur-3xl" aria-hidden />

        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-movApp-muted">
            MOV Essência <span className="text-movApp-accent/90">· Serviço</span>
          </p>
          <h1 className="mt-3 font-display text-[1.65rem] font-normal leading-[1.12] tracking-[-0.03em] text-movApp-ink sm:text-[2rem]">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-movApp-ink sm:text-[15px]">
            {subtitle}
          </p>
          <Link
            href="/app#mov-essencia"
            className={`${linkFocus} mt-6 inline-flex max-w-full min-h-[44px] items-center gap-2 break-words rounded-xl border border-movApp-border/80 bg-movApp-paper/90 px-4 py-2.5 text-sm font-semibold text-movApp-accent shadow-sm backdrop-blur-sm transition hover:border-movApp-accent/35 hover:bg-white`}
          >
            <span aria-hidden>←</span> Voltar ao MOV Essência
          </Link>
        </div>
      </section>

      <div className="space-y-5 sm:space-y-6">
        <ContentCard label="Descrição" text={description} />
        <ContentCard label="Para quem é indicado" text={indicado} />
        <ContentCard label="Como funciona" text={comoFunciona} />
        <ContentCard label="Benefícios esperados" text={beneficios} />
      </div>

      <section className={`${cardSurface} px-5 py-6 sm:px-8 sm:py-7`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          <Link
            href="/app#mov-essencia"
            className={`${linkFocus} inline-flex h-12 min-h-[48px] w-full shrink-0 items-center justify-center rounded-xl border border-movApp-border bg-movApp-subtle/50 px-5 text-center text-sm font-semibold text-movApp-ink shadow-sm transition hover:border-movApp-accent/30 hover:bg-movApp-subtle sm:w-auto sm:min-w-[14rem]`}
          >
            Voltar ao MOV Essência
          </Link>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex h-12 min-h-[48px] w-full shrink-0 cursor-not-allowed items-center justify-center rounded-xl border border-movApp-border/80 bg-movApp-bg px-5 text-sm font-semibold text-movApp-muted opacity-90 shadow-inner sm:w-auto sm:min-w-[14rem]"
          >
            Tenho interesse
          </button>
        </div>
      </section>
    </main>
  );
}

function ContentCard({ label, text }: { label: string; text: string }) {
  return (
    <article className={`${cardSurface} p-6 sm:p-8`}>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-movApp-muted">{label}</h2>
      <p className="mt-3 text-pretty text-[15px] leading-relaxed text-movApp-ink sm:text-base">{text}</p>
    </article>
  );
}
