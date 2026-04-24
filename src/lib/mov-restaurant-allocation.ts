import type { MovMatchingCandidate } from "@/lib/mov-mesa-engine";
import {
  intersectAllBudgetTiers,
  unionDietaryTypes,
  type MovReservationContext,
} from "@/lib/mov-reservation-context";
import {
  evaluateScheduleForEvent,
  getAllocationScheduleSlots,
} from "@/lib/partner-restaurant-schedule";

/**
 * Alocação de restaurante parceiro à mesa curada (admin).
 *
 * Separação de conceitos:
 * - **Perfil MOV** (`MovMatchingProfile`): onboarding + eixos de compatibilidade entre pessoas.
 * - **Reserva** (`MovReservationContext`): região, orçamento, dieta, disponibilidade da inscrição no evento.
 * - **Mesa** (`AdminCuratedTable`): agrupamento curado de até 6 pessoas; scoring humano em `mov-mesa-engine`.
 * - **Parceiro** (`PartnerRestaurantPickInput`): regras operacionais (preço, zona, agenda UTC, capacidade por evento).
 *
 * O score agregado combina encaixe da reserva + parceiro; conflitos operacionais são reforçados em
 * `quickRestaurantReservationAudit` para o painel admin.
 *
 * @see `partner-restaurant-schedule.ts` — semântica UTC da agenda.
 */
/** Abaixo disto, o admin trata a sugestão automática como "baixa confiança" (alerta discreto). */
export const RESTAURANT_ALLOCATION_LOW_CONFIDENCE_THRESHOLD = 52;

/** Faixa legível para o operador (última sugestão automática). */
export function restaurantAllocationConfidenceLabel(
  aggregateScore: number | null | undefined,
): "alta" | "media" | "baixa" | null {
  if (aggregateScore == null || Number.isNaN(aggregateScore)) return null;
  if (aggregateScore >= 72) return "alta";
  if (aggregateScore >= RESTAURANT_ALLOCATION_LOW_CONFIDENCE_THRESHOLD) return "media";
  return "baixa";
}

/** Subconjunto do `PartnerRestaurant` usado na alocação (compatível com seed e testes mínimos). */
export type PartnerRestaurantPickInput = {
  id: string;
  name: string;
  regionKey: string | null;
  priceTiersJson: string;
  experienceTypesJson: string | null;
  acceptsDietaryJson: string | null;
  active: boolean;
  seatsPerTableMax?: number | null;
  /** Mesas simultâneas máx. por evento (operacional). */
  tableCapacity?: number | null;
  availabilityKeysJson?: string | null;
  scheduleJson?: string | null;
  premiumLevel?: string | null;
  fitLightTables?: number | null;
  fitDeepTables?: number | null;
  fitPremiumExperience?: number | null;
  fitFirstEncounter?: number | null;
  fitExtrovertedGroup?: number | null;
  fitIntimateGroup?: number | null;
};

export type RestaurantPickOptions = {
  /** Data/hora do evento — usada com `scheduleJson` do parceiro. */
  eventStartsAt?: Date | null;
  /** Mesas já atribuídas a cada parceiro neste evento (o caller incrementa durante um batch). */
  allocationCounts?: Map<string, number>;
  /**
   * Soma de lugares (membros) já em mesas atribuídas a cada parceiro neste evento.
   * Reforça visibilidade operacional e pressão sobre capacidade “cheia” em lugares.
   */
  allocationSeatCounts?: Map<string, number>;
  /** Lugares ocupados na mesa corrente. */
  tableSeatCount?: number;
};

