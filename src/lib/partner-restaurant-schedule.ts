/**
 * Agenda operacional do parceiro (`PartnerRestaurant.scheduleJson`).
 *
 * ## Semântica temporal (obrigatório entender para operação)
 *
 * - O motor de alocação compara o **dia da semana** do evento usando
 *   `event.startsAt.getUTCDay()` (0 = domingo … 6 = sábado).
 * - Os `dayOfWeek` deste documento usam **a mesma convenção**: índice UTC
 *   do instante `startsAt` do evento, **não** o fuso “sentido” pelo cliente.
 * - Isto significa: se o evento for criado em hora local Brasília mas o `Date`
 *   em BD representa o instante correto em UTC, o dia da semana UTC pode
 *   diferir do dia civil local em torno da meia-noite UTC — nesse caso ajuste
 *   `startsAt` na fonte ou alinhe os slots aos dias UTC que realmente importam
 *   para o motor.
 *
 * ## Limitação atual
 *
 * - Não existe modelo de **múltiplos turnos distintos no mesmo `eventId`**:
 *   a agenda filtra apenas por dia (UTC) + chaves de disponibilidade cruzadas
 *   com a reserva; refinamento por hora dentro do dia fica para evolução futura.
 *
 * ## Extensão: fuso por parceiro
 *
 * O modelo `PartnerRestaurant` pode declarar `operationalTimezoneIana` (opcional). Quando o motor
 * passar a converter `event.startsAt` para esse fuso antes de `getUTCDay()`, os slots deixam de
 * depender só do dia UTC bruto — até lá, o campo serve apenas como documentação / preparação.
 *
 * @see `scheduleMatchesEvent` em `mov-restaurant-allocation.ts`
 */

import { z } from "zod";

/** Base canónica guardada em novos saves a partir do admin estruturado. */
export const PARTNER_SCHEDULE_DAY_BASIS = "utc_weekday_of_event_starts_at" as const;

export const partnerScheduleSlotKindSchema = z.enum(["lunch", "dinner", "night", "other"]);

export type PartnerScheduleSlotKind = z.infer<typeof partnerScheduleSlotKindSchema>;

export const partnerScheduleSlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  slotKind: partnerScheduleSlotKindSchema,
  slotKey: z.string().max(120).optional(),
  active: z.boolean(),
  windowLabel: z.string().max(120).optional(),
  notes: z.string().max(500).optional(),
});

export type PartnerScheduleSlot = z.infer<typeof partnerScheduleSlotSchema>;

export const partnerScheduleDocumentSchema = z.object({
  schemaVersion: z.literal(2),
  dayBasis: z.literal(PARTNER_SCHEDULE_DAY_BASIS),
  slots: z.array(partnerScheduleSlotSchema),
});

export type PartnerScheduleDocument = z.infer<typeof partnerScheduleDocumentSchema>;

/** Formato mínimo esperado pelo motor de alocação (retrocompatível). */
export type AllocationScheduleSlot = { dayOfWeek: number; slotKey?: string };

const legacySlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  slotKey: z.string().optional(),
});

/**
 * Lê `scheduleJson` da BD: aceita documento v2, ou legado `{ slots: [...] }`
 * sem `schemaVersion` (tratado como slots activos genéricos).
 */
