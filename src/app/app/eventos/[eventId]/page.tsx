import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ eventId: string }> };

function eventNextStep(event: { id: string; memberOnly: boolean; type: string }) {
  if (event.memberOnly) {
    return { href: `/app/agenda/${event.id}/regiao`, label: "Inscrever-me" };
  }
  if (event.type === "CLASSICO" || event.type === "SENSORIAL" || event.type === "EXCLUSIVO") {
    return { href: "/app/experiencias", label: "Ir para Speed Dating" };
  }
  return { href: "/app/eventos", label: "Voltar para eventos" };
}

export default async function AppEventoTemporaryPage({ params }: Props) {
  const { eventId } = await params;
  const event = await prisma.event.findFirst({
    where: { id: eventId, published: true },
    select: { id: true, title: true, startsAt: true, memberOnly: true, type: true, description: true },
  });
  if (!event) notFound();

  const nextStep = eventNextStep(event);
  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(event.startsAt);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <Link
          href="/app/eventos"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-movApp-border bg-movApp-paper px-3 text-sm font-medium text-movApp-ink"
        >
          <span aria-hidden>←</span>
          Voltar para eventos
        </Link>
      </div>

      <section className="rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-movApp-muted">Pré-visualização</p>
        <h1 className="mt-2 font-display text-2xl text-movApp-ink">{event.title}</h1>
        <p className="mt-2 text-sm text-movApp-muted">{dateLabel}</p>
        {event.description ? <p className="mt-4 text-sm leading-relaxed text-movApp-ink">{event.description}</p> : null}
        <p className="mt-5 text-sm text-movApp-muted">
          A página definitiva do evento será criada em breve. Por enquanto, este destino evita redirecionamento
          incorreto e mantém a navegação consistente.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={nextStep.href}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-movApp-accent px-4 text-sm font-medium text-white"
          >
            {nextStep.label}
          </Link>
          <Link
            href="/app/eventos"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-movApp-border px-4 text-sm font-medium text-movApp-ink"
          >
            Voltar
          </Link>
        </div>
      </section>
    </div>
  );
}
