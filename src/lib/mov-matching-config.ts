export type MatchingWeights = {
  valuesVision: number;
  socialEnergy: number;
  relationalDepth: number;
  communicationStyle: number;
  lifeStage: number;
  professionArea: number;
  budgetFit: number;
  dietFit: number;
  availability: number;
  practicalFit: number;
  location: number;
  interests: number;
};

export type MatchingHardRules = {
  requireReadyState: boolean;
  enforceMaxMesaSize: boolean;
  maxMesaSize: number;
  maxAgeGapYears: number;
  maxTableAgeSpreadYears: number;
  requireSameCityForAuto: boolean;
};

export type MatchingBalanceRules = {
  targetTableSize: number;
  minTableSize: number;
  socialEnergySpreadTolerance: number;
  diversitySoftBonus: number;
  similaritySoftBonus: number;
};

export type MovMatchingConfig = {
  version: number;
  weights: MatchingWeights;
  hardRules: MatchingHardRules;
  balance: MatchingBalanceRules;
};

export const DEFAULT_MOV_MATCHING_CONFIG: MovMatchingConfig = {
  version: 1,
  weights: {
    valuesVision: 1.1,
    socialEnergy: 1.4,
    relationalDepth: 1.1,
    communicationStyle: 0.8,
    lifeStage: 0.8,
    professionArea: 0.7,
    budgetFit: 0.8,
    dietFit: 0.6,
    availability: 0.8,
    practicalFit: 1.0,
    location: 0.7,
    interests: 0.7,
  },
  hardRules: {
    requireReadyState: true,
    enforceMaxMesaSize: true,
    maxMesaSize: 6,
    maxAgeGapYears: 24,
    maxTableAgeSpreadYears: 26,
    requireSameCityForAuto: false,
  },
  balance: {
    targetTableSize: 6,
    minTableSize: 4,
    socialEnergySpreadTolerance: 42,
    diversitySoftBonus: 0.12,
    similaritySoftBonus: 0.08,
  },
};

export function normalizeWeightMap(weights: MatchingWeights): { key: keyof MatchingWeights; w: number }[] {
  const list: { key: keyof MatchingWeights; w: number }[] = Object.entries(weights).map(([key, val]) => ({
    key: key as keyof MatchingWeights,
    w: Math.max(0, Number(val) || 0),
  }));
  const sum = list.reduce((acc, i) => acc + i.w, 0) || 1;
  return list.map((i) => ({ key: i.key, w: i.w / sum }));
}
