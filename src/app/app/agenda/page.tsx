import { SeMovAgendaSlotsList } from "@/components/se-mov-agenda-slots-list";
import { isDemoJantarFlowEnabled } from "@/lib/demo-jantar";
import { getSeMovPublishedFutureEvents, getUserEventRegistrations } from "@/lib/se-mov-agenda-data";
import { requireAgendaSeMovAccess } from "@/lib/se-mov-agenda-access";

export default async function AgendaPage() {
  const { userId } = await requireAgendaSeMovAccess();

  const [events, myRegs] = await Promise.all([
    getSeMovPublishedFutureEvents(),
    userId ? getUserEventRegistrations(userId) : Promise.resolve([]),
  ]);

  const demoJantarFlow = isDemoJantarFlowEnabled();

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm uppercase tracking-[0.15em] text-movApp-accent">Jantar</p>
      <h1 className="mt-2 font-display text-3xl text-movApp-ink">Reserve o seu próximo jantar</h1>

      <section className="mt-8 rounded-2xl border border-movApp-border bg-movApp-paper p-6 shadow-sm">
        <h2 className="font-display text-lg text-movApp-ink">O que é o Se Mov</h2>
        <p className="mt-3 text-sm leading-relaxed text-movApp-muted">
          O <strong className="font-medium text-movApp-ink">Se Mov</strong> é a assinatura da MOV:
          você entra no ecossistema de{" "}
          <strong className="font-medium text-movApp-ink">encontros reais</strong> com curadoria e
          segurança emocional. O propósito é ir além do aplicativo tradicional — começar pelo jantar
          com pessoas novas e construir vínculos com intenção.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-movApp-muted">
          <strong className="font-medium text-movApp-ink">Este app</strong> serve para você reservar
          a <strong className="font-medium text-movApp-ink">data do seu jantar</strong>. Combinados,
          avisos e conversa da comunidade ficam no{" "}
          <strong className="font-medium text-movApp-ink">WhatsApp</strong> — não exibimos esse fluxo
          aqui.
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
