import { prisma } from "@/lib/prisma";
import { deriveSeMovEventKind, seMovEventKindLabel } from "@/lib/se-mov-event-kind";

/** Mesma origem que `app/agenda`: jantar Se Mov, datas futuras publicadas. */
export async function getSeMovPublishedFutureEvents() {
  const events = await prisma.event.findMany({
    where: {
      published: true,
      memberOnly: true,
      startsAt: { gte: new Date() },
    },
    orderBy: { startsAt: "asc" },
  });

  return events.map((event) => {
    const kind = deriveSeMovEventKind(event);
    return {
      id: event.id,
      startsAt: event.startsAt,
      eventKind: kind,
      displayName: seMovEventKindLabel(kind),
    };
  });
}

export async function getUserEventRegistrations(userId: string) {
  return prisma.eventRegistration.findMany({
    where: { userId, status: { not: "cancelled" } },
    select: { eventId: true, status: true },
  });
}
