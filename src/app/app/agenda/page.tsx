import { SeMovAgendaSlotsList } from "@/components/se-mov-agenda-slots-list";
import { isDemoJantarFlowEnabled } from "@/lib/demo-jantar";
import { prisma } from "@/lib/prisma";
import { getSeMovPublishedFutureEvents, getUserEventRegistrations } from "@/lib/se-mov-agenda-data";
import { requireAgendaSeMovAccess } from "@/lib/se-mov-agenda-access";

/** Sempre dados frescos (datas Se Mov vêm do `Event` publicado). */
export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const { userId } = await requireAgendaSeMovAccess();

  const [events, myRegs, user] = await Promise.all([
    getSeMovPublishedFutureEvents(),
    userId ? getUserEventRegistrations(userId) : Promise.resolve([]),
    userId ? prisma.user.findUnique({ where: { id: userId }, select: { city: true } }) : Promise.resolve(null),
  ]);

  const demoJantarFlow = isDemoJantarFlowEnabled();
  const cityName = user?.city?.trim() || "sua cidade";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl text-movApp-ink">Encontre pessoas em {cityName}</h1>

      <section className="mt-6 rounded-2xl border border-movApp-border bg-movApp-paper p-6 shadow-sm">
        <h2 className="font-display text-lg text-movApp-ink">O que é o Se Mov</h2>
        <p className="mt-3 text-sm leading-relaxed text-movApp-muted">
          O Se Mov é onde a vida social sai da tela, vira encontro real e você conhece gente de verdade para
          voltar a viver as experiências que fazem a vida acontecer. Aqui você pode reservar a data do rolê e
          marcar encontros semanais que transformam desconhecidos em amigos.
        </p>
      </section>

      <SeMovAgendaSlotsList
        events={events}
        registrations={myRegs}
        demoJantarFlow={demoJantarFlow}
        datesHeadingClassName="mb-4 mt-10"
      />
    </div>
  );
}
