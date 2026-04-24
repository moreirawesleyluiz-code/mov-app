import { deriveCompatibilityAxes, type CompatibilityAxesPayload } from "@/lib/compatibility-axes";

export type MovLifeStage = "18_24" | "25_34" | "35_44" | "45_plus" | "unknown";
export type MovEnergyBand = "calmo" | "equilibrado" | "expansivo" | "unknown";

export type MovMatchingProfile = {
  schemaVersion: 1;
  age: number | null;
  ageBand: MovLifeStage;
  lifeStage: MovLifeStage;
  city: string | null;
  sector: string | null;
  gender: string | null;
  relationshipStatus: string | null;
  hasChildren: boolean | null;
  investmentBand: string | null;
  dietPreference: string | null;
  availability: string | null;
  socialEnergy: number | null;
  relationalDepth: number | null;
  communicationStyle: number | null;
  valuesVision: number | null;
  practicalFit: number | null;
  interestsVector: string[];
  energyBand: MovEnergyBand;
  compatibilityAxes: CompatibilityAxesPayload;
};

export type MovMatchingProfileBuildInput = {
  answers: Record<string, string>;
  cityName?: string | null;
};

type StoredCompatibilityEnvelope = {
  movMatchingProfile?: MovMatchingProfile;
};

function normalizePct(v: number | null): number | null {
  if (v === null || Number.isNaN(v)) return null;
  return Math.round(Math.max(0, Math.min(1, v)) * 100);
}

function parseAgeYears(isoDate: string | undefined): number | null {
  if (!isoDate) return null;
  const birth = new Date(`${isoDate}T12:00:00.000Z`);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const mNow = now.getUTCMonth();
  const mBirth = birth.getUTCMonth();
  if (mNow < mBirth || (mNow === mBirth && now.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }
  if (age < 0 || age > 120) return null;
  return age;
}

function ageBandFromYears(age: number | null): MovLifeStage {
  if (age === null) return "unknown";
  if (age <= 24) return "18_24";
  if (age <= 34) return "25_34";
  if (age <= 44) return "35_44";
  return "45_plus";
}

function energyBandFromValue(v: number | null): MovEnergyBand {
  if (v === null) return "unknown";
  if (v < 40) return "calmo";
  if (v > 68) return "expansivo";
  return "equilibrado";
}

function collectInterests(answers: Record<string, string>): string[] {
  const out: string[] = [];
  const push = (val?: string) => {
    if (val && val.trim()) out.push(val.trim());
  };
  push(answers.p_ideal_night);
  push(answers.p_music);
  push(answers.p_cinema);
  push(answers.p_nature_city);
  return [...new Set(out)];
}

function avg(nums: Array<number | null>): number | null {
  const ok = nums.filter((n): n is number => n !== null);
  if (ok.length === 0) return null;
  return ok.reduce((a, b) => a + b, 0) / ok.length;
}

export function buildMovMatchingProfile(input: MovMatchingProfileBuildInput): MovMatchingProfile {
  const { answers, cityName } = input;
  const axes = deriveCompatibilityAxes(answers);
  const age = parseAgeYears(answers.id_birthday);
  const ageBand = ageBandFromYears(age);
  const lifeStage = ageBand;

  const socialEnergy = normalizePct(avg([axes.sociabilityScore, axes.activityLifestyleScore]));
  const relationalDepth = normalizePct(
    avg([axes.familyImportanceScore, axes.spiritualityImportanceScore, axes.stressScore === null ? null : 1 - axes.stressScore]),
  );
  const communicationStyle = normalizePct(avg([axes.logicEmotionScore, axes.humorScore]));
  const valuesVision = normalizePct(avg([axes.familyImportanceScore, axes.spiritualityImportanceScore, axes.politicsToleranceOrInterestScore]));
  const practicalFit = normalizePct(avg([axes.cityNaturePreferenceScore, axes.activityLifestyleScore]));

  return {
    schemaVersion: 1,
    age,
    ageBand,
    lifeStage,
    city: cityName ?? answers.location ?? null,
    sector: answers.id_sector ?? null,
    gender: answers.id_gender ?? null,
    relationshipStatus: answers.id_relationship ?? null,
    hasChildren: answers.id_children === "sim" ? true : answers.id_children === "nao" ? false : null,
    investmentBand: answers.id_income_band ?? null,
    dietPreference: answers.id_dietary ?? null,
    availability: answers.id_availability ?? null,
    socialEnergy,
    relationalDepth,
    communicationStyle,
    valuesVision,
    practicalFit,
    interestsVector: collectInterests(answers),
    energyBand: energyBandFromValue(socialEnergy),
    compatibilityAxes: axes,
  };
}

export function parseStoredMovMatchingProfile(axesJson: string | null | undefined): MovMatchingProfile | null {
  if (!axesJson) return null;
  try {
    const parsed = JSON.parse(axesJson) as StoredCompatibilityEnvelope;
    if (!parsed.movMatchingProfile) return null;
    if (parsed.movMatchingProfile.schemaVersion !== 1) return null;
    return parsed.movMatchingProfile;
  } catch {
    return null;
  }
}
