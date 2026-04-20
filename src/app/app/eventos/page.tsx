import Link from "next/link";
import { auth } from "@/auth";
import { MOV_ESSENCIA_NAV } from "@/lib/mov-essencia-nav";
import { prisma } from "@/lib/prisma";
import { deriveSeMovEventKind, seMovEventKindLabel } from "@/lib/se-mov-event-kind";

export const dynamic = "force-dynamic";

type ProductOrigin = "SE_MOV" | "SPEED_DATING" | "MOV_ESSENCIA" | "COMUNIDADE";
type EventStatus = "upcoming" | "past" | "cancelled";

type MirrorEvent = {
  id: string;
  type: string;
  displayName: string;
  startsAt: Date;
  status: EventStatus;
  originProduct: ProductOrigin;
  routeDestination: string;
  source: "db" | "bridge";
};

const originMeta: Record<ProductOrigin, { label: string; route: string }> = {
  SE_MOV: { label: "Se Mov", route: "/app/agenda" },
  SPEED_DATING: { label: "Speed Dating", route: "/app/experiencias" },
  MOV_ESSENCIA: { label: "MOV Essência", route: "/app/mov-essencia/tantra-intimidade" },
  COMUNIDADE: { label: "Comunidade", route: "/app/comunidade" },
};

const weekDayDateFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});
const hourFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

function capFirst(value: string) {
  if (!value) return value;
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function normalizeOriginFromEvent(event: { type: string; memberOnly: boolean; title: string; slug: string }): ProductOrigin {
  if (event.memberOnly) return "SE_MOV";

  if (event.type === "CLASSICO" || event.type === "SENSORIAL" || event.type === "EXCLUSIVO") {
    return "SPEED_DATING";
  }

  if (event.type === "COMUNIDADE" || event.type === "ROLÊ") {
    return "COMUNIDADE";
  }

  const matchesEssencia = MOV_ESSENCIA_NAV.some(
    (item) => event.slug.includes(item.slug) || event.title.toLowerCase().includes(item.title.toLowerCase()),
  );
  return matchesEssencia ? "MOV_ESSENCIA" : "COMUNIDADE";
}

function guessRoute(originProduct: ProductOrigin, event: { slug: string; title: string }) {
  if (originProduct === "MOV_ESSENCIA") {
    const found = MOV_ESSENCIA_NAV.find(
      (item) => event.slug.includes(item.slug) || event.title.toLowerCase().includes(item.title.toLowerCase()),
    );
    return found ? `/app/mov-essencia/${found.slug}` : originMeta.MOV_ESSENCIA.route;
  }
  return originMeta[originProduct].route;
}

function buildBridgeEvents(now: Date): MirrorEvent[] {
  const createAt = (dayOffset: number, hour: number) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hour, 0, 0, 0);

  return [
    {
      id: "bridge-semov-jantar",
      type: "CLASSICO",
      displayName: "Jantar Se Mov",
      startsAt: createAt(3, 20),
      status: "upcoming",
      originProduct: "SE_MOV",
      routeDestination: "/app/agenda",
      source: "bridge",
    },
    {
      id: "bridge-speed-dating",
      type: "CLASSICO",
      displayName: "Speed Dating",
      startsAt: createAt(5, 20),
      status: "upcoming",
      originProduct: "SPEED_DATING",
      routeDestination: "/app/experiencias",
      source: "bridge",
    },
    {
      id: "bridge-mov-essencia",
      type: "MOV_ESSENCIA",
      displayName: "Experiência MOV Essência",
      startsAt: createAt(7, 10),
      status: "upcoming",
      originProduct: "MOV_ESSENCIA",
      routeDestination: "/app/mov-essencia/tantra-intimidade",
      source: "bridge",
    },
    {
      id: "bridge-comunidade-trilha",
      type: "COMUNIDADE",
      displayName: "Comunidade: Trilha",
      startsAt: createAt(8, 8),
      status: "upcoming",
      originProduct: "COMUNIDADE",
      routeDestination: "/app/comunidade",
      source: "bridge",
    },
    {
      id: "bridge-feedback-last",
      type: "CLASSICO",
      displayName: "Jantar Se Mov",
      startsAt: createAt(-6, 20),
      status: "past",
      originProduct: "SE_MOV",
      routeDestination: "/app/agenda",
      source: "bridge",
    },
  ];
}

