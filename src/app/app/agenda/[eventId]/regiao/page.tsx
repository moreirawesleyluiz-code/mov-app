import { redirect } from "next/navigation";
import { JantarRegionForm } from "@/components/jantar-region-form";
import { isDemoJantarFlowEnabled } from "@/lib/demo-jantar";
import { SP_DINNER_REGIONS } from "@/lib/sp-regions";
import { prisma } from "@/lib/prisma";
import { requireAgendaSeMovAccess } from "@/lib/se-mov-agenda-access";

type Params = { params: Promise<{ eventId: string }> };

export default async function JantarRegiaoPage({ params }: Params) {
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

  return (
    <JantarRegionForm
      eventId={event.id}
      regions={SP_DINNER_REGIONS}
    />
  );
}
