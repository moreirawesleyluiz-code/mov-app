import { redirect } from "next/navigation";
import { JantarResumo } from "@/components/jantar-resumo";
import { isDemoJantarFlowEnabled } from "@/lib/demo-jantar";
import { prisma } from "@/lib/prisma";
import { requireAgendaSeMovAccess } from "@/lib/se-mov-agenda-access";

type Props = { params: Promise<{ eventId: string }> };

export default async function JantarResumoPage({ params }: Props) {
  const { eventId } = await params;
  const { userId } = await requireAgendaSeMovAccess();

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (
    !event ||
    !event.published ||
    !event.memberOnly ||
    event.startsAt < new Date()
  ) {
    redirect("/app/agenda");
  }

  const existing =
    userId &&
    (await prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId, eventId } },
    }));
  if (
    !isDemoJantarFlowEnabled() &&
    existing &&
    existing.status !== "cancelled"
  ) {
    redirect("/app/agenda");
  }

  return <JantarResumo eventId={event.id} />;
}
