import type { PartnerRestaurant } from "@prisma/client";
import Link from "next/link";
import { parseJsonArray } from "@/lib/dinner-prefs";
import { readAudienceSummary } from "@/lib/partner-restaurant-form-initial";
import {
  parsePartnerSchedule,
  SCHEDULE_TIMEZONE_EXTENSION_NOTE,
  SLOT_KIND_LABELS,
  WEEKDAY_LABELS_SHORT,
} from "@/lib/partner-restaurant-schedule";
import { PARTNER_EXPERIENCE_TYPE_LABELS } from "@/lib/partner-restaurant-constants";

export type PartnerRestaurantOperationalOutlook = {
  compatible: Array<{
    eventId: string;
    title: string;
    startsAt: Date;
    type: string;
    tablesAssigned: number;
    seatsCommitted: number;
    headroomTables: number;
    headroomSeatEstimate: number;
  }>;
  incompatible: Array<{ eventId: string; title: string; startsAt: Date; detail: string }>;
  tableCapacity: number;
  seatsPerTableMax: number;
};

type Props = {
  partner: PartnerRestaurant;
  operationalOutlook?: PartnerRestaurantOperationalOutlook;
  recentTables?: Array<{ id: string; name: string; eventTitle: string | null; startsAt: Date | null }>;
};

