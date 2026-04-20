import { prisma } from "@/lib/prisma";

/** Tipos de evento usados para ingresso avulso / Speed Dating (não Se Mov). */
const SPEED_DATING_EVENT_TYPES = ["CLASSICO", "SENSORIAL", "EXCLUSIVO"] as const;

/** Nome da variação exibido no fluxo público Speed Dating (cards e confirmação). */
export function speedDatingVariationLabel(type: string): string {
  switch (type) {
    case "CLASSICO":
      return "Speed Dating Clássico";
    case "SENSORIAL":
      return "Speed Dating Sensorial";
    case "EXCLUSIVO":
      return "Speed Dating Exclusivo";
    default:
      return "Speed Dating";
  }
}

function dayKeySaoPaulo(isoDate: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(isoDate);
}

/** Lista de datas do fluxo público (ex.: só Clássico ou só Sensorial). */
export function speedDatingDatasListHrefForEventType(type: string): string {
  if (type === "SENSORIAL") return "/app/ex/datas/sensorial";
  return "/app/ex/datas";
}

/**
 * Próximos eventos Speed Dating publicados, ordenados por data,
 * com no máximo um evento por dia civil (America/Sao_Paulo) — evita “encavalamento”.
 * Opcionalmente filtra por tipos (ex.: só `CLASSICO` ou só `SENSORIAL`).
 */
export async function getSpeedDatingUpcomingEventsUniqueByDay(options?: {
  types?: readonly string[];
}) {
  const typeIn = options?.types?.length
    ? [...options.types]
    : [...SPEED_DATING_EVENT_TYPES];

  const rows = await prisma.event.findMany({
    where: {
      published: true,
      memberOnly: false,
      type: { in: typeIn },
      startsAt: { gte: new Date() },
    },
    orderBy: { startsAt: "asc" },
  });

  const seenDays = new Set<string>();
  const out: typeof rows = [];
  for (const ev of rows) {
    const key = dayKeySaoPaulo(ev.startsAt);
    if (seenDays.has(key)) continue;
    seenDays.add(key);
    out.push(ev);
  }
  return out;
}

export async function getSpeedDatingEventById(id: string) {
  return prisma.event.findFirst({
    where: {
      id,
      published: true,
      memberOnly: false,
      type: { in: [...SPEED_DATING_EVENT_TYPES] },
    },
  });
}
