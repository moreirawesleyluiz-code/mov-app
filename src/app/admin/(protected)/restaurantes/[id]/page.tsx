import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPartnerRestaurantForm } from "@/components/admin/admin-partner-restaurant-form";
import { PartnerRestaurantDetailSummary } from "@/components/admin/partner-restaurant-detail-summary";
import { evaluateScheduleForEvent } from "@/lib/partner-restaurant-schedule";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export default async function AdminRestauranteDetailPage({ params }: Props) {
  const { id } = await params;
  const row = await prisma.partnerRestaurant.findUnique({
    where: { id },
    include: {
      _count: { select: { curatedTables: true } },
      curatedTables: {
        where: { event: { startsAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) } } },
        take: 12,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          status: true,
          event: { select: { id: true, title: true, startsAt: true, type: true } },
        },
      },
    },
  });
  if (!row) notFound();

  const { _count, curatedTables, ...partner } = row;

  const now = new Date();
  const upcomingEvents = await prisma.event.findMany({
    where: { published: true, startsAt: { gte: now } },
    orderBy: { startsAt: "asc" },
    take: 36,
    select: { id: true, title: true, startsAt: true, type: true },
  });
  const upcomingIds = upcomingEvents.map((e) => e.id);
  const usageRows =
    upcomingIds.length > 0
      ? await prisma.adminCuratedTable.findMany({
          where: { partnerRestaurantId: id, eventId: { in: upcomingIds } },
          select: { eventId: true, _count: { select: { members: true } } },
        })
      : [];
  const usageByEvent = new Map<string, { tables: number; seats: number }>();
  for (const r of usageRows) {
    const eid = r.eventId;
    if (!eid) continue;
    const cur = usageByEvent.get(eid) ?? { tables: 0, seats: 0 };
    cur.tables += 1;
    cur.seats += r._count.members;
    usageByEvent.set(eid, cur);
  }

  const tableCap = partner.tableCapacity ?? 10;
  const seatsPerMx = partner.seatsPerTableMax ?? 6;
  const maxVenueSeats = tableCap * seatsPerMx;

  const compatible: Array<{
    eventId: string;
    title: string;
    startsAt: Date;
    type: string;
    tablesAssigned: number;
    seatsCommitted: number;
    headroomTables: number;
    headroomSeatEstimate: number;
  }> = [];
  const incompatible: Array<{ eventId: string; title: string; startsAt: Date; detail: string }> = [];

  for (const ev of upcomingEvents) {
    const sched = evaluateScheduleForEvent(partner.scheduleJson, ev.startsAt);
    const u = usageByEvent.get(ev.id) ?? { tables: 0, seats: 0 };
    const headroomTables = Math.max(0, tableCap - u.tables);
    const headroomSeatEstimate = Math.max(0, maxVenueSeats - u.seats);
    if (sched.ok) {
      compatible.push({
        eventId: ev.id,
        title: ev.title,
        startsAt: ev.startsAt,
        type: ev.type,
        tablesAssigned: u.tables,
        seatsCommitted: u.seats,
        headroomTables,
        headroomSeatEstimate,
      });
    } else {
      incompatible.push({
        eventId: ev.id,
        title: ev.title,
        startsAt: ev.startsAt,
        detail: sched.detail,
      });
    }
  }

  const recentTables = await prisma.adminCuratedTable.findMany({
    where: {
      partnerRestaurantId: id,
      event: {
        startsAt: {
          lt: now,
          gte: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        },
      },
    },
    take: 10,
    orderBy: { event: { startsAt: "desc" } },
    select: {
      id: true,
      name: true,
      event: { select: { title: true, startsAt: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-movApp-muted">Parceiro</p>
          <h1 className="font-display text-2xl font-semibold text-movApp-ink">{partner.name}</h1>
          <p className="mt-1 text-sm text-movApp-muted">
            {partner.city ?? "—"} · {partner.neighborhood ?? "—"} · {partner.active ? "Ativo" : "Inativo"} ·{" "}
            {_count.curatedTables} mesa(s) ligadas no total
          </p>
        </div>
        <Link href="/admin/restaurantes" className="text-sm font-medium text-movApp-accent hover:underline">
          ← Lista
        </Link>
      </div>

      <section className="rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-movApp-ink">Ficha legível</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-movApp-muted">regionKey</dt>
            <dd className="font-mono text-movApp-ink">{partner.regionKey ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-movApp-muted">Ambiente / estilo</dt>
            <dd className="text-movApp-ink">
              {partner.environmentType ?? "—"} · {partner.houseStyle ?? "—"}
            </dd>
          </div>
        </dl>
      </section>

      <PartnerRestaurantDetailSummary
        partner={partner}
        operationalOutlook={{
          compatible,
          incompatible,
          tableCapacity: tableCap,
          seatsPerTableMax: seatsPerMx,
        }}
        recentTables={recentTables.map((t) => ({
          id: t.id,
          name: t.name,
          eventTitle: t.event?.title ?? null,
          startsAt: t.event?.startsAt ?? null,
        }))}
      />

      <section className="rounded-2xl border border-movApp-border bg-movApp-paper p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-movApp-muted">Mesas / eventos recentes</h2>
        {curatedTables.length === 0 ? (
          <p className="mt-2 text-sm text-movApp-muted">Nenhuma mesa futura ou em curso com este parceiro.</p>
        ) : (
          <ul className="mt-3 space-y-2.5 text-sm">
            {curatedTables.map((t) => (
              <li key={t.id} className="flex flex-wrap justify-between gap-2 border-b border-movApp-border/60 py-1">
                <span className="font-medium text-movApp-ink">{t.name}</span>
                <span className="text-movApp-muted">
                  {t.event?.title ?? "—"} · {t.event?.startsAt ? new Date(t.event.startsAt).toLocaleString("pt-BR") : ""}
                </span>
                <span className="flex flex-wrap gap-2">
                  <Link href="/admin/mesas" className="text-movApp-accent hover:underline">
                    Mesas
                  </Link>
                  <span className="text-movApp-muted">·</span>
                  <Link href="/admin/montagem" className="text-movApp-accent hover:underline">
                    Montagem
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AdminPartnerRestaurantForm key={partner.id} initial={partner} title="Editar parceiro" />
    </div>
  );
}