function EventIcon({ originProduct }: { originProduct: ProductOrigin }) {
  const common = "h-4 w-4";
  if (originProduct === "SE_MOV") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path d="M7 3v8M10 3v8M7 7h3M8.5 11v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M15 3v9a2 2 0 0 0 2 2h0v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (originProduct === "SPEED_DATING") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path
          d="M12 20s-6.5-4.2-8.3-8A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.3 6c-1.8 3.8-8.3 8-8.3 8Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (originProduct === "MOV_ESSENCIA") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path d="M12 3v5M12 16v5M3 12h5M16 12h5M6.3 6.3l3.5 3.5M14.2 14.2l3.5 3.5M17.7 6.3l-3.5 3.5M9.8 14.2l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
      <path d="M4 18c2.5-2.8 5.2-4.2 8-4.2s5.5 1.4 8 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="9" r="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="9" r="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EventCard({ event, subtle = false }: { event: MirrorEvent; subtle?: boolean }) {
  const dateLabel = capFirst(weekDayDateFmt.format(event.startsAt));
  const timeLabel = hourFmt.format(event.startsAt);
  const cardBase =
    "group flex items-center gap-3.5 rounded-2xl border p-4 transition sm:px-4.5 sm:py-4.5";
  const cardTone = subtle
    ? "border-movApp-border/60 bg-movApp-subtle/35 hover:border-movApp-border"
    : "border-movApp-border bg-movApp-paper shadow-sm hover:border-movApp-border/90 hover:shadow";

  return (
    <Link href={event.routeDestination} className={`${cardBase} ${cardTone}`} data-starts-at={event.startsAt.toISOString()}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-movApp-accent/12 text-movApp-accent">
        <EventIcon originProduct={event.originProduct} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.13em] text-movApp-muted">
          {originMeta[event.originProduct].label}
        </span>
        <span className="mt-0.5 block truncate text-[0.96rem] font-medium leading-snug text-movApp-ink">{event.displayName}</span>
        <span className="mt-1.5 block text-sm font-semibold leading-tight text-movApp-ink">{dateLabel}</span>
        <span className="mt-0.5 block text-xs leading-tight text-movApp-muted">{timeLabel}</span>
      </span>

      <span className="shrink-0 text-movApp-muted transition group-hover:translate-x-0.5 group-hover:text-movApp-ink" aria-hidden>
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <path d="M7 4.5 12.5 10 7 15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}

export default async function AppEventosPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [dbEvents, myRegs] = await Promise.all([
    prisma.event.findMany({
      where: { published: true },
      orderBy: { startsAt: "asc" },
    }),
    userId
      ? prisma.eventRegistration.findMany({
          where: { userId, status: { not: "cancelled" } },
          select: { eventId: true, status: true },
        })
      : Promise.resolve([]),
  ]);

  const registrationByEventId = new Map(myRegs.map((r) => [r.eventId, r.status]));
  const now = new Date();

  const normalizedDbEvents: MirrorEvent[] = dbEvents.map((event) => {
    const originProduct = normalizeOriginFromEvent(event);
    const regStatus = registrationByEventId.get(event.id);
    const status: EventStatus =
      regStatus === "cancelled" ? "cancelled" : event.startsAt < now ? "past" : "upcoming";
    const displayName =
      originProduct === "SE_MOV" ? seMovEventKindLabel(deriveSeMovEventKind(event)) : event.title;

    return {
      id: event.id,
      type: event.type,
      displayName,
      startsAt: event.startsAt,
      status,
      originProduct,
      routeDestination: guessRoute(originProduct, event),
      source: "db",
    };
  });

  const bridgeEvents = buildBridgeEvents(now);
  const coveredUpcomingOrigins = new Set(
    normalizedDbEvents.filter((event) => event.status === "upcoming").map((event) => event.originProduct),
  );

  const visibleBridgeEvents = bridgeEvents.filter(
    (event) => event.status === "past" || !coveredUpcomingOrigins.has(event.originProduct),
  );

  const allEvents = [...normalizedDbEvents, ...visibleBridgeEvents];
  const upcomingEvents = allEvents
    .filter((event) => event.status === "upcoming")
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const pastEvents = allEvents
    .filter((event) => event.status === "past")
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());

  return (
    <div className="mx-auto max-w-3xl pb-4 font-sans text-movApp-ink sm:pb-6">
      <h1 className="font-display text-[2rem] leading-[1.06] tracking-[-0.03em] text-movApp-ink sm:text-[2.35rem]">
        Seus próximos eventos
      </h1>

      <section className="mt-5 rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm sm:mt-6 sm:p-6">
        <div className="flex items-center gap-2.5" aria-hidden>
          <span className="h-7 w-7 rounded-full border border-movApp-border bg-movApp-subtle" />
          <span className="-ml-3 h-7 w-7 rounded-full border border-movApp-border bg-movApp-subtle/90" />
          <span className="-ml-3 h-7 w-7 rounded-full border border-movApp-border bg-movApp-subtle/80" />
        </div>
        <h2 className="mt-4 font-display text-xl leading-tight text-movApp-ink">Como foi sua experiência?</h2>
        <p className="mt-2 text-sm leading-relaxed text-movApp-muted">
          Seu feedback ajuda a MOV a curar melhor seus próximos encontros e manter a qualidade da comunidade.
        </p>
        <Link
          href="/app/comunidade"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-movApp-accent px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover active:scale-[0.995]"
        >
          Compartilhar meu feedback
        </Link>
      </section>

      <section className="mt-8 sm:mt-10">
        <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-movApp-ink">Próximas experiências</h2>
        <p className="mt-2 text-sm leading-relaxed text-movApp-muted">
          Eventos ordenados por data e origem de produto.
        </p>

        <div className="mt-4 space-y-3">
          {upcomingEvents.length ? (
            upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="rounded-2xl border border-dashed border-movApp-border/90 bg-movApp-subtle/40 p-4 text-sm text-movApp-muted">
              Ainda não há próximos eventos publicados. Quando novos encontros forem abertos nos produtos MOV,
              eles aparecerão aqui automaticamente.
            </div>
          )}
        </div>
      </section>

      {pastEvents.length > 0 && (
        <section className="mt-9 sm:mt-10">
          <h2 className="font-display text-xl leading-tight text-movApp-ink">Eventos anteriores</h2>
          <div className="mt-4 space-y-3">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} subtle />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
