/**
 * Contexto derivado da **inscrição/reserva** num evento (não confundir com perfil MOV).
 * Usado em mesas, alocação de parceiro e regras duras entre participantes.
 */
import { parseJsonArray } from "@/lib/dinner-prefs";

export type MovReservationContext = {
  eventId: string;
  eventType: string;
  memberOnly: boolean;
  status: string;
  regionKey: string | null;
  budgetTiers: string[];
  languages: string[];
  dietaryRestrictions: boolean;
  dietaryTypes: string[];
  /** Chaves de disponibilidade (quando gravadas na reserva) */
  availabilitySlots: string[];
};

export type EventRegistrationRow = {
  eventId: string;
  status: string;
  regionKey: string | null;
  dinnerLanguages: string | null;
  dinnerBudgetTiers: string | null;
  dietaryRestrictions: boolean;
  dietaryTypes: string | null;
  availabilitySlotsJson: string | null;
};

export type EventRowMini = {
  id: string;
  type: string;
  memberOnly: boolean;
};

export function buildMovReservationContext(
  event: EventRowMini,
  reg: EventRegistrationRow | null,
): MovReservationContext | null {
  if (!reg || reg.status === "cancelled") return null;
  return {
    eventId: event.id,
    eventType: event.type,
    memberOnly: event.memberOnly,
    status: reg.status,
    regionKey: reg.regionKey,
    budgetTiers: parseJsonArray(reg.dinnerBudgetTiers),
    languages: parseJsonArray(reg.dinnerLanguages),
    dietaryRestrictions: reg.dietaryRestrictions,
    dietaryTypes: parseJsonArray(reg.dietaryTypes),
    availabilitySlots: parseJsonArray(reg.availabilitySlotsJson),
  };
}

/** Interseção de faixas de orçamento; vazio = incompatível operacional. */
export function intersectBudgetTiers(a: string[], b: string[]): string[] {
  const sa = new Set(a);
  return b.filter((x) => sa.has(x));
}

export function intersectAllBudgetTiers(lists: string[][]): string[] {
  if (lists.length === 0) return [];
  return lists.reduce((acc, cur) => acc.filter((x) => cur.includes(x)), lists[0]!);
}

export function unionDietaryTypes(regs: MovReservationContext[]): string[] {
  const u = new Set<string>();
  for (const r of regs) {
    if (!r.dietaryRestrictions) continue;
    for (const d of r.dietaryTypes) u.add(d);
  }
  return [...u];
}

export function availabilityCompatible(a: MovReservationContext, b: MovReservationContext): boolean {
  const sa = a.availabilitySlots.filter(Boolean);
  const sb = b.availabilitySlots.filter(Boolean);
  if (sa.length === 0 || sb.length === 0) return true;
  const sbSet = new Set(sb);
  return sa.some((x) => sbSet.has(x));
}

export function regionCompatible(a: MovReservationContext, b: MovReservationContext): boolean {
  if (!a.regionKey || !b.regionKey) return true;
  return a.regionKey === b.regionKey;
}