export function parsePartnerSchedule(raw: string | null | undefined): PartnerScheduleDocument {
  if (!raw || !raw.trim()) {
    return { schemaVersion: 2, dayBasis: PARTNER_SCHEDULE_DAY_BASIS, slots: [] };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return { schemaVersion: 2, dayBasis: PARTNER_SCHEDULE_DAY_BASIS, slots: [] };
  }
  if (!parsed || typeof parsed !== "object") {
    return { schemaVersion: 2, dayBasis: PARTNER_SCHEDULE_DAY_BASIS, slots: [] };
  }
  const o = parsed as Record<string, unknown>;
  const v = o.schemaVersion;
  if (v === 2 && o.dayBasis === PARTNER_SCHEDULE_DAY_BASIS && Array.isArray(o.slots)) {
    const r = partnerScheduleDocumentSchema.safeParse(parsed);
    if (r.success) return r.data;
  }
  /* Legacy: { slots: [{ dayOfWeek, slotKey? }] } */
  if (Array.isArray(o.slots)) {
    const slots: PartnerScheduleSlot[] = [];
    for (const s of o.slots) {
      const ls = legacySlotSchema.safeParse(s);
      if (!ls.success) continue;
      slots.push({
        dayOfWeek: ls.data.dayOfWeek,
        slotKind: "other",
        slotKey: ls.data.slotKey,
        active: true,
      });
    }
    return { schemaVersion: 2, dayBasis: PARTNER_SCHEDULE_DAY_BASIS, slots };
  }
  return { schemaVersion: 2, dayBasis: PARTNER_SCHEDULE_DAY_BASIS, slots: [] };
}

/** Persistência: `null` = sem restrição de agenda no motor. Guarda slots activos e inactivos para reabrir o formulário. */
export function serializePartnerSchedule(doc: PartnerScheduleDocument): string | null {
  if (doc.slots.length === 0) return null;
  return JSON.stringify(doc);
}

/** Slots passados ao motor: só activos; `slotKey` preservado para cruzamentos futuros. */
export function getAllocationScheduleSlots(raw: string | null | undefined): AllocationScheduleSlot[] {
  const doc = parsePartnerSchedule(raw);
  return doc.slots
    .filter((s) => s.active)
    .map((s) => ({ dayOfWeek: s.dayOfWeek, slotKey: s.slotKey }));
}

export const SLOT_KIND_LABELS: Record<PartnerScheduleSlotKind, string> = {
  lunch: "Almoço",
  dinner: "Jantar",
  night: "Noite",
  other: "Outro / geral",
};

export const WEEKDAY_LABELS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

/**
 * Ponto de extensão futuro: filtrar slots por fuso (IANA) em vez de só UTC.
 * Hoje a alocação usa apenas `eventStartsAt.getUTCDay()`.
 */
export const SCHEDULE_TIMEZONE_EXTENSION_NOTE =
  "Extensão futura: associar `operationalTimezoneIana` ao parceiro e converter `startsAt` antes de comparar dia/slot.";

/**
 * Compara agenda activa ao instante do evento (dia da semana UTC de `startsAt`).
 * Única fonte de verdade para match agenda ↔ evento no motor.
 */
export function evaluateScheduleForEvent(
  scheduleJson: string | null | undefined,
  eventStartsAt: Date | null | undefined,
): { ok: boolean; detail: string } {
  const slots = getAllocationScheduleSlots(scheduleJson);
  if (slots.length === 0) {
    return { ok: true, detail: "Parceiro sem agenda restrita — considera qualquer turno." };
  }
  if (!eventStartsAt || Number.isNaN(eventStartsAt.getTime())) {
    return { ok: true, detail: "Evento sem data — agenda do parceiro não validada." };
  }
  const dow = eventStartsAt.getUTCDay();
  const dayHit = slots.some((s) => s.dayOfWeek === dow);
  if (dayHit) {
    return {
      ok: true,
      detail: `Dia da semana do evento (${dow}, UTC) coincide com a agenda do parceiro.`,
    };
  }
  return {
    ok: false,
    detail: `Agenda: nenhum slot activo para o dia UTC ${dow} (${WEEKDAY_LABELS_SHORT[dow]}). Ajuste slots ou o horário do evento.`,
  };
}

/** Texto curto para alertas de admin quando a agenda não casa com o evento. */
export function formatScheduleMismatchHint(
  scheduleJson: string | null | undefined,
  eventStartsAt: Date | null | undefined,
): string | null {
  const r = evaluateScheduleForEvent(scheduleJson, eventStartsAt);
  return r.ok ? null : r.detail;
}
