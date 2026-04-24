/**
 * Formação de mesas para curadoria (compatibilidade entre pessoas).
 *
 * - **Perfil** entra no par de compatibilidade; **reserva** (quando existe) endurece regras operacionais no par.
 * - **Restaurante parceiro** não é escolhido aqui — ver `mov-restaurant-allocation.ts`.
 * - `suggestTablesByCompatibility` gera mesas até 6 lugares; `explainUserFitInTable` explica o encaixe de um membro no grupo.
 */
import { DEFAULT_MOV_MATCHING_CONFIG, type MovMatchingConfig } from "@/lib/mov-matching-config";
import { computePairCompatibility } from "@/lib/mov-compatibility-score";
import type { MovReservationContext } from "@/lib/mov-reservation-context";
import type { MovMatchingProfile } from "@/lib/mov-matching-profile";

export type MovMatchingCandidate = {
  userId: string;
  profile: MovMatchingProfile;
  /** Contexto da reserva/inscrição no evento — ausente na curadoria “global”. */
  reservation: MovReservationContext | null;
};

export type TableLevelScores = {
  affinity: number;
  healthyDiversity: number;
  socialFluency: number;
  practicalViability: number;
  finalScore: number;
};

export type TableCompositionExplanation = {
  line: string;
  alert: string | null;
  level: "alto" | "medio" | "baixo";
  scores: TableLevelScores;
};

export type SuggestedTable = {
  userIds: string[];
  explanation: TableCompositionExplanation;
};

function combinations<T>(arr: T[]): [T, T][] {
  const out: [T, T][] = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      out.push([arr[i]!, arr[j]!] as [T, T]);
    }
  }
  return out;
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function evaluateTable(candidates: MovMatchingCandidate[], config: MovMatchingConfig): TableCompositionExplanation {
  if (candidates.length <= 1) {
    const score = 60;
    return {
      line: "Mesa em formação inicial; ainda sem pares suficientes para avaliar a dinâmica.",
      alert: null,
      level: "medio",
      scores: {
        affinity: score,
        healthyDiversity: score,
        socialFluency: score,
        practicalViability: score,
        finalScore: score,
      },
    };
  }

  const pairs = combinations(candidates);
  const pairScores = pairs.map(([a, b]) =>
    computePairCompatibility(a.profile, b.profile, config, a.reservation, b.reservation),
  );
  const hardViolations = pairScores.flatMap((p) => p.hardRules.reasons);
  const affinity = Math.round(avg(pairScores.map((p) => p.score)));

  const energies = candidates.map((c) => c.profile.socialEnergy).filter((n): n is number => n !== null);
  const spread = energies.length > 1 ? Math.max(...energies) - Math.min(...energies) : 0;
  const socialFluency = Math.round(100 - clamp(Math.abs(spread - 24) * 1.4, 0, 60));

  const sectors = new Set(candidates.map((c) => c.profile.sector).filter(Boolean));
  const healthyDiversity = clamp(45 + sectors.size * 8 + (spread > 12 && spread < 55 ? 12 : 0), 0, 100);

  const citySet = new Set(candidates.map((c) => c.profile.city).filter(Boolean));
  let practicalViability = citySet.size <= 1 ? 92 : citySet.size === 2 ? 78 : 62;
  const regions = new Set(candidates.map((c) => c.reservation?.regionKey).filter(Boolean) as string[]);
  if (regions.size > 1) practicalViability = Math.min(practicalViability, 55);
  const budgets = candidates.map((c) => c.reservation?.budgetTiers ?? []).filter((b) => b.length > 0);
  if (budgets.length >= 2) {
    const inter = budgets.reduce((acc, cur) => acc.filter((x) => cur.includes(x)), budgets[0]!);
    if (inter.length === 0) practicalViability = Math.min(practicalViability, 40);
  }

  const finalScore = Math.round(affinity * 0.45 + healthyDiversity * 0.2 + socialFluency * 0.2 + practicalViability * 0.15);
  const level = finalScore >= 78 ? "alto" : finalScore >= 60 ? "medio" : "baixo";

  let line = "Mesa com boa fluidez potencial e afinidade equilibrada.";
  if (level === "alto") line = "Mesa forte: afinidade alta com diversidade saudável e boa chance de conversa leve.";
  if (level === "baixo") line = "Mesa com sinais de fricção; recomenda-se ajuste manual antes de finalizar.";

  let alert: string | null = null;
  if (hardViolations.length > 0) {
    alert = hardViolations[0]!;
  } else if (spread > config.balance.socialEnergySpreadTolerance) {
    alert = "Dispersão de energia social alta; pode exigir facilitação ativa.";
  } else if (practicalViability < 70) {
    alert = "Viabilidade prática moderada (cidade/região heterogênea).";
  }

  return {
    line,
    alert,
    level,
    scores: {
      affinity,
      healthyDiversity: Math.round(healthyDiversity),
      socialFluency,
      practicalViability,
      finalScore,
    },
  };
}

