import Link from "next/link";
import { auth } from "@/auth";
import { MOV_ESSENCIA_NAV } from "@/lib/mov-essencia-nav";
import { prisma } from "@/lib/prisma";
import { appEventosCardDestination, appEventosCardDisplayName } from "@/lib/app-eventos-mirror-routing";
import { userHasPendingSeMovFeedback } from "@/lib/se-mov-feedback-eligibility";
import { getSpeedDatingUpcomingEventsUniqueByDay } from "@/lib/speed-dating-public-events";

export const dynamic = "force-dynamic";

type ProductOrigin = "SE_MOV" | "SPEED_DATING" | "MOV_ESSENCIA" | "COMUNIDADE";
type EventStatus = "upcoming" | "past" | "cancelled";

type MirrorEvent = {
  id: string;
  type: string;
  displayName: string;
  title: string;
  startsAt: Date;
  status: EventStatus;
  originProduct: ProductOrigin;
  routeDestination: string;
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

type EventVisual = "bebidas" | "jantar" | "cafe" | "speedDating" | "fallback";

function normalizeToken(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function resolveEventVisual(event: Pick<MirrorEvent, "originProduct" | "type" | "displayName" | "title">): EventVisual {
  if (event.originProduct === "SPEED_DATING") return "speedDating";
  const text = normalizeToken(`${event.type} ${event.displayName} ${event.title}`);
  if (text.includes("cafe")) return "cafe";
  if (text.includes("exodo") || text.includes("bebida") || text.includes("drink")) return "bebidas";
  if (text.includes("jantar")) return "jantar";
  return "fallback";
}

function EventIcon({ visual }: { visual: EventVisual }) {
  const common = "h-4 w-4";
  if (visual === "jantar") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path
          d="M6.5 3v6.8M9.4 3v6.8M6.5 6.5h2.9M8 9.8v11.2M14.8 3v10M14.8 13c1.8 0 2.8-1.1 2.8-3.1V3M14.8 13V21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (visual === "speedDating") {
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
  if (visual === "cafe") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path
          d="M6 9h10v4a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V9Zm10 1h1.2a2.3 2.3 0 1 1 0 4.6H16M8 5.8c0-.8.7-1.2 1.2-1.7M11 5.8c0-.8.7-1.2 1.2-1.7M6 20h10"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (visual === "bebidas") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path
          d="M5 4h6l-3 4v8.5a1.5 1.5 0 0 0 .4 1l1.1 1.3M17 4l2.2 3.5a1.5 1.5 0 0 1 .2.8V18m-5-14h5m-4 14h5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (visual === "fallback") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path
          d="M4 18c2.5-2.8 5.2-4.2 8-4.2s5.5 1.4 8 4.2M8 9a2 2 0 1 1 0 .01M16 9a2 2 0 1 1 0 .01"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return null;
}

function EventCard({ event, subtle = false }: { event: MirrorEvent; subtle?: boolean }) {
  const dateLabel = capFirst(weekDayDateFmt.format(event.startsAt));
  const timeLabel = hourFmt.format(event.startsAt);
  const cardBase =
    "group flex items-center gap-3.5 rounded-2xl border p-4 transition sm:px-4.5 sm:py-4.5";
  const cardTone = subtle
    ? "border-movApp-border/60 bg-movApp-subtle/35 hover:border-movApp-border"
    : "border-movApp-border bg-movApp-paper shadow-sm hover:border-movApp-border/90 hover:shadow";
  const visual = resolveEventVisual(event);
  const iconTone =
    visual === "jantar"
      ? "bg-orange-50 text-orange-600 ring-1 ring-orange-200/90"
      : visual === "cafe"
        ? "bg-violet-50 text-violet-600 ring-1 ring-violet-200/90"
        : visual === "bebidas"
          ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/90"
          : visual === "speedDating"
            ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200/90"
            : "bg-movApp-subtle text-movApp-ink ring-1 ring-movApp-border";

  return (
    <Link href={event.routeDestination} className={`${cardBase} ${cardTone}`} data-starts-at={event.startsAt.toISOString()}>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconTone}`}>
        <EventIcon visual={visual} />
      </span>

      <span className="min-w-0 flex-1">
        {event.originProduct !== "SE_MOV" && event.originProduct !== "SPEED_DATING" ? (
          <span className="block text-[11px] font-semibold uppercase tracking-[0.13em] text-movApp-muted">
            {originMeta[event.originProduct].label}
          </span>
        ) : null}
        <span className="mt-0.5 block truncate text-[0.96rem] font-medium leading-snug text-movApp-ink">{event.displayName}</span>
        <span className="mt-1.5 block text-sm font-bold leading-tight text-movApp-ink">{dateLabel}</span>
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

  const [dbEvents, myRegs, hasPendingExperienceFeedback, speedDatingUpcomingEvents] = await Promise.all([
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
    userId ? userHasPendingSeMovFeedback(userId) : Promise.resolve(false),
    getSpeedDatingUpcomingEventsUniqueByDay(),
  ]);

  const registrationByEventId = new Map(myRegs.map((r) => [r.eventId, r.status]));
  const now = new Date();

  const normalizedDbEvents: MirrorEvent[] = dbEvents.map((event) => {
    const originProduct = normalizeOriginFromEvent(event);
    const regStatus = registrationByEventId.get(event.id);
    const status: EventStatus =
      regStatus === "cancelled" ? "cancelled" : event.startsAt < now ? "past" : "upcoming";
    const displayName = appEventosCardDisplayName(originProduct, event);

    return {
      id: event.id,
      type: event.type,
      displayName,
      title: event.title,
      startsAt: event.startsAt,
      status,
      originProduct,
      routeDestination: appEventosCardDestination(originProduct, event.id),
    };
  });

  /** Só dados do banco — sem cards de fallback/bridge. */
  const allEvents = normalizedDbEvents;
  const upcomingAll = allEvents
    .filter((event) => event.status === "upcoming")
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const upcomingNonSpeed = upcomingAll.filter((event) => event.originProduct !== "SPEED_DATING");
  const speedDatingUpcomingFromPublicList: MirrorEvent[] = speedDatingUpcomingEvents.map((event) => {
    const originProduct: ProductOrigin = "SPEED_DATING";
    return {
      id: event.id,
      type: event.type,
      displayName: appEventosCardDisplayName("SPEED_DATING", event),
      title: event.title,
      startsAt: event.startsAt,
      status: "upcoming",
      originProduct,
      routeDestination: appEventosCardDestination("SPEED_DATING", event.id),
    };
  });
  const pastEvents = allEvents
    .filter((event) => event.status === "past")
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
  const upcomingByOrigin = {
    SE_MOV: upcomingNonSpeed.filter((event) => event.originProduct === "SE_MOV"),
    SPEED_DATING: speedDatingUpcomingFromPublicList,
    MOV_ESSENCIA: upcomingNonSpeed.filter((event) => event.originProduct === "MOV_ESSENCIA"),
    COMUNIDADE: upcomingNonSpeed.filter((event) => event.originProduct === "COMUNIDADE"),
  } as const;
  const upcomingSectionCount =
    upcomingByOrigin.SE_MOV.length +
    upcomingByOrigin.SPEED_DATING.length +
    upcomingByOrigin.MOV_ESSENCIA.length +
    upcomingByOrigin.COMUNIDADE.length;

  return (
    <div className="mx-auto max-w-3xl pb-4 font-sans text-movApp-ink sm:pb-6">
      <h1 className="font-display text-[2rem] leading-[1.06] tracking-[-0.03em] text-movApp-ink sm:text-[2.35rem]">
        Seus próximos eventos
      </h1>

      {hasPendingExperienceFeedback ? (
        <section className="mt-5 rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm sm:mt-6 sm:p-6">
          <div className="flex items-center gap-2.5" aria-hidden>
            <span className="h-7 w-7 rounded-full border border-movApp-border bg-movApp-subtle" />
            <span className="-ml-3 h-7 w-7 rounded-full border border-movApp-border bg-movApp-subtle/90" />
            <span className="-ml-3 h-7 w-7 rounded-full border border-movApp-border bg-movApp-subtle/80" />
          </div>
          <h2 className="mt-4 font-display text-xl leading-tight text-movApp-ink">Como foi sua experiência?</h2>
          <p className="mt-2 text-sm leading-relaxed text-movApp-muted">
            Seu feedback ajuda a MOV a manter segurança, qualidade e curadoria nos próximos encontros.
          </p>
          <Link
            href="/app/feedback"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-movApp-accent px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-movApp-accentHover active:scale-[0.995]"
          >
            Compartilhar minha experiência
          </Link>
        </section>
      ) : null}

      <section className="mt-8 sm:mt-10">
        <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-movApp-ink">Próximas experiências</h2>
        <p className="mt-2 text-sm leading-relaxed text-movApp-muted">
          Eventos organizados por linha de produto.
        </p>

        {upcomingSectionCount === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-movApp-border/90 bg-movApp-subtle/40 p-4 text-sm text-movApp-muted">
            Ainda não há próximos eventos publicados. Quando novos encontros forem abertos nos produtos MOV,
            eles aparecerão aqui automaticamente.
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            {(["SE_MOV", "SPEED_DATING", "MOV_ESSENCIA", "COMUNIDADE"] as const).map((origin) => {
              const rows = upcomingByOrigin[origin];
              if (rows.length === 0) return null;
              return (
                <section key={origin} className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-movApp-muted">
                    {originMeta[origin].label}
                  </h3>
                  <div className="space-y-3">
                    {rows.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
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
