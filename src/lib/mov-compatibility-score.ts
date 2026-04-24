import { DEFAULT_MOV_MATCHING_CONFIG, normalizeWeightMap, type MovMatchingConfig } from "@/lib/mov-matching-config";
import { computeOperationalPairScore, evaluateReservationPairHard } from "@/lib/mov-operational-score";
import type { MovReservationContext } from "@/lib/mov-reservation-context";
import type { MovMatchingProfile } from "@/lib/mov-matching-profile";

export type MovPairSubScoreKey =
  | "valuesVision"
  | "socialEnergy"
  | "relationalDepth"
  | "communicationStyle"
  | "lifeStage"
  | "professionArea"
  | "budgetFit"
  | "dietFit"
  | "availability"
  | "practicalFit"
  | "location"
  | "interests";

export type MovPairSubScore = {
  key: MovPairSubScoreKey;
  score: number;
  weight: number;
  contribution: number;
};

export type MovPairHardRuleResult = {
  isAllowed: boolean;
  reasons: string[];
};

export type MovPairCompatibility = {
  score: number;
  band: "forte" | "media" | "fraca";
  subScores: MovPairSubScore[];
  hardRules: MovPairHardRuleResult;
  topPositives: string[];
  topAlerts: string[];
};

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function similarityFromDistance(a: number | null, b: number | null): number {
  if (a === null || b === null) return 0.5;
  return clamp01(1 - Math.abs(a - b) / 100);
}

function enumMatch(a: string | null, b: string | null, fallback: number = 0.5): number {
  if (!a || !b) return fallback;
  return a === b ? 1 : 0.35;
}

function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size === 0 || sb.size === 0) return 0.5;
  let intersection = 0;
  for (const i of sa) if (sb.has(i)) intersection += 1;
  const union = new Set([...sa, ...sb]).size || 1;
  return intersection / union;
}

function lifeStageScore(a: MovMatchingProfile, b: MovMatchingProfile): number {
  if (a.age === null || b.age === null) return enumMatch(a.lifeStage, b.lifeStage);
  const delta = Math.abs(a.age - b.age);
  if (delta <= 4) return 1;
  if (delta <= 8) return 0.8;
  if (delta <= 15) return 0.55;
  if (delta <= 24) return 0.35;
  return 0.15;
}

export function evaluatePairHardRules(
  a: MovMatchingProfile,
  b: MovMatchingProfile,
  config: MovMatchingConfig = DEFAULT_MOV_MATCHING_CONFIG,
  reservationA: MovReservationContext | null = null,
  reservationB: MovReservationContext | null = null,
): MovPairHardRuleResult {
  const reasons: string[] = [];
  if (a.age !== null && b.age !== null && Math.abs(a.age - b.age) > config.hardRules.maxAgeGapYears) {
    reasons.push(`Diferença etária acima de ${config.hardRules.maxAgeGapYears} anos.`);
  }
  if (config.hardRules.requireSameCityForAuto && a.city && b.city && a.city !== b.city) {
    reasons.push("Cidades incompatíveis para alocação automática.");
  }
  const op = evaluateReservationPairHard(reservationA, reservationB);
  reasons.push(...op.reasons);
  return { isAllowed: reasons.length === 0, reasons };
}

export function computePairCompatibility(
  a: MovMatchingProfile,
  b: MovMatchingProfile,
  config: MovMatchingConfig = DEFAULT_MOV_MATCHING_CONFIG,
  reservationA: MovReservationContext | null = null,
  reservationB: MovReservationContext | null = null,
): MovPairCompatibility {
  const hardRules = evaluatePairHardRules(a, b, config, reservationA, reservationB);
  const weightMap = normalizeWeightMap(config.weights);

  const valueByKey: Record<MovPairSubScoreKey, number> = {
    valuesVision: similarityFromDistance(a.valuesVision, b.valuesVision),
    socialEnergy: similarityFromDistance(a.socialEnergy, b.socialEnergy),
    relationalDepth: similarityFromDistance(a.relationalDepth, b.relationalDepth),
    communicationStyle: similarityFromDistance(a.communicationStyle, b.communicationStyle),
    lifeStage: lifeStageScore(a, b),
    professionArea: enumMatch(a.sector, b.sector),
    budgetFit: enumMatch(a.investmentBand, b.investmentBand),
    dietFit: enumMatch(a.dietPreference, b.dietPreference),
    availability: enumMatch(a.availability, b.availability),
    practicalFit: similarityFromDistance(a.practicalFit, b.practicalFit),
    location: enumMatch(a.city, b.city),
    interests: jaccard(a.interestsVector, b.interestsVector),
  };

  const subScores: MovPairSubScore[] = weightMap.map((w) => {
    const score = valueByKey[w.key] ?? 0.5;
    return {
      key: w.key,
      score: Math.round(score * 100),
      weight: w.w,
      contribution: score * w.w,
    };
  });

  const weighted = subScores.reduce((acc, s) => acc + s.contribution, 0);
  let score = Math.round(weighted * 100);
  if (reservationA && reservationB) {
    const op = computeOperationalPairScore(reservationA, reservationB);
    score = Math.round(score * 0.62 + op.score * 0.38);
  }
  const band = score >= 74 ? "forte" : score >= 55 ? "media" : "fraca";

  const ordered = [...subScores].sort((x, y) => y.contribution - x.contribution);
  const worst = [...subScores].sort((x, y) => x.contribution - y.contribution);
  const topPositives = ordered.slice(0, 3).map((s) => `Boa aderência em ${s.key} (${s.score}%).`);
  const topAlerts = [...hardRules.reasons, ...worst.slice(0, 2).map((s) => `Atenção em ${s.key} (${s.score}%).`)];

  return { score, band, subScores, hardRules, topPositives, topAlerts };
}
