import type { MovReservationContext } from "@/lib/mov-reservation-context";
import {
  availabilityCompatible,
  intersectBudgetTiers,
  regionCompatible,
} from "@/lib/mov-reservation-context";

export type MovOperationalHardResult = {
  isAllowed: boolean;
  reasons: string[];
};

export type MovOperationalPairScore = {
  score: number;
  hard: MovOperationalHardResult;
};

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length === 0 || b.length === 0) return 0.65;
  const sa = new Set(a);
  let inter = 0;
  for (const x of b) if (sa.has(x)) inter += 1;
  const union = new Set([...a, ...b]).size || 1;
  return inter / union;
}

/** Regras duras operacionais entre dois participantes na mesma rodada. */
export function evaluateReservationPairHard(
  a: MovReservationContext | null,
  b: MovReservationContext | null,
): MovOperationalHardResult {
  if (!a || !b) return { isAllowed: true, reasons: [] };
  const reasons: string[] = [];
  if (a.eventId !== b.eventId) {
    reasons.push("Inscrições em eventos diferentes.");
  }
  if (!regionCompatible(a, b)) {
    reasons.push("Região da reserva incompatível entre participantes.");
  }
  const budgetOverlap = intersectBudgetTiers(a.budgetTiers, b.budgetTiers);
  if (a.budgetTiers.length > 0 && b.budgetTiers.length > 0 && budgetOverlap.length === 0) {
    reasons.push("Faixas de orçamento da noite sem interseção.");
  }
  if (!availabilityCompatible(a, b)) {
    reasons.push("Disponibilidade declarada sem interseção.");
  }
  return { isAllowed: reasons.length === 0, reasons };
}

export function computeOperationalPairScore(
  a: MovReservationContext | null,
  b: MovReservationContext | null,
): MovOperationalPairScore {
  const hard = evaluateReservationPairHard(a, b);
  if (!hard.isAllowed) return { score: 0, hard };
  if (!a || !b) return { score: 70, hard };

  const regionScore = !a.regionKey || !b.regionKey ? 0.85 : a.regionKey === b.regionKey ? 1 : 0;
  const budgetScore =
    a.budgetTiers.length === 0 || b.budgetTiers.length === 0
      ? 0.75
      : intersectBudgetTiers(a.budgetTiers, b.budgetTiers).length > 0
        ? 1
        : 0;
  const langScore = jaccard(a.languages, b.languages);
  const availScore = availabilityCompatible(a, b) ? 1 : 0;

  const score = Math.round((regionScore * 0.35 + budgetScore * 0.35 + langScore * 0.15 + availScore * 0.15) * 100);
  return { score, hard };
}
