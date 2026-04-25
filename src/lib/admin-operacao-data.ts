import { prisma } from "@/lib/prisma";

export type AdminOperacaoProductKey = "se_mov" | "speed_dating" | "outros";

export type AdminOperacaoFilters = {
  q?: string;
  produto?: "all" | AdminOperacaoProductKey;
  assinatura?: "all" | "active" | "canceled" | "past_due" | "sem_assinatura";
  inscricao?: "all" | "confirmed" | "waitlist" | "cancelled" | "sem_inscricao";
  cobranca?: "all" | "RECEIVED" | "PENDING" | "CONFIRMED" | "OVERDUE" | "sem_cobranca";
};

export type AdminOperacaoRow = {
  userId: string;
  userName: string | null;
  userEmail: string;
  city: string | null;
  role: string;
  subscriptionStatus: string | null;
  subscriptionPlanCode: string | null;
  subscriptionStartedAt: Date | null;
  subscriptionRenewsAt: Date | null;
  subscriptionCanceledAt: Date | null;
  product: AdminOperacaoProductKey;
  productLabel: string;
  eventId: string | null;
  eventTitle: string | null;
  eventMemberOnly: boolean | null;
  eventType: string | null;
  registrationStatus: string | null;
  registrationCreatedAt: Date | null;
  registrationRegionKey: string | null;
  chargeStatus: string | null;
  chargeMethod: string | null;
  chargeValueCents: number | null;
  chargeCreatedAt: Date | null;
};

function classifyProduct(event: { memberOnly: boolean; type: string } | null): {
  key: AdminOperacaoProductKey;
  label: string;
} {
  if (!event) return { key: "outros", label: "Outros" };
  if (event.memberOnly) return { key: "se_mov", label: "Se Mov" };
  if (event.type === "CLASSICO" || event.type === "SENSORIAL" || event.type === "EXCLUSIVO") {
    return { key: "speed_dating", label: "Speed Dating" };
  }
  return { key: "outros", label: "Outros" };
}

function normalizeFilters(filters: AdminOperacaoFilters): Required<AdminOperacaoFilters> {
  return {
    q: filters.q?.trim() ?? "",
    produto: filters.produto ?? "all",
    assinatura: filters.assinatura ?? "all",
    inscricao: filters.inscricao ?? "all",
    cobranca: filters.cobranca ?? "all",
  };
}

export async function loadAdminOperacaoRows(
  inputFilters: AdminOperacaoFilters,
): Promise<AdminOperacaoRow[]> {
  const filters = normalizeFilters(inputFilters);

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      role: true,
      subscription: {
        select: {
          status: true,
          planCode: true,
          startedAt: true,
          renewsAt: true,
          canceledAt: true,
        },
      },
      registrations: {
        select: {
          eventId: true,
          status: true,
          createdAt: true,
          regionKey: true,
          event: {
            select: {
              id: true,
              title: true,
              memberOnly: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      asaasPayments: {
        select: {
          eventId: true,
          asaasStatus: true,
          paymentMethod: true,
          valueCents: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              title: true,
              memberOnly: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const rows: AdminOperacaoRow[] = [];
  for (const user of users) {
    const registrationByEvent = new Map<string, typeof user.registrations>();
    for (const reg of user.registrations) {
      const list = registrationByEvent.get(reg.eventId) ?? [];
      list.push(reg);
      registrationByEvent.set(reg.eventId, list);
    }

    const chargeByEvent = new Map<string, typeof user.asaasPayments>();
    for (const charge of user.asaasPayments) {
      const list = chargeByEvent.get(charge.eventId) ?? [];
      list.push(charge);
      chargeByEvent.set(charge.eventId, list);
    }

    const eventIds = new Set<string>([
      ...registrationByEvent.keys(),
      ...chargeByEvent.keys(),
    ]);

    if (eventIds.size === 0) {
      rows.push({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        city: user.city,
        role: user.role,
        subscriptionStatus: user.subscription?.status ?? null,
        subscriptionPlanCode: user.subscription?.planCode ?? null,
        subscriptionStartedAt: user.subscription?.startedAt ?? null,
        subscriptionRenewsAt: user.subscription?.renewsAt ?? null,
        subscriptionCanceledAt: user.subscription?.canceledAt ?? null,
        product: "outros",
        productLabel: "Outros",
        eventId: null,
        eventTitle: null,
        eventMemberOnly: null,
        eventType: null,
        registrationStatus: null,
        registrationCreatedAt: null,
        registrationRegionKey: null,
        chargeStatus: null,
        chargeMethod: null,
        chargeValueCents: null,
        chargeCreatedAt: null,
      });
      continue;
    }

    for (const eventId of eventIds) {
      const regs = registrationByEvent.get(eventId) ?? [];
      const charges = chargeByEvent.get(eventId) ?? [];
      const maxRows = Math.max(regs.length, charges.length, 1);

      for (let i = 0; i < maxRows; i++) {
        const reg = regs[i] ?? null;
        const charge = charges[i] ?? null;
        const event = reg?.event ?? charge?.event ?? null;
        const product = classifyProduct(event);

        rows.push({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          city: user.city,
          role: user.role,
          subscriptionStatus: user.subscription?.status ?? null,
          subscriptionPlanCode: user.subscription?.planCode ?? null,
          subscriptionStartedAt: user.subscription?.startedAt ?? null,
          subscriptionRenewsAt: user.subscription?.renewsAt ?? null,
          subscriptionCanceledAt: user.subscription?.canceledAt ?? null,
          product: product.key,
          productLabel: product.label,
          eventId: event?.id ?? eventId,
          eventTitle: event?.title ?? null,
          eventMemberOnly: event?.memberOnly ?? null,
          eventType: event?.type ?? null,
          registrationStatus: reg?.status ?? null,
          registrationCreatedAt: reg?.createdAt ?? null,
          registrationRegionKey: reg?.regionKey ?? null,
          chargeStatus: charge?.asaasStatus ?? null,
          chargeMethod: charge?.paymentMethod ?? null,
          chargeValueCents: charge?.valueCents ?? null,
          chargeCreatedAt: charge?.createdAt ?? null,
        });
      }
    }
  }

  return rows.filter((row) => {
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const inName = (row.userName ?? "").toLowerCase().includes(q);
      const inEmail = row.userEmail.toLowerCase().includes(q);
      if (!inName && !inEmail) return false;
    }

    if (filters.produto !== "all" && row.product !== filters.produto) return false;

    if (filters.assinatura !== "all") {
      if (filters.assinatura === "sem_assinatura") {
        if (row.subscriptionStatus !== null) return false;
      } else if (row.subscriptionStatus !== filters.assinatura) {
        return false;
      }
    }

    if (filters.inscricao !== "all") {
      if (filters.inscricao === "sem_inscricao") {
        if (row.registrationStatus !== null) return false;
      } else if (row.registrationStatus !== filters.inscricao) {
        return false;
      }
    }

    if (filters.cobranca !== "all") {
      if (filters.cobranca === "sem_cobranca") {
        if (row.chargeStatus !== null) return false;
      } else if (row.chargeStatus !== filters.cobranca) {
        return false;
      }
    }

    return true;
  });
}