function parseJson(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function dietaryAccepted(accepts: string[], required: string[]): boolean {
  if (required.length === 0) return true;
  if (accepts.includes("*")) return true;
  const set = new Set(accepts);
  return required.every((r) => set.has(r));
}

function mean(nums: number[]): number {
  if (nums.length === 0) return 50;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function unionMemberAvailability(regs: MovReservationContext[]): Set<string> {
  const u = new Set<string>();
  for (const r of regs) {
    for (const s of r.availabilitySlots) {
      if (s) u.add(s);
    }
  }
  return u;
}

function availabilityFit(
  partnerKeys: string[],
  memberUnion: Set<string>,
  regs: MovReservationContext[],
): { score: number; detail: string; alert?: string } {
  if (partnerKeys.length === 0) {
    return { score: 88, detail: "Parceiro sem chaves de disponibilidade restritas." };
  }
  if (memberUnion.size === 0) {
    return {
      score: 62,
      detail: "Participantes sem turnos declarados — disponibilidade do parceiro não cruzada.",
      alert: "Sem slots de disponibilidade na reserva — confirmar turno manualmente com o parceiro.",
    };
  }
  const hit = partnerKeys.some((k) => memberUnion.has(k));
  if (hit) return { score: 100, detail: "Pelo menos um turno da reserva cruza com a disponibilidade operacional do parceiro." };
  return { score: 18, detail: "Turnos declarados na reserva não coincidem com as chaves de disponibilidade do parceiro." };
}

function tableExperienceFit(
  members: MovMatchingCandidate[],
  p: PartnerRestaurantPickInput,
  eventType: string,
): { score: number; detail: string } {
  const energies = members.map((m) => m.profile.socialEnergy).filter((n): n is number => n !== null && !Number.isNaN(n));
  const depths = members.map((m) => m.profile.relationalDepth).filter((n): n is number => n !== null && !Number.isNaN(n));
  const avgE = mean(energies);
  const avgD = mean(depths);

  const ext = p.fitExtrovertedGroup ?? 55;
  const int = p.fitIntimateGroup ?? 55;
  const light = p.fitLightTables ?? 55;
  const deep = p.fitDeepTables ?? 55;
  const prem = p.fitPremiumExperience ?? 50;
  const first = p.fitFirstEncounter ?? 60;

  const energyMatch = (avgE * ext + (100 - avgE) * int) / 100;
  const depthMatch = (avgD * deep + (100 - avgD) * light) / 100;

  const isPremiumEvent = /SENSORIAL|EXCLUSIVO/i.test(eventType) || /sensorial|exclusivo/i.test(p.premiumLevel ?? "");
  const eventBoost = isPremiumEvent ? prem : 72;

  const calmTable = avgE < 45;
  const firstBoost = calmTable && avgD < 55 ? first : 60;

  const score = Math.round(energyMatch * 0.34 + depthMatch * 0.34 + eventBoost * 0.22 + firstBoost * 0.1);
  return {
    score: Math.max(15, Math.min(100, score)),
    detail: `Fit de experiência: energia média ${Math.round(avgE)}, profundidade média ${Math.round(avgD)} vs perfil operacional do espaço.`,
  };
}

export type OperationalCapacitySnapshot = {
  /** Mesas já atribuídas a este parceiro neste evento antes desta escolha. */
  tablesAllocatedBeforePick: number;
  tableCapacityLimit: number;
  /** Lugares já ocupados nesse parceiro neste evento antes desta mesa. */
  seatsCommittedBeforePick: number;
  /** Limite teórico de lugares: mesas simultâneas × lugares/mesa. */
  seatCapacityEstimate: number;
};

export type RestaurantPickResult = {
  restaurantId: string | null;
  restaurantName: string | null;
  line: string;
  alerts: string[];
  /** Por que faz sentido (curadoria + operação). */
  positiveReasons: string[];
  /** Por que outros candidatos perderam (resumo). */
  rejectionSummary: string[];
  /** Outros parceiros com score alto (empates / quase elegíveis). */
  runnerUpNotes?: string[];
  fitBudget: number;
  fitRegion: number;
  fitDiet: number;
  fitExperience: number;
  fitSchedule: number;
  fitAvailability: number;
  fitCapacity: number;
  fitTableProfile: number;
  aggregateScore: number;
  /** Contexto operacional no momento da sugestão (útil em allocationMetaJson). */
  operationalSnapshot?: OperationalCapacitySnapshot;
};

const HARD_FAIL_SCORE = -1e6;

function scorePartner(
  eventType: string,
  members: MovMatchingCandidate[],
  p: PartnerRestaurantPickInput,
  opts: RestaurantPickOptions,
  regs: MovReservationContext[],
): {
  total: number;
  parts: Omit<RestaurantPickResult, "restaurantId" | "restaurantName" | "line" | "alerts" | "positiveReasons" | "rejectionSummary"> & {
    positiveReasons: string[];
  };
  hardFail: string | null;
} {
  const alerts: string[] = [];
  const positiveReasons: string[] = [];

  const tiers = parseJson(p.priceTiersJson);
  const exp = parseJson(p.experienceTypesJson);
  const accepts = parseJson(p.acceptsDietaryJson);
  const partnerAvailKeys = parseJson(p.availabilityKeysJson);
  const scheduleSlots = getAllocationScheduleSlots(p.scheduleJson ?? null);

  const committedSeats = opts.allocationSeatCounts?.get(p.id) ?? 0;

  const regionKeys = [...new Set(regs.map((r) => r.regionKey).filter(Boolean))] as string[];
  const regionKey = regionKeys.length === 1 ? regionKeys[0]! : regionKeys[0] ?? null;
  if (regionKeys.length > 1) {
    alerts.push("Mesa com regiões distintas na reserva — revisar antes de alocar restaurante.");
  }

  const budgetLists = regs.map((r) => r.budgetTiers).filter((b) => b.length > 0);
  const budgetIntersection = budgetLists.length > 0 ? intersectAllBudgetTiers(budgetLists) : [];
  const dietaryUnion = unionDietaryTypes(regs);

  const tableSeats = opts.tableSeatCount ?? members.length;
  const seatsMax = p.seatsPerTableMax ?? 6;
  const used = opts.allocationCounts?.get(p.id) ?? 0;
  const cap = p.tableCapacity ?? 10;
  const maxVenueSeats = cap * seatsMax;

  const snap = (): OperationalCapacitySnapshot => ({
    tablesAllocatedBeforePick: used,
    tableCapacityLimit: cap,
    seatsCommittedBeforePick: committedSeats,
    seatCapacityEstimate: maxVenueSeats,
  });

  if (tableSeats > seatsMax) {
    return {
      total: HARD_FAIL_SCORE,
      parts: {
        fitBudget: 0,
        fitRegion: 0,
        fitDiet: 0,
        fitExperience: 0,
        fitSchedule: 0,
        fitAvailability: 0,
        fitCapacity: 0,
        fitTableProfile: 0,
        aggregateScore: 0,
        positiveReasons: [],
        operationalSnapshot: snap(),
      },
      hardFail: `Mesa com ${tableSeats} lugares — parceiro aceita no máximo ${seatsMax} por mesa.`,
    };
  }

  if (maxVenueSeats > 0 && committedSeats + tableSeats > maxVenueSeats) {
    return {
      total: HARD_FAIL_SCORE,
      parts: {
        fitBudget: 0,
        fitRegion: 0,
        fitDiet: 0,
        fitExperience: 0,
        fitSchedule: 0,
        fitAvailability: 0,
        fitCapacity: 0,
        fitTableProfile: 0,
        aggregateScore: 0,
        positiveReasons: [],
        operationalSnapshot: snap(),
      },
      hardFail: `Lugares comprometidos (${committedSeats}) + esta mesa (${tableSeats}) ultrapassam o limite teórico (${maxVenueSeats}) para ${p.name}.`,
    };
  }

  let fitCapacity = 100;
  if (used >= cap) {
    return {
      total: HARD_FAIL_SCORE,
      parts: {
        fitBudget: 0,
        fitRegion: 0,
        fitDiet: 0,
        fitExperience: 0,
        fitSchedule: 0,
        fitAvailability: 0,
        fitCapacity: 0,
        fitTableProfile: 0,
        aggregateScore: 0,
        positiveReasons: [],
        operationalSnapshot: snap(),
      },
      hardFail: `Lotação operacional esgotada neste evento (${used}/${cap} mesas já atribuídas a ${p.name}).`,
    };
  }
  if (used >= cap - 1) {
    fitCapacity = 55;
    alerts.push(`Parceiro ${p.name} próximo do limite de mesas simultâneas neste evento (${used + 1}/${cap}).`);
  } else {
    positiveReasons.push(`Capacidade: ${used}/${cap} mesas já alocadas a este parceiro neste evento.`);
  }

  if (maxVenueSeats > 0) {
    const seatAfter = committedSeats + tableSeats;
    const seatRatio = seatAfter / maxVenueSeats;
    if (seatRatio > 0.88) {
      fitCapacity = Math.min(fitCapacity, 58);
      alerts.push(`Alta pressão de lugares no parceiro neste evento (${seatAfter}/${maxVenueSeats} lugares no limite teórico).`);
    }
    if (committedSeats > 0 || used > 0) {
      positiveReasons.push(`Lugares já ocupados neste parceiro (evento): ${committedSeats} · mesas: ${used}/${cap}.`);
    }
  }

  let fitExperience = 70;
  if (exp.length > 0) {
    fitExperience = exp.includes(eventType) || exp.includes("*") ? 100 : 35;
    if (fitExperience >= 90) positiveReasons.push("Tipo de evento está dentro da experiência que o parceiro comporta.");
  }

  let fitRegion = 75;
  if (p.regionKey && regionKey) {
    fitRegion = p.regionKey === regionKey ? 100 : 20;
    if (fitRegion >= 90) positiveReasons.push("Região da reserva coincide com a zona operacional do parceiro.");
  } else if (regionKey && !p.regionKey) {
    fitRegion = 80;
  }

  let fitBudget = 70;
  if (budgetIntersection.length > 0) {
    const ok = budgetIntersection.some((t) => tiers.includes(t));
    fitBudget = ok ? 100 : 25;
    if (ok) positiveReasons.push("Faixa de gasto da noite (interseção do grupo) cruza com o ticket do parceiro.");
  } else if (budgetLists.length === 0) {
    fitBudget = 72;
  }

  const fitDiet = dietaryAccepted(accepts, dietaryUnion) ? 100 : 15;
  if (dietaryUnion.length > 0 && fitDiet >= 90) {
    positiveReasons.push("Restrições alimentares do grupo são aceitas pelo parceiro.");
  }

  const sched = evaluateScheduleForEvent(p.scheduleJson ?? null, opts.eventStartsAt ?? null);
  const fitSchedule = sched.ok ? 100 : 22;
  if (sched.ok && scheduleSlots.length > 0) positiveReasons.push(sched.detail);

  const memberUnion = unionMemberAvailability(regs);
  const avail = availabilityFit(partnerAvailKeys, memberUnion, regs);
  const fitAvailability = avail.score;
  if (avail.alert) alerts.push(avail.alert);
  if (avail.score >= 90) positiveReasons.push(avail.detail);

  const expTable = tableExperienceFit(members, p, eventType);
  const fitTableProfile = expTable.score;
  if (expTable.score >= 72) positiveReasons.push(expTable.detail);

  const total = Math.round(
    fitBudget * 0.2 +
      fitRegion * 0.18 +
      fitDiet * 0.18 +
      fitExperience * 0.12 +
      fitSchedule * 0.1 +
      fitAvailability * 0.08 +
      fitCapacity * 0.07 +
      fitTableProfile * 0.07,
  );

  return {
    total,
    parts: {
      fitBudget,
      fitRegion,
      fitDiet,
      fitExperience,
      fitSchedule,
      fitAvailability,
      fitCapacity,
      fitTableProfile,
      aggregateScore: total,
      positiveReasons,
      operationalSnapshot: snap(),
    },
    hardFail: sched.ok ? null : sched.detail,
  };
}

/**
 * Escolhe restaurante parceiro para a mesa com base no evento, reservas, perfil agregado, agenda, disponibilidade e capacidade.
 * Retorna null quando não há parceiro viável — a curadoria humana decide depois.
 */
export type RestaurantReservationAuditContext = {
  eventStartsAt?: Date | null;
  scheduleJson?: string | null;
  /** Contagem de mesas deste parceiro no evento (para saturação). */
  tablesAllocatedInEvent?: number;
  tableCapacity?: number;
  seatsCommittedInEvent?: number;
  active?: boolean;
};

/** Verificação leve para alertas no admin (atribuição manual vs reserva). */
export function quickRestaurantReservationAudit(
  partner: Pick<
    PartnerRestaurantPickInput,
    | "regionKey"
    | "acceptsDietaryJson"
    | "priceTiersJson"
    | "seatsPerTableMax"
    | "scheduleJson"
    | "tableCapacity"
    | "active"
    | "availabilityKeysJson"
  > | null,
  regs: MovReservationContext[],
  tableSeatCount: number,
  ctx?: RestaurantReservationAuditContext,
): { ok: boolean; reasons: string[]; labels: string[] } {
  const reasons: string[] = [];
  const labels: string[] = [];
  if (!partner) return { ok: true, reasons: [], labels: [] };
  if (partner.active === false) {
    reasons.push("Parceiro inativo — não deve receber novas atribuições automáticas.");
    labels.push("parceiro-inativo");
  }
  const seatsMax = partner.seatsPerTableMax ?? 6;
  if (tableSeatCount > seatsMax) {
    reasons.push(`Mesa com ${tableSeatCount} lugares — parceiro aceita no máximo ${seatsMax}.`);
    labels.push("lugares-mesa");
  }
  const accepts = parseJson(partner.acceptsDietaryJson);
  const dietaryUnion = unionDietaryTypes(regs);
  if (dietaryUnion.length > 0 && !dietaryAccepted(accepts, dietaryUnion)) {
    reasons.push("Dieta / restrições do grupo não cobertas pelo parceiro.");
    labels.push("dieta");
  }
  const regionKeys = [...new Set(regs.map((r) => r.regionKey).filter(Boolean))] as string[];
  if (partner.regionKey && regionKeys.length === 1 && regionKeys[0] !== partner.regionKey) {
    reasons.push("Região da reserva não coincide com a zona do parceiro.");
    labels.push("regiao");
  }
  if (regionKeys.length > 1) {
    reasons.push("Participantes com regiões distintas na mesma mesa.");
    labels.push("regiao-mista");
  }
  const budgetLists = regs.map((r) => r.budgetTiers).filter((b) => b.length > 0);
  const budgetIntersection = budgetLists.length > 0 ? intersectAllBudgetTiers(budgetLists) : [];
  const tiers = parseJson(partner.priceTiersJson);
  if (budgetIntersection.length > 0 && !budgetIntersection.some((t) => tiers.includes(t))) {
    reasons.push("Faixa de gasto da noite incompatível com o ticket declarado do parceiro.");
    labels.push("orcamento");
  }

  const schedHint =
    ctx?.eventStartsAt != null
      ? evaluateScheduleForEvent(ctx.scheduleJson ?? partner.scheduleJson ?? null, ctx.eventStartsAt)
      : null;
  if (schedHint && !schedHint.ok) {
    reasons.push(schedHint.detail);
    labels.push("agenda");
  }

  const cap = ctx?.tableCapacity ?? partner.tableCapacity ?? 10;
  const usedT = ctx?.tablesAllocatedInEvent ?? undefined;
  if (typeof usedT === "number" && usedT >= cap) {
    reasons.push(`Limite de mesas do parceiro neste evento atingido (${usedT}/${cap}).`);
    labels.push("capacidade-mesas");
  }
  const maxS = cap * (partner.seatsPerTableMax ?? 6);
  const usedS = ctx?.seatsCommittedInEvent;
  if (typeof usedS === "number" && maxS > 0 && usedS >= maxS) {
    reasons.push(`Limite teórico de lugares no parceiro neste evento (${usedS}/${maxS}).`);
    labels.push("capacidade-lugares");
  }

  const partnerAvailKeys = parseJson(partner.availabilityKeysJson);
  const memberUnion = unionMemberAvailability(regs);
  if (partnerAvailKeys.length > 0) {
    if (memberUnion.size === 0) {
      reasons.push(
        "Participantes sem turnos de disponibilidade na reserva — não cruza com as chaves operacionais do parceiro.",
      );
      labels.push("disponibilidade");
    } else {
      const hit = partnerAvailKeys.some((k) => memberUnion.has(k));
      if (!hit) {
        reasons.push(
          "Turnos declarados na reserva não coincidem com as chaves de disponibilidade do parceiro.",
        );
        labels.push("disponibilidade");
      }
    }
  }

  const uniqueLabels = [...new Set(labels)];
  return { ok: reasons.length === 0, reasons, labels: uniqueLabels };
}

export function pickPartnerRestaurantForTable(
  eventType: string,
  members: MovMatchingCandidate[],
  partners: PartnerRestaurantPickInput[],
  opts: RestaurantPickOptions = {},
): RestaurantPickResult {
  const alerts: string[] = [];
  const regs = members.map((m) => m.reservation).filter(Boolean) as NonNullable<(typeof members)[number]["reservation"]>[];

  const regionKeys = [...new Set(regs.map((r) => r.regionKey).filter(Boolean))] as string[];
  if (regionKeys.length > 1) {
    alerts.push("Mesa com regiões distintas na reserva — revisar antes de alocar restaurante.");
  }

  const active = partners.filter((p) => p.active);
  let best: { p: PartnerRestaurantPickInput; total: number; parts: ReturnType<typeof scorePartner>["parts"] } | null = null;
  const rejectionSummary: string[] = [];
  const successfulRanking: { name: string; total: number }[] = [];

  for (const p of active) {
    const scored = scorePartner(eventType, members, p, opts, regs);
    if (scored.hardFail) {
      rejectionSummary.push(`${p.name}: ${scored.hardFail}`);
      continue;
    }
    successfulRanking.push({ name: p.name, total: scored.total });
    if (!best || scored.total > best.total) {
      best = { p, total: scored.total, parts: scored.parts };
    }
  }

  successfulRanking.sort((a, b) => b.total - a.total);
  const winnerName = best?.p.name;
  const runnerUpNotes =
    successfulRanking.length > 1 && winnerName
      ? successfulRanking.filter((r) => r.name !== winnerName).slice(0, 3).map((r) => `${r.name} (${r.total})`)
      : undefined;

  const budgetLists = regs.map((r) => r.budgetTiers).filter((b) => b.length > 0);
  const budgetIntersection = budgetLists.length > 0 ? intersectAllBudgetTiers(budgetLists) : [];
  const dietaryUnion = unionDietaryTypes(regs);

  if (!best || best.total < 48) {
    return {
      restaurantId: null,
      restaurantName: null,
      line: "Nenhum restaurante parceiro atende de forma segura a região, orçamento, disponibilidade, agenda e restrições desta mesa — escolha manual necessária.",
      alerts,
      positiveReasons: [],
      rejectionSummary: rejectionSummary.slice(0, 6),
      fitBudget: budgetIntersection.length ? 40 : 70,
      fitRegion: regionKeys.length ? 50 : 70,
      fitDiet: dietaryUnion.length ? 40 : 90,
      fitExperience: 50,
      fitSchedule: 55,
      fitAvailability: 55,
      fitCapacity: 50,
      fitTableProfile: 55,
      aggregateScore: best?.total ?? 0,
      runnerUpNotes,
    };
  }

  const br = best.p;
  const acceptsBest = parseJson(br.acceptsDietaryJson);
  if (dietaryUnion.length > 0 && !dietaryAccepted(acceptsBest, dietaryUnion)) {
    alerts.push("O restaurante escolhido pode não cobrir todas as restrições alimentares — rever antes de confirmar.");
  }

  const reasons = [...new Set([...best.parts.positiveReasons])];
  const line = `Restaurante sugerido: ${br.name} — fit operacional ${best.total}/100 (orçamento, região, dieta, experiência, agenda, disponibilidade, capacidade e estilo de mesa).`;

  return {
    restaurantId: br.id,
    restaurantName: br.name,
    line,
    alerts,
    positiveReasons: reasons,
    rejectionSummary: rejectionSummary.slice(0, 4),
    runnerUpNotes,
    fitBudget: best.parts.fitBudget,
    fitRegion: best.parts.fitRegion,
    fitDiet: best.parts.fitDiet,
    fitExperience: best.parts.fitExperience,
    fitSchedule: best.parts.fitSchedule,
    fitAvailability: best.parts.fitAvailability,
    fitCapacity: best.parts.fitCapacity,
    fitTableProfile: best.parts.fitTableProfile,
    aggregateScore: best.total,
    operationalSnapshot: best.parts.operationalSnapshot,
  };
}
