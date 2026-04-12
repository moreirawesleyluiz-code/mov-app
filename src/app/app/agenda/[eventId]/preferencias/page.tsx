import { redirect } from "next/navigation";
import { JantarPreferenciasForm } from "@/components/jantar-preferencias-form";
import { isDemoJantarFlowEnabled } from "@/lib/demo-jantar";
import { isValidRegionKey } from "@/lib/sp-regions";
import { prisma } from "@/lib/prisma";
import { requireAgendaSeMovAccess } from "@/lib/se-mov-agenda-access";

type Props = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ regionKey?: string }>;
};

export default async function JantarPreferenciasPage({ params, searchParams }: Props) {
  const { eventId } = await params;
  const sp = await searchParams;
  const regionKey = sp.regionKey;

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

  if (!regionKey || !isValidRegionKey(regionKey)) {
    redirect(`/app/agenda/${eventId}/regiao`);
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

  return <JantarPreferenciasForm eventId={event.id} regionKey={regionKey} />;
}
