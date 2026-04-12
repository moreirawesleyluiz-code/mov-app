import Link from "next/link";
import { SeMovAgendaSlotsList } from "@/components/se-mov-agenda-slots-list";
import { auth } from "@/auth";
import { isDemoJantarFlowEnabled } from "@/lib/demo-jantar";
import { getSeMovPublishedFutureEvents, getUserEventRegistrations } from "@/lib/se-mov-agenda-data";

/** Dados alinhados à agenda do Se Mov — atualizar em tempo real. */
export const dynamic = "force-dynamic";

/**
 * Espelho da agenda Se Mov (mesmos cards/CTA que `/app/agenda`).
 * Para incluir Speed Dating no futuro: mesma lista visual; acrescentar query `memberOnly: false` e secção ou índice por frente.
 */
export default async function AppEventosPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [events, myRegs] = await Promise.all([
    getSeMovPublishedFutureEvents(),
    userId ? getUserEventRegistrations(userId) : Promise.resolve([]),
  ]);

  const demoJantarFlow = isDemoJantarFlowEnabled();

  return (
    <div className="mx-auto max-w-2xl pb-4 font-sans text-movApp-ink sm:pb-6">
      <p className="text-sm uppercase tracking-[0.15em] text-movApp-accent">Eventos</p>
      <h1 className="mt-2 font-display text-3xl text-movApp-ink">Agenda</h1>
      <p className="mt-3 text-sm leading-relaxed text-movApp-muted">
        Mesmas datas e reservas que em{" "}
        <Link
          href="/app/agenda"
          className="font-medium text-movApp-accent underline decoration-movApp-accent/45 underline-offset-2 hover:decoration-movApp-accent"
        >
          Agenda do jantar
        </Link>
        .
      </p>

      <SeMovAgendaSlotsList
        events={events}
        registrations={myRegs}
        demoJantarFlow={demoJantarFlow}
        datesHeadingClassName="mb-4 mt-8"
      />
    </div>
  );
}
