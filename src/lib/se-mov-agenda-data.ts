import { prisma } from "@/lib/prisma";

/** Mesma origem que `app/agenda`: jantar Se Mov, datas futuras publicadas. */
export async function getSeMovPublishedFutureEvents() {
  return prisma.event.findMany({
    where: {
      published: true,
      memberOnly: true,
      startsAt: { gte: new Date() },
    },
    orderBy: { startsAt: "asc" },
  });
}

export async function getUserEventRegistrations(userId: string) {
  return prisma.eventRegistration.findMany({
    where: { userId, status: { not: "cancelled" } },
    select: { eventId: true, status: true },
  });
}