export function PartnerRestaurantDetailSummary({ partner, operationalOutlook, recentTables }: Props) {
  const schedule = parsePartnerSchedule(partner.scheduleJson);
  const tiers = parseJsonArray(partner.priceTiersJson);
  const diets = parseJsonArray(partner.acceptsDietaryJson);
  const experiences = parseJsonArray(partner.experienceTypesJson);
  const tags = parseJsonArray(partner.curationTagsJson);
  const avail = parseJsonArray(partner.availabilityKeysJson);
  const audience = readAudienceSummary(partner.audienceProfileJson);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {partner.notes?.trim() ? (
        <section className="rounded-2xl border border-movApp-border bg-amber-50/35 p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-movApp-ink">Notas internas / curadoria</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-movApp-ink">{partner.notes.trim()}</p>
        </section>
      ) : null}

      {operationalOutlook ? (
        <section className="rounded-2xl border border-movApp-border bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-movApp-ink">Leitura operacional (próximos eventos)</h2>
          <p className="mt-1 text-xs text-movApp-muted">
            Capacidade referente a mesas já ligadas a este parceiro por evento. Limites: até{" "}
            <strong>{operationalOutlook.tableCapacity}</strong> mesas simultâneas e{" "}
            <strong>{operationalOutlook.seatsPerTableMax}</strong> lugares/mesa (≈{" "}
            {operationalOutlook.tableCapacity * operationalOutlook.seatsPerTableMax} lugares teóricos no evento).
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
                Compatíveis com a agenda (UTC vs evento)
              </h3>
              {operationalOutlook.compatible.length === 0 ? (
                <p className="mt-2 text-sm text-movApp-muted">Nenhum evento publicado futuro ou agenda não cobre estes horários.</p>
              ) : (
                <ul className="mt-2 max-h-64 divide-y divide-movApp-border/60 overflow-y-auto text-sm">
                  {operationalOutlook.compatible.slice(0, 12).map((ev) => (
                    <li key={ev.eventId} className="py-2">
                      <span className="font-medium text-movApp-ink">{ev.title}</span>
                      <span className="block text-xs text-movApp-muted">
                        {new Date(ev.startsAt).toLocaleString("pt-BR", { timeZone: "UTC" })} UTC · {ev.type}
                      </span>
                      <span className="mt-0.5 block text-xs text-movApp-ink">
                        Mesas neste parceiro: {ev.tablesAssigned}/{operationalOutlook.tableCapacity} · lugares ocupados:{" "}
                        {ev.seatsCommitted} · folga mesas: {ev.headroomTables} · folga lugares (est.):{" "}
                        {ev.headroomSeatEstimate}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-900">Incompatíveis com a agenda</h3>
              {operationalOutlook.incompatible.length === 0 ? (
                <p className="mt-2 text-sm text-movApp-muted">Nenhum conflito de dia/slot entre os próximos eventos listados.</p>
              ) : (
                <ul className="mt-2 max-h-64 divide-y divide-movApp-border/60 overflow-y-auto text-sm">
                  {operationalOutlook.incompatible.slice(0, 12).map((ev) => (
                    <li key={ev.eventId} className="py-2">
                      <span className="font-medium text-movApp-ink">{ev.title}</span>
                      <span className="block text-xs text-movApp-muted">
                        {new Date(ev.startsAt).toLocaleString("pt-BR", { timeZone: "UTC" })} UTC
                      </span>
                      <span className="mt-0.5 block text-xs text-amber-950">{ev.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-movApp-muted">{SCHEDULE_TIMEZONE_EXTENSION_NOTE}</p>
          {partner.operationalTimezoneIana?.trim() ? (
            <p className="mt-2 text-xs text-movApp-ink" data-testid="partner-timezone-iana">
              Fuso operacional (IANA) declarado:{" "}
              <code className="rounded bg-movApp-bg px-1 font-mono">{partner.operationalTimezoneIana.trim()}</code> — a
              alocação continua a usar o dia UTC do evento até a conversão ser ligada no motor.
            </p>
          ) : (
            <p className="mt-2 text-xs text-movApp-muted" data-testid="partner-timezone-placeholder">
              Fuso IANA ainda não definido no parceiro — ver nota acima para extensão futura.
            </p>
          )}
        </section>
      ) : null}

      {recentTables && recentTables.length > 0 ? (
        <section className="rounded-2xl border border-movApp-border bg-movApp-bg/50 p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-movApp-ink">Últimas mesas neste parceiro (eventos recentes)</h2>
          <p className="mt-1 text-xs text-movApp-muted">
            Abrir a <Link href="/admin/mesas" className="font-medium text-movApp-accent hover:underline">lista de Mesas</Link>{" "}
            (operadas) ou a{" "}
            <Link href="/admin/montagem" className="font-medium text-movApp-accent hover:underline">Montagem</Link> para
            curadoria.
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-movApp-ink">
            {recentTables.map((t) => (
              <li key={t.id}>
                <Link href="/admin/mesas" className="font-medium text-movApp-accent hover:underline">
                  {t.name}
                </Link>{" "}
                <span className="text-movApp-muted">
                  · {t.eventTitle ?? "—"} ·{" "}
                  {t.startsAt ? new Date(t.startsAt).toLocaleDateString("pt-BR") : "—"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-movApp-border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-movApp-ink">Capacidade &amp; preço</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-movApp-muted">Mesas / evento</dt>
            <dd className="font-medium text-movApp-ink">{partner.tableCapacity}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-movApp-muted">Lugares por mesa</dt>
            <dd className="font-medium text-movApp-ink">{partner.seatsPerTableMax}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-movApp-muted">Faixas de preço</dt>
            <dd className="text-movApp-ink">{tiers.length ? tiers.join(" · ") : "—"}</dd>
          </div>
          {partner.estimatedTicketCents != null && (
            <div className="flex justify-between gap-2">
              <dt className="text-movApp-muted">Ticket médio (cents)</dt>
              <dd className="font-mono text-movApp-ink">{partner.estimatedTicketCents}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="rounded-2xl border border-movApp-border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-movApp-ink">Alimentação</h2>
        <p className="mt-2 text-sm text-movApp-ink">
          {diets.includes("*") ? "Aceita todas as dietas declaradas." : diets.length ? diets.join(", ") : "—"}
        </p>
        <p className="mt-1 text-xs text-movApp-muted">Flexibilidade: {partner.dietaryFlexibility}</p>
      </section>

      <section className="rounded-2xl border border-movApp-border bg-white p-5 shadow-sm lg:col-span-2">
        <h2 className="text-sm font-semibold text-movApp-ink">Agenda (slots activos na alocação)</h2>
        <p className="mt-1 text-xs text-movApp-muted">
          Dia comparado ao <strong>UTC</strong> de <code className="rounded bg-movApp-bg px-1">startsAt</code> do evento
          (0=domingo … 6=sábado).
        </p>
        {schedule.slots.filter((s) => s.active).length === 0 ? (
          <p className="mt-2 text-sm text-movApp-muted">Sem restrição por dia da semana.</p>
        ) : (
          <ul className="mt-3 divide-y divide-movApp-border/60 text-sm">
            {schedule.slots
              .filter((s) => s.active)
              .map((s, i) => (
                <li key={i} className="flex flex-wrap gap-x-4 gap-y-1 py-2">
                  <span className="font-medium text-movApp-ink">
                    {WEEKDAY_LABELS_SHORT[s.dayOfWeek]} ({s.dayOfWeek})
                  </span>
                  <span className="text-movApp-muted">{SLOT_KIND_LABELS[s.slotKind]}</span>
                  {s.slotKey ? <span className="font-mono text-xs text-movApp-ink">{s.slotKey}</span> : null}
                  {s.windowLabel ? <span className="text-movApp-muted">{s.windowLabel}</span> : null}
                  {s.notes ? <span className="text-xs text-movApp-muted">{s.notes}</span> : null}
                </li>
              ))}
          </ul>
        )}
        {schedule.slots.some((s) => !s.active) && (
          <p className="mt-2 text-xs text-movApp-muted">
            {schedule.slots.filter((s) => !s.active).length} slot(s) inactivo(s) guardados no registo.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-movApp-border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-movApp-ink">Experiências suportadas</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-movApp-ink">
          {experiences.length === 0 ? (
            <li className="list-none text-movApp-muted">—</li>
          ) : (
            experiences.map((id) => (
              <li key={id}>
                {(PARTNER_EXPERIENCE_TYPE_LABELS as Record<string, string>)[id] ?? id}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-movApp-border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-movApp-ink">Chaves de disponibilidade</h2>
        <p className="mt-2 text-sm text-movApp-ink">{avail.length ? avail.join(", ") : "— sem restrição por chave"}</p>
      </section>

      <section className="rounded-2xl border border-movApp-border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-movApp-ink">Tags de curadoria</h2>
        <p className="mt-2 text-sm text-movApp-ink">{tags.length ? tags.join(" · ") : "—"}</p>
      </section>

      <section className="rounded-2xl border border-movApp-border bg-white p-5 shadow-sm lg:col-span-2">
        <h2 className="text-sm font-semibold text-movApp-ink">Público aderente</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-movApp-ink">{audience || "—"}</p>
      </section>

      <section className="rounded-2xl border border-movApp-border bg-white p-5 shadow-sm lg:col-span-2">
        <h2 className="text-sm font-semibold text-movApp-ink">Sinais de adequação (0–100)</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs text-movApp-muted">Mesas leves</dt>
            <dd>{partner.fitLightTables}</dd>
          </div>
          <div>
            <dt className="text-xs text-movApp-muted">Mesas profundas</dt>
            <dd>{partner.fitDeepTables}</dd>
          </div>
          <div>
            <dt className="text-xs text-movApp-muted">Premium</dt>
            <dd>{partner.fitPremiumExperience}</dd>
          </div>
          <div>
            <dt className="text-xs text-movApp-muted">Primeiro encontro</dt>
            <dd>{partner.fitFirstEncounter}</dd>
          </div>
          <div>
            <dt className="text-xs text-movApp-muted">Extrovertidos</dt>
            <dd>{partner.fitExtrovertedGroup}</dd>
          </div>
          <div>
            <dt className="text-xs text-movApp-muted">Intimistas</dt>
            <dd>{partner.fitIntimateGroup}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
