import { prisma } from "@/lib/prisma";

/**
 * Status Asaas a considerar como pago o suficiente para inscrição (MVP; Pix pessoa física pode
 * demorar em alguns raros estados; refine em operação com suporte Asaas se necessário).
 */
export function isAsaasSettledForRegistration(status: string | undefined | null): boolean {
  if (!status) return false;
  // RECEIVED = crédito confirmado; CONFIRMED aparece nalguns passos (incl. estados provisórios)
  return status === "RECEIVED" || status === "CONFIRMED" || status === "RECEIVED_IN_CASH";
}

type ConfirmArgs = {
  movPaymentId: string;
  asaasStatus: string;
  userId: string;
  eventId: string;
};

/**
 * Garante `EventRegistration` após cobrança aprovada (capacidade / lista de espera a espelha o register).
 */
export async function applyRegistrationAfterSettledPayment(args: ConfirmArgs): Promise<
  | { ok: true; registrationStatus: "confirmed" | "waitlist" | null }
  | { ok: false; error: string }
> {
  const { movPaymentId, asaasStatus, userId, eventId } = args;

  return prisma.$transaction(async (tx) => {
    await tx.asaasPayment.update({
      where: { id: movPaymentId },
      data: { asaasStatus },
    });

    if (!isAsaasSettledForRegistration(asaasStatus)) {
      return { ok: true, registrationStatus: null } as const;
    }

    const rec = await tx.asaasPayment.findFirst({
      where: { id: movPaymentId, userId, eventId },
    });
    if (!rec) return { ok: false, error: "Cobrança não encontrada." } as const;

    const event = await tx.event.findFirst({ where: { id: eventId } });
    if (!event) return { ok: false, error: "Evento não encontrado." } as const;

    const count = await tx.eventRegistration.count({
      where: { eventId, status: { not: "cancelled" } },
    });

    const isFull = event.capacity != null && count >= event.capacity;

    if (isFull) {
      await tx.eventRegistration.upsert({
        where: { userId_eventId: { userId, eventId } },
        create: {
          userId,
          eventId,
          status: "waitlist",
          regionKey: rec.regionKey,
        },
        update: {
          status: "waitlist",
          regionKey: rec.regionKey,
        },
      });
      return { ok: true, registrationStatus: "waitlist" as const };
    }

    await tx.eventRegistration.upsert({
      where: { userId_eventId: { userId, eventId } },
      create: {
        userId,
        eventId,
        status: "confirmed",
        regionKey: rec.regionKey,
      },
      update: {
        status: "confirmed",
        regionKey: rec.regionKey,
      },
    });
    return { ok: true, registrationStatus: "confirmed" as const };
  });
}