function incrementalScore(
  table: MovMatchingCandidate[],
  candidate: MovMatchingCandidate,
  config: MovMatchingConfig,
): { score: number; blocked: boolean; reason: string | null } {
  if (table.length === 0) return { score: 80, blocked: false, reason: null };
  const pairScores = table.map((p) =>
    computePairCompatibility(candidate.profile, p.profile, config, candidate.reservation, p.reservation),
  );
  const hard = pairScores.find((p) => !p.hardRules.isAllowed);
  if (hard) {
    return { score: -9999, blocked: true, reason: hard.hardRules.reasons[0] ?? "Regra dura." };
  }
  const avgPair = avg(pairScores.map((p) => p.score));
  const prospective = evaluateTable([...table, candidate], config).scores.finalScore;
  return { score: avgPair * 0.6 + prospective * 0.4, blocked: false, reason: null };
}

export function suggestTablesByCompatibility(
  candidates: MovMatchingCandidate[],
  config: MovMatchingConfig = DEFAULT_MOV_MATCHING_CONFIG,
): SuggestedTable[] {
  if (candidates.length === 0) return [];
  const maxSize = config.hardRules.maxMesaSize;
  const nTables = Math.max(1, Math.ceil(candidates.length / maxSize));
  const tables: MovMatchingCandidate[][] = Array.from({ length: nTables }, () => []);

  const sorted = [...candidates].sort((a, b) => {
    const av = a.profile.socialEnergy ?? 50;
    const bv = b.profile.socialEnergy ?? 50;
    return bv - av;
  });

  sorted.forEach((cand) => {
    let bestIdx = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < tables.length; i++) {
      const t = tables[i]!;
      if (t.length >= maxSize) continue;
      const evalNext = incrementalScore(t, cand, config);
      if (evalNext.blocked) continue;
      if (evalNext.score > bestScore) {
        bestScore = evalNext.score;
        bestIdx = i;
      }
    }
    if (bestIdx < 0) {
      const fallback = tables.findIndex((t) => t.length < maxSize);
      if (fallback >= 0) tables[fallback]!.push(cand);
      return;
    }
    tables[bestIdx]!.push(cand);
  });

  return tables
    .filter((t) => t.length > 0)
    .map((t) => ({
      userIds: t.map((u) => u.userId),
      explanation: evaluateTable(t, config),
    }));
}

export function explainUserFitInTable(
  user: MovMatchingCandidate,
  tablePeers: MovMatchingCandidate[],
  config: MovMatchingConfig = DEFAULT_MOV_MATCHING_CONFIG,
): { line: string; attention: string | null; score: number } {
  if (tablePeers.length === 0) return { line: "Base de mesa criada; aguardando pares para justificar aderência.", attention: null, score: 60 };
  const scores = tablePeers.map((p) =>
    computePairCompatibility(user.profile, p.profile, config, user.reservation, p.reservation),
  );
  const score = Math.round(avg(scores.map((s) => s.score)));
  const best = scores.flatMap((s) => s.topPositives).slice(0, 2);
  const alerts = scores.flatMap((s) => s.topAlerts).filter(Boolean);
  return {
    line: best.length > 0 ? best.join(" ") : "Aderência moderada baseada em múltiplos fatores.",
    attention: alerts.length > 0 ? alerts[0]! : null,
    score,
  };
}
