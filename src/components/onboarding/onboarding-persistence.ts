/**
 * Persistência local do onboarding — chave versionada para evoluir sem quebrar migrações futuras.
 * Não usa mais mov_onboarding_complete_v1: o acesso ao app é só após cadastro/login (fora deste módulo).
 */

import { ONBOARDING_STEPS } from "./onboarding-config";
import type { OnboardingPersistedState } from "./onboarding-types";

export const ONBOARDING_STORAGE_KEY = "mov_onboarding_state_v4";

const MAX_STEP_INDEX = ONBOARDING_STEPS.length - 1;

/** Índice 0-based do passo `id_country` na jornada v4 (removido na v5). */
const LEGACY_V4_COUNTRY_STEP_INDEX = 25;

/** Migra estado v4 → v5: remove `id_country` e recalcula `stepIndex` após exclusão do passo. */
function migrateV4ToV5(raw: Record<string, unknown>): Record<string, unknown> {
  const answers = { ...((raw.answers as Record<string, string>) || {}) };
  delete answers.id_country;
  let stepIndex = Number(raw.stepIndex);
  if (Number.isInteger(stepIndex) && stepIndex > LEGACY_V4_COUNTRY_STEP_INDEX) {
    stepIndex -= 1;
  }
  return {
    ...raw,
    v: 5,
    answers,
    stepIndex,
  };
}

function validatePersistedState(raw: unknown): OnboardingPersistedState | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.v !== 5) return null;
  const stepIndex = Number(o.stepIndex);
  if (!Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex > MAX_STEP_INDEX) return null;
  const answers = o.answers;
  if (typeof answers !== "object" || answers === null || Array.isArray(answers)) return null;
  for (const v of Object.values(answers)) {
    if (typeof v !== "string") return null;
  }
  const cityRaw = o.city;
  let city: { id: string; name: string } | null = null;
  if (cityRaw !== null && cityRaw !== undefined) {
    if (typeof cityRaw !== "object" || Array.isArray(cityRaw)) return null;
    const c = cityRaw as Record<string, unknown>;
    if (typeof c.id !== "string" || typeof c.name !== "string") return null;
    city = { id: c.id, name: c.name };
  }
  const updatedAt = typeof o.updatedAt === "string" ? o.updatedAt : new Date().toISOString();
  return {
    v: 5,
    stepIndex,
    answers: answers as Record<string, string>,
    city,
    updatedAt,
  };
}

/** Estado com progresso real (passou do passo inicial ou tem respostas). */
export function shouldOfferResume(state: OnboardingPersistedState | null): boolean {
  if (!state) return false;
  return state.stepIndex > 0 || Object.keys(state.answers).length > 0;
}

/** Removido do fluxo — ainda limpo do storage se existir (evita bypass antigo). */
const LEGACY_COMPLETE_KEY = "mov_onboarding_complete_v1";
const LEGACY_PROGRESS_KEY = "mov_onboarding_progress_v1";
const LEGACY_CITY_KEY = "mov_onboarding_city_v1";
const PREVIOUS_STATE_V2_KEY = "mov_onboarding_state_v2";
const PREVIOUS_STATE_V3_KEY = "mov_onboarding_state_v3";

function discardObsoleteStateKeys(): void {
  try {
    localStorage.removeItem(PREVIOUS_STATE_V2_KEY);
    localStorage.removeItem(PREVIOUS_STATE_V3_KEY);
    localStorage.removeItem(LEGACY_COMPLETE_KEY);
  } catch {
    /* ignore */
  }
}

export function loadOnboardingState(): OnboardingPersistedState | null {
  try {
    discardObsoleteStateKeys();
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return tryMigrateFromLegacy();
    let p: unknown;
    try {
      p = JSON.parse(raw);
    } catch {
      try {
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return null;
    }
    const rec = p as Record<string, unknown>;
    const toValidate = rec.v === 4 ? migrateV4ToV5(rec) : p;
    const validated = validatePersistedState(toValidate);
    if (!validated) {
      try {
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return null;
    }
    if (rec.v === 4) {
      saveOnboardingState(validated);
    }
    return validated;
  } catch {
    return null;
  }
}

function tryMigrateFromLegacy(): OnboardingPersistedState | null {
  try {
    const prog = localStorage.getItem(LEGACY_PROGRESS_KEY);
    if (!prog) return null;
    const cityRaw = localStorage.getItem(LEGACY_CITY_KEY);
    let city: { id: string; name: string } | null = { id: "sp", name: "São Paulo" };
    if (cityRaw) {
      const c = JSON.parse(cityRaw) as { id?: string; name?: string };
      if (c?.id && c?.name) city = { id: c.id, name: c.name };
    }
    const migrated: OnboardingPersistedState = {
      v: 5,
      stepIndex: 0,
      answers: {},
      city,
      updatedAt: new Date().toISOString(),
    };
    const validated = validatePersistedState(migrated);
    if (!validated) return null;
    saveOnboardingState(validated);
    localStorage.removeItem(LEGACY_PROGRESS_KEY);
    return validated;
  } catch {
    return null;
  }
}

export function saveOnboardingState(state: OnboardingPersistedState): void {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function clearOnboardingState(): void {
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(LEGACY_PROGRESS_KEY);
    localStorage.removeItem(PREVIOUS_STATE_V2_KEY);
    localStorage.removeItem(PREVIOUS_STATE_V3_KEY);
    localStorage.removeItem(LEGACY_COMPLETE_KEY);
  } catch {
    /* ignore */
  }
}

/** Limpa estado local do questionário; não marca “completo” nem concede acesso ao app. */
export function markOnboardingFinished(): void {
  clearOnboardingState();
}
